/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageInfo } from '../common/types/pagination.types';
import { SessionStatus, RevokedMethod } from './hq-session.types';

// 註冊 Enums 到 GraphQL Schema
registerEnumType(SessionStatus, {
  name: 'SessionStatus',
  description: '會話狀態（ACTIVE: 活躍, EXPIRED: 已過期, REVOKED: 已撤銷）',
});

registerEnumType(RevokedMethod, {
  name: 'RevokedMethod',
  description:
    '撤銷方式（USER_LOGOUT: 用戶登出, HQ_FORCE: 管理員強制, BATCH_REVOKE: 批量撤銷, SECURITY_MEASURE: 安全措施）',
});

/**
 * Session GraphQL Type - 會話詳細資訊
 */
@ObjectType({ description: '會話詳細資訊' })
export class SessionType {
  @Field(() => String, { description: '會話 ID' })
  id: string;

  @Field(() => String, { description: '用戶 ID' })
  userId: string;

  @Field(() => String, { nullable: true, description: '用戶名稱' })
  userName?: string;

  @Field(() => String, { nullable: true, description: '用戶電子郵件' })
  userEmail?: string;

  @Field(() => String, { nullable: true, description: '設備資訊' })
  deviceInfo?: string;

  @Field(() => String, { nullable: true, description: '瀏覽器' })
  browser?: string;

  @Field(() => String, { nullable: true, description: '作業系統' })
  os?: string;

  @Field(() => String, { nullable: true, description: 'IP 地址' })
  ipAddress?: string;

  @Field(() => String, { nullable: true, description: '地理位置' })
  location?: string;

  @Field(() => Boolean, { description: '是否活躍' })
  isActive: boolean;

  @Field(() => SessionStatus, { description: '會話狀態' })
  status: SessionStatus;

  @Field(() => Date, { description: '最後使用時間' })
  lastUsedAt: Date;

  @Field(() => Date, { description: '過期時間' })
  expiresAt: Date;

  @Field(() => Date, { description: '創建時間' })
  createdAt: Date;

  @Field(() => String, { nullable: true, description: '撤銷者 ID' })
  revokedBy?: string;

  @Field(() => String, { nullable: true, description: '撤銷者名稱' })
  revokedByName?: string;

  @Field(() => String, { nullable: true, description: '撤銷原因' })
  revokedReason?: string;

  @Field(() => RevokedMethod, { nullable: true, description: '撤銷方式' })
  revokedMethod?: RevokedMethod;

  @Field(() => Date, { nullable: true, description: '撤銷時間' })
  revokedAt?: Date;

  @Field(() => Boolean, { nullable: true, description: '是否為當前會話' })
  isCurrent?: boolean;
}

/**
 * Paginated Sessions - 分頁會話列表
 */
@ObjectType({ description: '分頁會話列表' })
export class PaginatedSessions {
  @Field(() => [SessionType], { description: '會話資料' })
  data: SessionType[];

  @Field(() => PageInfo, { description: '分頁資訊' })
  pageInfo: PageInfo;
}

/**
 * Session Statistics - 會話統計資訊
 */
@ObjectType({ description: '會話統計資訊' })
export class SessionStatisticsType {
  @Field(() => Int, { description: '總會話數' })
  totalSessions: number;

  @Field(() => Int, { description: '活躍會話數' })
  activeSessions: number;

  @Field(() => Int, { description: '已撤銷會話數' })
  totalRevoked: number;

  @Field(() => Int, { description: '已過期會話數' })
  totalExpired: number;

  @Field(() => Int, { description: '今日登入數' })
  todayLogins: number;

  @Field(() => Int, { description: '今日撤銷數' })
  todayRevocations: number;

  @Field(() => [ScopeStat], { description: '按 Scope 分組統計' })
  byScope: ScopeStat[];

  @Field(() => [UserActivityStat], { description: '前 5 活躍用戶' })
  topActiveUsers: UserActivityStat[];

  @Field(() => [DeviceStat], { description: '前 5 常用設備' })
  topDevices: DeviceStat[];

  @Field(() => [RecentActivityType], { description: '最近活動' })
  recentActivities: RecentActivityType[];
}

@ObjectType({ description: 'Scope 統計' })
class ScopeStat {
  @Field(() => String, { description: 'Scope 名稱' })
  scope: string;

  @Field(() => Int, { description: '會話數量' })
  count: number;

  @Field(() => Int, { description: '活躍會話數' })
  activeCount: number;
}

@ObjectType({ description: '用戶活動統計' })
class UserActivityStat {
  @Field(() => String, { description: '用戶 ID' })
  userId: string;

  @Field(() => String, { nullable: true, description: '用戶名稱' })
  userName?: string;

  @Field(() => String, { description: '用戶電子郵件' })
  userEmail: string;

  @Field(() => Int, { description: '會話數量' })
  sessionCount: number;

  @Field(() => Date, { description: '最後活動時間' })
  lastActivity: Date;
}

@ObjectType({ description: '設備統計' })
class DeviceStat {
  @Field(() => String, { description: '設備資訊' })
  deviceInfo: string;

  @Field(() => Int, { description: '使用次數' })
  count: number;
}

@ObjectType({ description: '最近活動' })
class RecentActivityType {
  @Field(() => String, { description: '會話 ID' })
  sessionId: string;

  @Field(() => String, { description: '用戶 ID' })
  userId: string;

  @Field(() => String, { nullable: true, description: '用戶名稱' })
  userName?: string;

  @Field(() => String, { description: '活動類型' })
  activityType: string;

  @Field(() => Date, { description: '活動時間' })
  timestamp: Date;

  @Field(() => GraphQLJSON, { nullable: true, description: '活動詳情' })
  details?: any;
}

/**
 * Revoke Result - 撤銷操作結果
 */
@ObjectType({ description: '撤銷操作結果' })
export class RevokeResultType {
  @Field(() => Boolean, { description: '是否成功' })
  success: boolean;

  @Field(() => Int, { description: '撤銷的會話數量' })
  revokedCount: number;

  @Field(() => String, { description: '操作訊息' })
  message: string;

  @Field(() => [String], {
    nullable: true,
    description: '受影響的會話 ID 列表',
  })
  affectedSessionIds?: string[];
}

/**
 * ============================================
 * GraphQL Input Types
 * ============================================
 */

/**
 * Session Filters Input - 會話過濾條件
 */
@InputType({ description: '會話過濾條件' })
export class SessionFiltersInput {
  @Field(() => String, {
    nullable: true,
    description: '用戶 ID（已棄用，請使用 userSearch）',
    deprecationReason: '請使用 userSearch 進行用戶搜尋',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, {
    nullable: true,
    description: '用戶搜尋（可搜尋 email、名稱或 ID）',
  })
  @IsOptional()
  @IsString()
  userSearch?: string;

  @Field(() => SessionStatus, { nullable: true, description: '會話狀態' })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @Field(() => String, { nullable: true, description: 'IP 地址（模糊匹配）' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Field(() => String, { nullable: true, description: '設備資訊（模糊匹配）' })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @Field(() => Date, { nullable: true, description: '創建時間起始' })
  @IsOptional()
  createdAfter?: Date;

  @Field(() => Date, { nullable: true, description: '創建時間結束' })
  @IsOptional()
  createdBefore?: Date;

  @Field(() => Date, { nullable: true, description: '最後使用時間起始' })
  @IsOptional()
  lastUsedAfter?: Date;

  @Field(() => Date, { nullable: true, description: '最後使用時間結束' })
  @IsOptional()
  lastUsedBefore?: Date;

  @Field(() => Boolean, { nullable: true, description: '只顯示已過期' })
  @IsOptional()
  @IsBoolean()
  expiredOnly?: boolean;

  @Field(() => Boolean, { nullable: true, description: '只顯示已撤銷' })
  @IsOptional()
  @IsBoolean()
  revokedOnly?: boolean;

  @Field(() => String, { nullable: true, description: '撤銷者 ID' })
  @IsOptional()
  @IsString()
  revokedBy?: string;

  @Field(() => RevokedMethod, {
    nullable: true,
    description:
      '撤銷方式（USER_LOGOUT: 用戶登出, HQ_FORCE: 管理員強制, BATCH_REVOKE: 批量撤銷, SECURITY_MEASURE: 安全措施）',
  })
  @IsOptional()
  @IsEnum(RevokedMethod)
  revokedMethod?: RevokedMethod;
}

/**
 * Revoke Session Input - 撤銷單個會話
 */
@InputType({ description: '撤銷單個會話輸入' })
export class RevokeSessionInput {
  @Field(() => String, { description: '會話 ID' })
  @IsString()
  sessionId: string;

  @Field(() => String, { description: '撤銷原因' })
  @IsString()
  reason: string;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: true,
    description: '是否發送通知給用戶（預設：true）',
  })
  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @Field(() => String, {
    nullable: true,
    description: '自定義通知訊息（選填）',
  })
  @IsOptional()
  @IsString()
  notificationMessage?: string;
}

/**
 * Revoke User Sessions Options Input - 撤銷用戶所有會話選項
 */
@InputType({ description: '撤銷用戶所有會話選項' })
export class RevokeUserSessionsOptionsInput {
  @Field(() => Boolean, {
    nullable: true,
    description: '只撤銷非當前會話（預設：true）',
  })
  @IsOptional()
  @IsBoolean()
  excludeCurrent?: boolean;

  @Field(() => String, {
    nullable: true,
    description: '只撤銷特定設備的會話',
  })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @Field(() => String, {
    nullable: true,
    description: '只撤銷特定 IP 的會話',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Field(() => Date, {
    nullable: true,
    description: '只撤銷在此時間之前創建的會話',
  })
  @IsOptional()
  olderThan?: Date;
}

/**
 * Revoke User Sessions Input - 撤銷用戶所有會話
 */
@InputType({ description: '撤銷用戶所有會話輸入' })
export class RevokeUserSessionsInput {
  @Field(() => String, { description: '用戶 ID' })
  @IsString()
  userId: string;

  @Field(() => String, { description: '撤銷原因' })
  @IsString()
  reason: string;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: '是否發送通知給用戶（預設：false）',
  })
  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @Field(() => String, {
    nullable: true,
    description: '自定義通知訊息（選填）',
  })
  @IsOptional()
  @IsString()
  notificationMessage?: string;

  @Field(() => RevokeUserSessionsOptionsInput, {
    nullable: true,
    description: '額外選項',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RevokeUserSessionsOptionsInput)
  options?: RevokeUserSessionsOptionsInput;
}

/**
 * Batch Revoke Criteria Input - 批量撤銷條件
 */
@InputType({ description: '批量撤銷條件' })
export class BatchRevokeCriteriaInput {
  @Field(() => [String], {
    nullable: true,
    description: '指定的會話 ID 列表',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sessionIds?: string[];

  @Field(() => [String], {
    nullable: true,
    description: '指定的用戶 ID 列表',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @Field(() => String, {
    nullable: true,
    description: 'IP 地址（模糊匹配）',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Field(() => String, {
    nullable: true,
    description: '設備資訊（模糊匹配）',
  })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @Field(() => Date, {
    nullable: true,
    description: '只撤銷在此時間之前未活動的會話',
  })
  @IsOptional()
  inactiveSince?: Date;

  @Field(() => Date, {
    nullable: true,
    description: '只撤銷在此時間之前創建的會話',
  })
  @IsOptional()
  createdBefore?: Date;
}

/**
 * Batch Revoke Input - 批量撤銷會話
 */
@InputType({ description: '批量撤銷會話輸入' })
export class BatchRevokeInput {
  @Field(() => BatchRevokeCriteriaInput, { description: '撤銷條件' })
  @ValidateNested()
  @Type(() => BatchRevokeCriteriaInput)
  criteria: BatchRevokeCriteriaInput;

  @Field(() => String, { description: '撤銷原因' })
  @IsString()
  reason: string;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: '是否發送通知給用戶（預設：false）',
  })
  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @Field(() => String, {
    nullable: true,
    description: '自定義通知訊息（批量撤銷建議提供）',
  })
  @IsOptional()
  @IsString()
  notificationMessage?: string;
}

/**
 * Revoke Other Devices Input - 撤銷其他設備會話
 */
@InputType({ description: '撤銷其他設備會話輸入' })
export class RevokeOtherDevicesInput {
  @Field(() => String, { description: '當前會話 ID（保留此會話）' })
  @IsString()
  currentSessionId: string;

  @Field(() => String, {
    nullable: true,
    defaultValue: '用戶主動登出其他設備',
    description: '撤銷原因',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Session Pagination Input - 會話分頁參數（Cursor-based）
 */
@InputType({ description: '會話分頁參數（Cursor-based）' })
export class SessionPaginationInput {
  @Field(() => Int, {
    nullable: false,
    defaultValue: 1,
    description: '頁碼（從 1 開始）',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, {
    nullable: false,
    defaultValue: 20,
    description: '每頁筆數（最大 100）',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
