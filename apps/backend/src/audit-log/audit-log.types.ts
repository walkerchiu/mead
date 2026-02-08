import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { PageInfo } from '../common/types/pagination.types';

@ObjectType()
export class AuditLogType {
  @Field()
  id: string;

  @Field()
  requestId: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  userName?: string;

  @Field({ nullable: true })
  userEmail?: string;

  @Field()
  action: string;

  @Field()
  entity: string;

  @Field({ nullable: true })
  entityId?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  method?: string;

  @Field({ nullable: true })
  path?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  details?: Record<string, unknown>;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field()
  timestamp: Date;
}

@ObjectType({ description: '分頁稽核日誌' })
export class PaginatedAuditLogs {
  @Field(() => [AuditLogType], { description: '稽核日誌資料' })
  data: AuditLogType[];

  @Field(() => PageInfo, { description: '分頁資訊' })
  pageInfo: PageInfo;
}

@ObjectType()
export class AuditLogStatisticsType {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field()
  successRate: number;

  @Field(() => [ActionStatType])
  byAction: ActionStatType[];

  @Field(() => [EntityStatType])
  byEntity: EntityStatType[];
}

@ObjectType()
class ActionStatType {
  @Field()
  action: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
class EntityStatType {
  @Field()
  entity: string;

  @Field(() => Int)
  count: number;
}
