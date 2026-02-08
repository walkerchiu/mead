import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { logger } from './common/services/logger.service';
import { validateEnv } from './common/utils/env-validator';

async function bootstrap() {
  // 啟動前驗證所有必要環境變數
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Get ConfigService
  const configService = app.get(ConfigService);

  // 連接 RabbitMQ microservice
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  if (!rabbitmqUrl) {
    throw new Error('RABBITMQ_URL environment variable is required');
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'audit_logs',
      queueOptions: {
        durable: true,
      },
      noAck: true,
      prefetchCount: 10,
    },
  });

  // Cookie parser（用於讀取 HttpOnly refresh token cookie）
  app.use(cookieParser());

  // Global validation pipe（輸入驗證）
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自動移除未定義的屬性
      forbidNonWhitelisted: true, // 拒絕包含未定義屬性的請求
      transform: true, // 自動轉換類型
      transformOptions: {
        enableImplicitConversion: true, // 啟用隱式類型轉換
      },
    }),
  );

  // 安全 headers
  const isProduction = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          }
        : false, // 開發環境禁用 CSP（為了 GraphQL Sandbox）
      crossOriginEmbedderPolicy: false,
      // ✅ 防止 MIME 類型嗅探攻擊
      noSniff: true,
      // ✅ 防止點擊劫持攻擊
      frameguard: {
        action: 'deny',
      },
      // ✅ 控制 Referrer 資訊洩漏
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      // ✅ 啟用瀏覽器 XSS 過濾器（舊版瀏覽器）
      xssFilter: true,
      // ✅ 強制 HTTPS（生產環境）
      hsts: isProduction
        ? {
            maxAge: 31536000, // 1 年
            includeSubDomains: true,
            preload: true,
          }
        : false,
      // ✅ 隱藏 X-Powered-By header
      hidePoweredBy: true,
    }),
  );

  // ✅ 添加 Permissions-Policy header（限制瀏覽器功能）
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      [
        'geolocation=()', // 禁止地理位置
        'microphone=()', // 禁止麥克風
        'camera=()', // 禁止相機
        'payment=()', // 禁止支付 API
        'usb=()', // 禁止 USB
        'magnetometer=()', // 禁止磁力計
        'gyroscope=()', // 禁止陀螺儀
        'accelerometer=()', // 禁止加速度計
      ].join(', '),
    );
    next();
  });

  // CORS 設定與驗證
  const corsOrigin =
    process.env.CORS_ORIGIN || process.env.APP_URL || 'http://localhost:3000';

  // 生產環境 CORS 安全檢查
  if (isProduction) {
    if (
      corsOrigin === 'http://localhost:3000' ||
      corsOrigin.includes('localhost')
    ) {
      logger.error(
        '[CORS] Production environment must not use localhost as CORS_ORIGIN',
      );
      throw new Error('Invalid CORS_ORIGIN for production environment');
    }

    if (corsOrigin === '*') {
      logger.error('[CORS] Wildcard (*) is not allowed in production');
      throw new Error('Wildcard CORS_ORIGIN is not allowed in production');
    }

    // 驗證 HTTPS 和 Port
    const origins = corsOrigin.split(',').map((o) => o.trim());
    for (const origin of origins) {
      try {
        const url = new URL(origin);

        // 檢查協議
        if (url.protocol !== 'https:' && origin !== 'http://localhost') {
          logger.warn(
            `[CORS] Non-HTTPS origin detected in production: ${origin}`,
          );
        }

        // 檢查 Port（防止 Port Bypass）
        if (url.protocol === 'https:' && url.port && url.port !== '443') {
          logger.error(
            `[CORS] Non-standard HTTPS port detected: ${origin} (port: ${url.port})`,
          );
          throw new Error(
            `Non-standard HTTPS port is not allowed in production: ${origin}`,
          );
        }

        if (
          url.protocol === 'http:' &&
          url.port &&
          url.port !== '80' &&
          origin !== 'http://localhost'
        ) {
          logger.error(
            `[CORS] Non-standard HTTP port detected: ${origin} (port: ${url.port})`,
          );
          throw new Error(
            `Non-standard HTTP port is not allowed in production: ${origin}`,
          );
        }
      } catch (error) {
        if (error instanceof TypeError) {
          logger.error(`[CORS] Invalid origin URL: ${origin}`);
          throw new Error(`Invalid CORS_ORIGIN format: ${origin}`);
        }
        throw error;
      }
    }
  }

  logger.info(`[CORS] Allowed origins: ${corsOrigin}`);

  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-apollo-operation-name',
      'apollo-require-preflight',
      'x-lang',
    ],
  });

  // Global filters (with dependency injection)
  app.useGlobalFilters(new AllExceptionsFilter(configService));

  // 啟動所有 microservices
  await app.startAllMicroservices();
  logger.info('RabbitMQ microservice connected');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.info(`Application is running on: http://localhost:${port}`);
  logger.info(`GraphQL endpoint: http://localhost:${port}/graphql`);
}
bootstrap();
