import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * NotificationPreferencesGQLType - 通知偏好設定 GraphQL Type
 */
@ObjectType({ description: '通知偏好設定' })
export class NotificationPreferencesGQLType {
  @Field(() => ID, { description: '設定唯一識別碼' })
  id: string;

  @Field(() => ID, { description: '用戶 ID' })
  userId: string;

  // === 通知類型開關 ===
  @Field({ description: '是否啟用資訊通知' })
  enableInfo: boolean;

  @Field({ description: '是否啟用成功通知' })
  enableSuccess: boolean;

  @Field({ description: '是否啟用警告通知' })
  enableWarning: boolean;

  @Field({ description: '是否啟用錯誤通知' })
  enableError: boolean;

  // === 通知渠道開關 ===
  @Field({ description: '是否啟用瀏覽器通知（應用程式內）' })
  enableBrowser: boolean;

  @Field({ description: '是否啟用電子郵件通知' })
  enableEmail: boolean;

  @Field({ description: '是否啟用推送通知' })
  enablePush: boolean;

  // === 進階設定 ===
  @Field({ description: '是否啟用通知音效' })
  enableSound: boolean;

  @Field({ description: '是否啟用桌面通知' })
  enableDesktop: boolean;

  @Field({ description: '是否啟用行動裝置通知' })
  enableMobile: boolean;

  @Field({ description: '建立時間' })
  createdAt: Date;

  @Field({ description: '更新時間' })
  updatedAt: Date;
}

/**
 * UpdateNotificationPreferencesInput - 更新通知偏好設定 Input Type
 */
@InputType({ description: '更新通知偏好設定輸入' })
export class UpdateNotificationPreferencesInput {
  // === 通知類型開關 ===
  @Field({ nullable: true, description: '是否啟用資訊通知' })
  @IsOptional()
  @IsBoolean()
  enableInfo?: boolean;

  @Field({ nullable: true, description: '是否啟用成功通知' })
  @IsOptional()
  @IsBoolean()
  enableSuccess?: boolean;

  @Field({ nullable: true, description: '是否啟用警告通知' })
  @IsOptional()
  @IsBoolean()
  enableWarning?: boolean;

  @Field({ nullable: true, description: '是否啟用錯誤通知' })
  @IsOptional()
  @IsBoolean()
  enableError?: boolean;

  // === 通知渠道開關 ===
  @Field({ nullable: true, description: '是否啟用瀏覽器通知' })
  @IsOptional()
  @IsBoolean()
  enableBrowser?: boolean;

  @Field({ nullable: true, description: '是否啟用電子郵件通知' })
  @IsOptional()
  @IsBoolean()
  enableEmail?: boolean;

  @Field({ nullable: true, description: '是否啟用推送通知' })
  @IsOptional()
  @IsBoolean()
  enablePush?: boolean;

  // === 進階設定 ===
  @Field({ nullable: true, description: '是否啟用通知音效' })
  @IsOptional()
  @IsBoolean()
  enableSound?: boolean;

  @Field({ nullable: true, description: '是否啟用桌面通知' })
  @IsOptional()
  @IsBoolean()
  enableDesktop?: boolean;

  @Field({ nullable: true, description: '是否啟用行動裝置通知' })
  @IsOptional()
  @IsBoolean()
  enableMobile?: boolean;
}
