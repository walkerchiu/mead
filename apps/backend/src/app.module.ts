/* eslint-disable @typescript-eslint/no-explicit-any */

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import depthLimit from 'graphql-depth-limit';
import * as jwt from 'jsonwebtoken';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { RequestContextModule } from './common/request-context/request-context.module';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { PrismaModule } from './prisma/prisma.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationModule } from './notification/notification.module';
import { SystemStatusModule } from './system-status/system-status.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { RbacModule } from './rbac/rbac.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
import { FieldAuthPlugin } from './common/plugins/field-auth.plugin';
import { RequestIdPlugin } from './common/plugins/request-id.plugin';
import { QueryComplexityPlugin } from './common/plugins/query-complexity.plugin';
import { FieldMetadataCache } from './common/services/field-metadata-cache.service';
import { WebSocketConnectionService } from './common/services/websocket-connection.service';
import { SubscriptionRateLimiterService } from './common/services/subscription-rate-limiter.service';
import { WebSocketModule } from './common/services/websocket.module';
import { PubSubModule } from './common/services/pubsub.module';
import { GeoIPModule } from './common/services/geoip.module';
import { CronMonitoringModule } from './cron-monitoring/cron-monitoring.module';
import { PersonalAccessTokenModule } from './modules/personal-access-token/personal-access-token.module';
import { TlsModule } from './tls/tls.module';
import { UserType, ProfileType } from './modules/user/user.types';
import { UserDataLoaderService } from './modules/user/user.dataloader';
import { logger } from './common/services/logger.service';

@Module({
  imports: [
    // Per-request ALS（提供 RequestContextService）— 必須最早載入，
    // 中間件對所有路由註冊 ALS scope，後續所有 service 即可透過注入取得當前 requestId
    RequestContextModule,
    // Environment
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // i18n
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang']), AcceptLanguageResolver],
      typesOutputPath: path.join(__dirname, 'i18n/i18n.types.ts'),
    }),
    // Database
    PrismaModule,
    // Cache (Redis)
    CacheModule,
    // Task Scheduling (Cron Jobs)
    ScheduleModule.forRoot(),
    // Rate Limiting 設定
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    // 官方 GraphQL 配置（單一端點 + 動態欄位控制 + 查詢複雜度限制 + Subscriptions）
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, WebSocketModule, UserModule],
      inject: [
        ConfigService,
        WebSocketConnectionService,
        SubscriptionRateLimiterService,
        UserDataLoaderService,
      ],
      useFactory: (
        configService: ConfigService,
        wsConnectionService: WebSocketConnectionService,
        rateLimiterService: SubscriptionRateLimiterService,
        userDataLoaderService: UserDataLoaderService,
      ) => ({
        autoSchemaFile: 'schema.gql',
        sortSchema: true,
        playground: false,
        introspection: process.env.NODE_ENV !== 'production',
        // Subscription 支援（with 連接數限制 + Rate Limiting）
        subscriptions: {
          'graphql-ws': {
            onConnect: async (context: any) => {
              logger.info('[WebSocket] 🔌 New connection attempt');
              logger.debug('[WebSocket] Context keys:', Object.keys(context));

              const { connectionParams, extra } = context;
              const connectionId =
                extra.socket?.id || Math.random().toString(36);

              logger.debug(
                '[WebSocket] connectionParams received:',
                connectionParams ? Object.keys(connectionParams) : 'none',
              );
              logger.debug(
                '[WebSocket] extra keys:',
                extra ? Object.keys(extra) : 'none',
              );

              // 從 connectionParams 取得 Authorization header
              const authHeader = connectionParams?.authorization || '';
              const token = authHeader.replace('Bearer ', '');

              if (!token) {
                logger.warn(
                  '[WebSocket] No token provided in connection params',
                  {
                    connectionId,
                    hasConnectionParams: !!connectionParams,
                    connectionParamsKeys: connectionParams
                      ? Object.keys(connectionParams)
                      : [],
                  },
                );
                return { token: null, user: null, connectionId };
              }

              logger.debug('[WebSocket] Token received, verifying...');

              try {
                // ✅ 安全修復：使用 JwtService 驗證簽名
                const jwtSecret = configService.get<string>('JWT_SECRET');
                if (!jwtSecret) {
                  throw new Error('JWT_SECRET not configured');
                }

                const payload = jwt.verify(token, jwtSecret) as any;
                const userId = payload.sub;

                // ✅ 檢查連接數限制
                if (!wsConnectionService.canConnect(userId)) {
                  logger.warn(
                    `[WebSocket] Connection limit exceeded for user ${userId}`,
                  );
                  throw new Error(
                    'Too many connections. Maximum 10 connections per user.',
                  );
                }

                // ✅ 檢查訂閱 Rate Limiting
                const rateLimitCheck = rateLimiterService.checkLimit(
                  userId,
                  'subscribe',
                );
                if (!rateLimitCheck.allowed) {
                  logger.warn(
                    `[WebSocket] Rate limit exceeded for user ${userId}`,
                  );
                  throw new Error(
                    `Rate limit exceeded. Retry after ${rateLimitCheck.retryAfter}s`,
                  );
                }

                // 註冊連接
                wsConnectionService.registerConnection(userId, connectionId);

                logger.info('[WebSocket] ✅ User connected successfully', {
                  userId,
                  email: payload.email,
                  connectionId,
                  accessScopes: payload.accessScopes,
                });

                return {
                  token,
                  connectionId,
                  user: {
                    id: userId,
                    email: payload.email,
                    accessScopes: payload.accessScopes || [],
                    permissions: payload.permissions || [],
                  },
                };
              } catch (error) {
                const errorDetails = {
                  message:
                    error instanceof Error ? error.message : 'Unknown error',
                  name: error instanceof Error ? error.name : 'UnknownError',
                  stack: error instanceof Error ? error.stack : undefined,
                  connectionId,
                  hasConnectionParams: !!connectionParams,
                  connectionParamsKeys: connectionParams
                    ? Object.keys(connectionParams)
                    : [],
                  tokenLength: token?.length || 0,
                };

                logger.error(
                  '[WebSocket] Authentication/Connection failed',
                  errorDetails,
                );
                throw error; // 拒絕連接
              }
            },
            onDisconnect: async (context: any) => {
              const user = context?.extra?.user;
              const connectionId = context?.extra?.connectionId;

              if (user?.id && connectionId) {
                wsConnectionService.unregisterConnection(user.id, connectionId);
                logger.debug('[WebSocket] User disconnected', {
                  userId: user.id,
                  connectionId,
                });
              }
            },
          },
        },
        plugins: [
          ...(process.env.NODE_ENV !== 'production'
            ? [ApolloServerPluginLandingPageLocalDefault()]
            : []),
          // 僅允許 HQ 使用 Introspection（安全性增強）
          {
            async requestDidStart() {
              return {
                async didResolveOperation(requestContext: any) {
                  const operationName = requestContext.request.operationName;
                  // 攔截 introspection query
                  if (operationName === 'IntrospectionQuery') {
                    const user = requestContext.contextValue?.req?.user;
                    const hasHQScope = user?.accessScopes?.includes('HQ_SCOPE');

                    if (!hasHQScope && process.env.NODE_ENV === 'production') {
                      throw new Error(
                        'GraphQL introspection is disabled in production',
                      );
                    }
                  }
                },
              };
            },
          },
        ],
        validationRules: [depthLimit(10)],
        context: ({ req, res, extra, connection, connectionParams }: any) => {
          // ✅ DataLoader: 為每個請求建立新的 loader 實例
          // 這確保快取只在單個請求週期內有效，避免跨請求快取導致的資料不一致
          const loaders = {
            user: userDataLoaderService.createLoader(),
            userBasic: userDataLoaderService.createBasicLoader(),
            userByEmail: userDataLoaderService.createEmailLoader(),
          };

          return {
            req,
            res,
            extra, // ✅ 傳遞 WebSocket 的 extra（包含 onConnect 返回值）
            connection, // ✅ 傳遞 WebSocket connection 對象
            connectionParams, // ✅ 傳遞連接參數
            // WebSocket subscriptions 的 user context（向後兼容）
            user: extra?.user || req?.user,
            // ✅ DataLoader 實例（用於批量查詢，解決 N+1 問題）
            loaders,
          };
        },
      }),
    }),
    // Feature Modules
    AuthModule,
    MailModule,
    RbacModule,
    TwoFactorAuthModule,
    UserModule,
    AuditLogModule,
    NotificationModule,
    SystemStatusModule,
    HealthModule, // ✅ 健康檢查
    PubSubModule, // ✅ 全局 PubSub
    WebSocketModule, // ✅ WebSocket 服務
    GeoIPModule, // ✅ IP 地理位置服務
    CronMonitoringModule, // ✅ Cron Job 監控
    PersonalAccessTokenModule, // ✅ 個人存取權杖模組
    TlsModule, // ✅ TLS 憑證自動化（Let's Encrypt / Cloudflare / AWS ACM）
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    // Field-level Authorization (Phase 3)
    FieldMetadataCache, // 欄位權限規則快取
    // GraphQL Plugins
    FieldAuthPlugin, // ✅ 完整的欄位級權限控制
    // DebugPlugin, // 🔍 Debug plugin (用於除錯，已修復)
    RequestIdPlugin,
    QueryComplexityPlugin, // Query Complexity 限制防止 DoS
  ],
})
export class AppModule {
  constructor(private fieldMetadataCache?: FieldMetadataCache) {
    // 註冊 GraphQL Types 到欄位權限快取
    // 在 i18n 类型生成时可能为 undefined，跳过注册
    if (this.fieldMetadataCache) {
      this.fieldMetadataCache.registerType(UserType);
      this.fieldMetadataCache.registerType(ProfileType);
    }
  }
}
