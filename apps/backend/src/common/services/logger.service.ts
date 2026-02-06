import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// 日誌目錄
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// 日誌格式
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.metadata(),
  isProduction
    ? format.json()
    : format.combine(format.colorize(), format.simple()),
);

// 日誌輪替配置
const createRotateTransport = (filename: string, level: string) => {
  return new DailyRotateFile({
    dirname: LOG_DIR,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m', // 單檔最大 20MB
    maxFiles: process.env.LOG_MAX_FILES || '14d', // 保留 14 天
    level,
    format: logFormat,
    auditFile: path.join(LOG_DIR, `.${filename}-audit.json`),
  });
};

// 配置 transports
const logTransports: (transports.ConsoleTransportInstance | DailyRotateFile)[] =
  [
    // Console output (所有環境)
    new transports.Console({
      format: logFormat,
      level: isDevelopment ? 'debug' : 'info',
    }),
  ];

// 生產環境或明確啟用檔案日誌時，啟用日誌輪替
if (isProduction || process.env.ENABLE_FILE_LOGGING === 'true') {
  logTransports.push(
    // 錯誤日誌 (error 等級)
    createRotateTransport('error', 'error'),
    // 組合日誌 (info 以上)
    createRotateTransport('combined', 'info'),
  );

  // 開發環境額外記錄 debug 日誌
  if (isDevelopment) {
    logTransports.push(createRotateTransport('debug', 'debug'));
  }
}

export const logger = createLogger({
  level: isProduction ? 'warn' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'wind-backend' },
  transports: logTransports,
  // 防止未處理的錯誤導致程序崩潰
  exitOnError: false,
});

// 處理未捕獲的錯誤
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// 啟動時記錄配置
if (isProduction || process.env.ENABLE_FILE_LOGGING === 'true') {
  logger.info(`[Logger] File logging enabled. Directory: ${LOG_DIR}`);
  logger.info(
    `[Logger] Rotation: maxSize=${process.env.LOG_MAX_SIZE || '20m'}, maxFiles=${process.env.LOG_MAX_FILES || '14d'}`,
  );
} else {
  logger.info(
    '[Logger] Console logging only (set ENABLE_FILE_LOGGING=true to enable file logs)',
  );
}
