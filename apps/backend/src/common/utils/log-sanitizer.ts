/**
 * 日誌敏感資訊過濾器
 *
 * 用途：
 * 1. 過濾日誌中的敏感資訊（密碼、Token、密鑰等）
 * 2. 防止敏感資訊通過日誌洩露
 * 3. 支援深層嵌套物件和陣列
 *
 * 使用方式：
 * ```typescript
 * import { sanitizeLog } from './log-sanitizer';
 *
 * const sensitiveData = {
 *   email: 'user@example.com',
 *   password: 'secret123',
 *   token: 'eyJhbGciOiJIUzI1...'
 * };
 *
 * logger.info('User data:', sanitizeLog(sensitiveData));
 * // 輸出: { email: 'user@example.com', password: '[REDACTED]', token: '[REDACTED]' }
 * ```
 */

/**
 * 敏感欄位關鍵字列表
 * 任何包含這些關鍵字的欄位名稱都會被過濾
 */
const SENSITIVE_KEYS = [
  // 認證相關
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'api_key',
  'authorization',
  'auth',
  'bearer',

  // 加密相關
  'key',
  'privatekey',
  'publickey',
  'encryptionkey',
  'encryption_key',
  'salt',
  'hash',

  // Cookie 和 Session
  'cookie',
  'session',
  'sessionid',
  'session_id',
  'csrf',
  'xsrf',

  // 雙因素認證
  'otp',
  'totp',
  'mfa',
  '2fa',
  'twofa',
  'backup_code',
  'backupcode',

  // 個人敏感資料
  'ssn', // Social Security Number
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'cvv',
  'cvc',
  'pin',

  // 其他敏感資訊
  'signature',
  'certificate',
  'cert',
];

/**
 * 敏感 Header 列表
 */
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
];

/**
 * 檢查欄位名稱是否包含敏感關鍵字
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey));
}

/**
 * 檢查是否為敏感 Header
 */
function isSensitiveHeader(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_HEADERS.some((header) => lowerKey === header);
}

/**
 * 替換值的策略
 */
interface SanitizeOptions {
  /** 替換文字，預設為 '[REDACTED]' */
  replacement?: string;
  /** 是否保留字串長度資訊，預設為 false */
  showLength?: boolean;
  /** 是否保留值的類型資訊，預設為 true */
  showType?: boolean;
  /** 最大深度，防止循環引用，預設為 10 */
  maxDepth?: number;
}

const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  replacement: '[REDACTED]',
  showLength: false,
  showType: true,
  maxDepth: 10,
};

/**
 * 生成替換文字
 */
function generateReplacement(
  value: any,
  options: Required<SanitizeOptions>,
): string {
  const { replacement, showLength, showType } = options;

  const parts: string[] = [replacement];

  if (showType) {
    const type = typeof value;
    if (type !== 'undefined') {
      parts.push(`(${type})`);
    }
  }

  if (showLength && typeof value === 'string') {
    parts.push(`[length: ${value.length}]`);
  }

  return parts.join(' ');
}

/**
 * 深度優先遍歷並過濾敏感資訊
 */
function sanitizeRecursive(
  data: any,
  options: Required<SanitizeOptions>,
  depth: number = 0,
  seen: WeakSet<object> = new WeakSet(),
): any {
  // 深度限制，防止無限遞歸
  if (depth >= options.maxDepth) {
    return '[MAX_DEPTH_EXCEEDED]';
  }

  // 處理 null 和 undefined
  if (data === null) return null;
  if (data === undefined) return undefined;

  // 處理基本類型
  if (typeof data !== 'object') {
    return data;
  }

  // 檢測循環引用
  if (seen.has(data)) {
    return '[CIRCULAR_REFERENCE]';
  }
  seen.add(data);

  // 處理 Date 物件
  if (data instanceof Date) {
    return data.toISOString();
  }

  // 處理 Error 物件
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack:
        process.env.NODE_ENV === 'production'
          ? undefined
          : data.stack?.split('\n').slice(0, 3).join('\n'),
    };
  }

  // 處理陣列
  if (Array.isArray(data)) {
    return data.map((item) =>
      sanitizeRecursive(item, options, depth + 1, seen),
    );
  }

  // 處理物件
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // 檢查是否為敏感欄位
    if (isSensitiveKey(key) || isSensitiveHeader(key)) {
      sanitized[key] = generateReplacement(value, options);
    } else if (typeof value === 'object' && value !== null) {
      // 遞歸處理嵌套物件
      sanitized[key] = sanitizeRecursive(value, options, depth + 1, seen);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * 主要的日誌過濾函數
 *
 * @param data - 要過濾的資料
 * @param options - 過濾選項
 * @returns 過濾後的資料
 *
 * @example
 * ```typescript
 * const data = {
 *   user: {
 *     email: 'user@example.com',
 *     password: 'secret123'
 *   },
 *   token: 'eyJhbGciOiJIUzI1...'
 * };
 *
 * const sanitized = sanitizeLog(data);
 * // {
 * //   user: {
 * //     email: 'user@example.com',
 * //     password: '[REDACTED] (string)'
 * //   },
 * //   token: '[REDACTED] (string)'
 * // }
 * ```
 */
export function sanitizeLog(data: any, options: SanitizeOptions = {}): any {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  return sanitizeRecursive(data, mergedOptions);
}

/**
 * 過濾 HTTP Request 物件
 * 專門用於過濾 Express Request 或類似物件
 */
export function sanitizeRequest(req: any): any {
  if (!req) return req;

  return {
    method: req.method,
    url: req.url,
    headers: sanitizeLog(req.headers),
    body: sanitizeLog(req.body),
    query: sanitizeLog(req.query),
    params: req.params,
    ip: req.ip,
    user: req.user
      ? {
          id: req.user.id,
          email: req.user.email,
          // 不包含敏感資訊
        }
      : undefined,
  };
}

/**
 * 過濾 HTTP Response 物件
 */
export function sanitizeResponse(res: any): any {
  if (!res) return res;

  return {
    statusCode: res.statusCode,
    headers: sanitizeLog(res.headers || res.getHeaders?.()),
    // 不包含 body，因為可能很大
  };
}

/**
 * 過濾 GraphQL Context
 */
export function sanitizeGraphQLContext(context: any): any {
  if (!context) return context;

  return {
    req: context.req ? sanitizeRequest(context.req) : undefined,
    user: context.user
      ? {
          id: context.user.id,
          email: context.user.email,
          accessScopes: context.user.accessScopes,
        }
      : undefined,
    // 不包含其他可能敏感的 context
  };
}

/**
 * 快速檢查字串是否可能包含敏感資訊
 * 用於在記錄前快速判斷
 */
export function mightContainSensitiveData(str: string): boolean {
  const lowerStr = str.toLowerCase();
  return SENSITIVE_KEYS.some((key) => lowerStr.includes(key));
}
