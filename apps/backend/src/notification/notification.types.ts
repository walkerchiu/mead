import {
  ObjectType,
  Field,
  ID,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { NotificationType as PrismaNotificationType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

/**
 * 註冊 NotificationType Enum 到 GraphQL Schema
 */
registerEnumType(PrismaNotificationType, {
  name: 'NotificationType',
  description: '通知類型',
  valuesMap: {
    INFO: {
      description: '一般資訊通知',
    },
    WARNING: {
      description: '警告訊息',
    },
    SUCCESS: {
      description: '成功訊息',
    },
    ERROR: {
      description: '錯誤訊息',
    },
  },
});

/**
 * Notification GraphQL Type
 * 對應 Prisma Notification Model
 */
@ObjectType({ description: '通知' })
export class NotificationGQLType {
  @Field(() => ID, { description: '通知唯一識別碼' })
  id: string;

  @Field({ description: '接收通知的用戶 ID' })
  userId: string;

  @Field(() => PrismaNotificationType, { description: '通知類型' })
  type: PrismaNotificationType;

  @Field({ description: '通知標題' })
  title: string;

  @Field({ description: '通知內容' })
  message: string;

  @Field({ description: '是否已讀' })
  isRead: boolean;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: '額外資料（JSON 格式）',
  })
  data?: any;

  @Field({ description: '建立時間' })
  createdAt: Date;

  @Field({ nullable: true, description: '已讀時間' })
  readAt?: Date;
}

/**
 * 通知列表回應
 */
@ObjectType({ description: '通知列表回應' })
export class NotificationListResponse {
  @Field(() => [NotificationGQLType], {
    description: '通知列表',
    defaultValue: [],
  })
  notifications: NotificationGQLType[];

  @Field({
    description: '總數量',
    defaultValue: 0,
  })
  total: number;

  @Field({
    description: '未讀數量',
    defaultValue: 0,
  })
  unreadCount: number;
}

/**
 * 通知篩選條件
 */
@InputType({ description: '通知篩選條件' })
export class NotificationFilterInput {
  @Field({ nullable: true, description: '是否已讀（null 表示不篩選）' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @Field(() => PrismaNotificationType, {
    nullable: true,
    description: '通知類型',
  })
  @IsOptional()
  @IsEnum(PrismaNotificationType)
  type?: PrismaNotificationType;

  @Field({ nullable: true, description: '每頁數量（預設 20）' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field({ nullable: true, description: '偏移量（預設 0）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

/**
 * 建立通知輸入（僅供系統內部使用，不暴露到 GraphQL）
 */
export interface CreateNotificationInput {
  userId: string;
  type: PrismaNotificationType;
  title: string;
  message: string;
  data?: any;
}

/**
 * 批次建立通知輸入
 */
export interface CreateBulkNotificationsInput {
  userIds: string[];
  type: PrismaNotificationType;
  title: string;
  message: string;
  data?: any;
}
