import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          ...(process.env.REDIS_PASSWORD && {
            password: process.env.REDIS_PASSWORD,
          }),
          ttl: 300, // 預設 5 分鐘
        }),
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
