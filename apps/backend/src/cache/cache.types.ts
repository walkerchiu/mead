import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * Cache Statistics Type
 *
 * 快取統計資訊，用於監控快取效能
 */
@ObjectType({
  description: '快取統計資訊',
})
export class CacheStats {
  @Field(() => Int, {
    description: '快取命中次數',
  })
  hitCount: number;

  @Field(() => Int, {
    description: '快取未命中次數',
  })
  missCount: number;

  @Field(() => Int, {
    description: '總請求次數',
  })
  totalRequests: number;

  @Field(() => String, {
    description: '快取命中率（百分比）',
  })
  hitRate: string;
}
