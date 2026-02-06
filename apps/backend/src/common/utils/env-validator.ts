import { logger } from '../services/logger.service';

type FormatValidator = (value: string) => string | null;

interface EnvRule {
  key: string;
  required: boolean;
  fallback?: string;
  format?: FormatValidator;
}

const isHex =
  (length: number): FormatValidator =>
  (value) => {
    const regex = new RegExp(`^[0-9a-fA-F]{${length}}$`);
    return regex.test(value)
      ? null
      : `must be a ${length}-character hex string`;
  };

const strongSecret =
  (min: number): FormatValidator =>
  (value) => {
    // 檢查長度
    if (value.length < min) {
      return `must be at least ${min} characters`;
    }

    // 檢查熵值：唯一字符數應該足夠多
    const uniqueChars = new Set(value).size;
    const entropyRatio = uniqueChars / value.length;

    if (entropyRatio < 0.4) {
      // 少於 40% 的唯一字符視為低熵值
      return `has insufficient entropy (${Math.round(entropyRatio * 100)}%). Use a strong random string (e.g., openssl rand -base64 64)`;
    }

    // 警告：檢測常見的弱密鑰模式
    const weakPatterns = [
      /^(.)\1{10,}/, // 重複字符
      /^(abc|123|password|secret|test)/i, // 常見弱字串
      /^your-secret-key/i, // 範例密鑰
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(value)) {
        return 'appears to be a weak or example secret. Generate a strong random key.';
      }
    }

    return null;
  };

const isUrl =
  (protocols: string[]): FormatValidator =>
  (value) => {
    try {
      const url = new URL(value);
      return protocols.includes(url.protocol.replace(':', ''))
        ? null
        : `must use protocol: ${protocols.join(' or ')}`;
    } catch {
      return 'must be a valid URL';
    }
  };

// 驗證 CORS Origin（生產環境必須 HTTPS）
const corsOriginValidator: FormatValidator = (value) => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // 生產環境檢查
  if (nodeEnv === 'production') {
    const origins = value.split(',').map((o) => o.trim());

    for (const origin of origins) {
      // 必須使用 HTTPS
      if (!origin.startsWith('https://')) {
        return `Production CORS must use HTTPS. Found: ${origin}`;
      }

      // 不應包含 localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return `Production CORS should not include localhost. Found: ${origin}`;
      }
    }
  }

  return null;
};

const isPort: FormatValidator = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 65535
    ? null
    : 'must be a valid port (1-65535)';
};

const envRules: EnvRule[] = [
  // 必要變數（缺少則啟動失敗）
  {
    key: 'DATABASE_URL',
    required: true,
    format: isUrl(['postgresql', 'postgres']),
  },
  { key: 'JWT_SECRET', required: true, format: strongSecret(64) },
  { key: 'JWT_REFRESH_SECRET', required: true, format: strongSecret(64) },
  { key: 'RABBITMQ_URL', required: true, format: isUrl(['amqp', 'amqps']) },
  { key: 'ENCRYPTION_KEY', required: true, format: isHex(64) },

  // 建議設定（缺少則警告並使用 fallback）
  { key: 'NODE_ENV', required: false, fallback: 'development' },
  { key: 'PORT', required: false, fallback: '4000', format: isPort },
  {
    key: 'CORS_ORIGIN',
    required: false,
    fallback: 'http://localhost:3000',
    format: corsOriginValidator,
  },
  { key: 'REDIS_HOST', required: false, fallback: 'localhost' },
  {
    key: 'REDIS_PORT',
    required: false,
    fallback: '6379',
    format: isPort,
  },
  { key: 'MAIL_HOST', required: false },
  { key: 'MAIL_PORT', required: false, format: isPort },
  { key: 'MAIL_USER', required: false },
  { key: 'MAIL_PASSWORD', required: false },
];

/**
 * 啟動時驗證所有環境變數，缺少必要變數則終止程式，格式錯誤則終止程式
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  for (const rule of envRules) {
    const value = process.env[rule.key];

    if (!value) {
      if (rule.required) {
        missing.push(rule.key);
      } else if (rule.fallback) {
        warnings.push(
          `${rule.key} not set, using fallback: "${rule.fallback}"`,
        );
      }
      continue;
    }

    if (rule.format) {
      const error = rule.format(value);
      if (error) {
        invalid.push(`${rule.key}: ${error}`);
      }
    }
  }

  if (warnings.length > 0) {
    for (const w of warnings) {
      logger.warn(`[EnvValidator] ${w}`);
    }
  }

  const errors: string[] = [];

  if (missing.length > 0) {
    errors.push(`Missing required: ${missing.join(', ')}`);
  }

  if (invalid.length > 0) {
    errors.push(`Invalid format: ${invalid.join('; ')}`);
  }

  if (errors.length > 0) {
    logger.error(`[EnvValidator] ${errors.join(' | ')}`);
    process.exit(1);
  }

  logger.info('[EnvValidator] All environment variables validated');
}
