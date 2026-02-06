import { Logger } from '@nestjs/common';

/**
 * 環境變數驗證錯誤
 */
export class EnvValidationError extends Error {
  constructor(
    message: string,
    public errors: string[],
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * 驗證 JWT Secret 強度
 * OWASP 建議：至少 256 bits (32 bytes / 64 hex chars)
 */
function validateJwtSecret(secret: string | undefined, name: string): string[] {
  const errors: string[] = [];

  if (!secret) {
    errors.push(`${name} is required`);
    return errors;
  }

  // 最小長度：32 字符（建議 64）
  if (secret.length < 32) {
    errors.push(
      `${name} must be at least 32 characters long (current: ${secret.length})`,
    );
  }

  // 警告：建議 64 字符
  if (secret.length < 64) {
    errors.push(
      `⚠️  WARNING: ${name} should be at least 64 characters for better security (current: ${secret.length})`,
    );
  }

  // 檢查是否包含明顯的佔位符
  const placeholders = [
    'YOUR_',
    'CHANGE_ME',
    'REPLACE_',
    'SECRET',
    'PASSWORD',
    'KEY',
  ];
  if (placeholders.some((p) => secret.toUpperCase().includes(p))) {
    errors.push(
      `${name} appears to contain a placeholder value. Please generate a proper secret using: openssl rand -base64 64`,
    );
  }

  return errors;
}

/**
 * 驗證 Encryption Key 格式
 * 必須是 64 字符的 hex 字串（32 bytes）
 */
function validateEncryptionKey(key: string | undefined): string[] {
  const errors: string[] = [];

  if (!key) {
    errors.push('ENCRYPTION_KEY is required');
    return errors;
  }

  // 必須是 64 字符的 hex
  if (key.length !== 64) {
    errors.push(
      `ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Current length: ${key.length}. Generate with: openssl rand -hex 32`,
    );
  }

  // 驗證是否為有效的 hex 字串
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    errors.push(
      'ENCRYPTION_KEY must be a valid hexadecimal string. Generate with: openssl rand -hex 32',
    );
  }

  // 檢查佔位符
  if (key.toUpperCase().includes('YOUR_')) {
    errors.push(
      'ENCRYPTION_KEY contains placeholder value. Generate with: openssl rand -hex 32',
    );
  }

  return errors;
}

/**
 * 驗證 CORS 設定（生產環境必須使用 HTTPS）
 */
function validateCorsOrigin(
  origin: string | undefined,
  nodeEnv: string,
): string[] {
  const errors: string[] = [];

  if (!origin) {
    errors.push('CORS_ORIGIN is required');
    return errors;
  }

  // 生產環境檢查
  if (nodeEnv === 'production') {
    const origins = origin.split(',').map((o) => o.trim());

    for (const o of origins) {
      // 檢查是否使用 HTTPS
      if (!o.startsWith('https://')) {
        errors.push(
          `🚨 SECURITY: Production CORS_ORIGIN must use HTTPS. Found: ${o}`,
        );
      }

      // 檢查是否為 localhost
      if (o.includes('localhost') || o.includes('127.0.0.1')) {
        errors.push(
          `🚨 SECURITY: Production CORS_ORIGIN should not include localhost. Found: ${o}`,
        );
      }
    }
  }

  return errors;
}

/**
 * 驗證資料庫 URL
 */
function validateDatabaseUrl(url: string | undefined): string[] {
  const errors: string[] = [];

  if (!url) {
    errors.push('DATABASE_URL is required');
    return errors;
  }

  // 檢查是否包含密碼佔位符
  if (url.includes('YOUR_') || url.includes('CHANGE_ME')) {
    errors.push(
      'DATABASE_URL contains placeholder password. Please set a real database password.',
    );
  }

  return errors;
}

/**
 * 驗證所有環境變數
 * 在應用啟動時調用
 */
export function validateEnvironment(): void {
  const logger = new Logger('EnvValidation');
  const allErrors: string[] = [];
  const warnings: string[] = [];

  logger.log('🔍 Validating environment variables...');

  // 1. 驗證 JWT Secrets
  const jwtSecretErrors = validateJwtSecret(
    process.env.JWT_SECRET,
    'JWT_SECRET',
  );
  const jwtRefreshSecretErrors = validateJwtSecret(
    process.env.JWT_REFRESH_SECRET,
    'JWT_REFRESH_SECRET',
  );

  // 分離錯誤和警告
  allErrors.push(
    ...jwtSecretErrors.filter((e) => !e.startsWith('⚠️')),
    ...jwtRefreshSecretErrors.filter((e) => !e.startsWith('⚠️')),
  );
  warnings.push(
    ...jwtSecretErrors.filter((e) => e.startsWith('⚠️')),
    ...jwtRefreshSecretErrors.filter((e) => e.startsWith('⚠️')),
  );

  // 2. 驗證 Encryption Key
  const encryptionKeyErrors = validateEncryptionKey(process.env.ENCRYPTION_KEY);
  allErrors.push(...encryptionKeyErrors);

  // 3. 驗證 CORS
  const corsErrors = validateCorsOrigin(
    process.env.CORS_ORIGIN,
    process.env.NODE_ENV || 'development',
  );
  allErrors.push(...corsErrors);

  // 4. 驗證資料庫 URL
  const dbErrors = validateDatabaseUrl(process.env.DATABASE_URL);
  allErrors.push(...dbErrors);

  // 5. 檢查必要的環境變數
  const requiredVars = [
    'PORT',
    'NODE_ENV',
    'REDIS_HOST',
    'REDIS_PORT',
    'RABBITMQ_URL',
    'MAIL_HOST',
    'MAIL_PORT',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      allErrors.push(`${varName} is required`);
    }
  }

  // 顯示警告
  if (warnings.length > 0) {
    logger.warn('⚠️  Environment configuration warnings:');
    warnings.forEach((warning) => logger.warn(`  - ${warning}`));
  }

  // 如果有錯誤，拋出異常
  if (allErrors.length > 0) {
    logger.error('❌ Environment validation failed:');
    allErrors.forEach((error) => logger.error(`  - ${error}`));

    throw new EnvValidationError(
      'Environment validation failed. Please check your .env file.',
      allErrors,
    );
  }

  logger.log('✅ Environment validation passed');
}
