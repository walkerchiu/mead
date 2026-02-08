import {
  ObjectType,
  Field,
  registerEnumType,
  InputType,
} from '@nestjs/graphql';

/**
 * 服務類型枚舉
 */
export enum ServiceType {
  DATABASE = 'DATABASE',
  REDIS = 'REDIS',
  RABBITMQ = 'RABBITMQ',
  GRAPHQL = 'GRAPHQL',
}

registerEnumType(ServiceType, {
  name: 'ServiceType',
  description: '服務類型',
});

/**
 * 服務狀態枚舉
 */
export enum ServiceStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
}

registerEnumType(ServiceStatus, {
  name: 'ServiceStatus',
  description: '服務狀態',
});

/**
 * SystemStatusGQLType - 系統狀態 GraphQL Type
 */
@ObjectType({ description: '系統服務狀態' })
export class SystemStatusGQLType {
  @Field(() => ServiceType, { description: '服務類型' })
  service: ServiceType;

  @Field(() => ServiceStatus, { description: '服務狀態' })
  status: ServiceStatus;

  @Field({ description: '狀態訊息' })
  message: string;

  @Field({ description: '時間戳記' })
  timestamp: Date;

  @Field({ nullable: true, description: '額外資訊（如錯誤詳情）' })
  details?: string;

  @Field({ nullable: true, description: '回應時間（毫秒）' })
  responseTime?: number;
}

/**
 * SystemHealthGQLType - 系統整體健康狀態
 */
@ObjectType({ description: '系統整體健康狀態' })
export class SystemHealthGQLType {
  @Field(() => ServiceStatus, { description: '整體狀態' })
  overallStatus: ServiceStatus;

  @Field(() => [SystemStatusGQLType], { description: '各服務狀態' })
  services: SystemStatusGQLType[];

  @Field({ description: '檢查時間' })
  checkedAt: Date;

  @Field({ description: '系統運行時間（秒）' })
  uptime: number;
}

/**
 * ServiceFilter Input - 用於訂閱篩選
 */
@InputType({ description: '服務篩選條件' })
export class ServiceFilterInput {
  @Field(() => [ServiceType], {
    nullable: true,
    description: '要訂閱的服務類型',
  })
  services?: ServiceType[];

  @Field(() => [ServiceStatus], {
    nullable: true,
    description: '要訂閱的狀態類型',
  })
  statuses?: ServiceStatus[];
}
