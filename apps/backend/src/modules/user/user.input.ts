import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  MaxLength,
  MinLength,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { AccessScope } from '../../common/enums/access-scope.enum';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '名稱必須是字串' })
  @MaxLength(100, { message: '名稱長度不可超過 100 字元' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email 格式不正確' })
  email?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '個人簡介必須是字串' })
  @MaxLength(500, { message: '個人簡介長度不可超過 500 字元' })
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '頭像必須是字串' })
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '電話必須是字串' })
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '地址必須是字串' })
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '網站必須是字串' })
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '語言必須是字串' })
  language?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty({ message: '當前密碼不可為空' })
  @IsString({ message: '當前密碼必須是字串' })
  currentPassword: string;

  @Field()
  @IsNotEmpty({ message: '新密碼不可為空' })
  @IsString({ message: '新密碼必須是字串' })
  newPassword: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean({ message: '撤銷其他 sessions 必須是布林值' })
  revokeOtherSessions?: boolean;
}

/**
 * 創建用戶輸入（管理員使用）
 */
@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty({ message: 'Email 不可為空' })
  @IsEmail({}, { message: 'Email 格式不正確' })
  email: string;

  @Field()
  @IsNotEmpty({ message: '名稱不可為空' })
  @IsString({ message: '名稱必須是字串' })
  @MaxLength(100, { message: '名稱長度不可超過 100 字元' })
  name: string;

  @Field()
  @IsNotEmpty({ message: '密碼不可為空' })
  @IsString({ message: '密碼必須是字串' })
  @MinLength(8, { message: '密碼長度至少需要 8 字元' })
  password: string;
}

/**
 * 管理員更新用戶輸入
 */
@InputType()
export class HQUpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '名稱必須是字串' })
  @MaxLength(100, { message: '名稱長度不可超過 100 字元' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email 格式不正確' })
  email?: string;
}

/**
 * 管理員重設用戶密碼輸入
 */
@InputType()
export class HQResetPasswordInput {
  @Field()
  @IsNotEmpty({ message: '新密碼不可為空' })
  @IsString({ message: '新密碼必須是字串' })
  @MinLength(8, { message: '密碼長度至少需要 8 字元' })
  newPassword: string;

  @Field({ defaultValue: true, description: '是否撤銷該用戶的所有 sessions' })
  @IsOptional()
  @IsBoolean({ message: '撤銷 sessions 必須是布林值' })
  revokeAllSessions?: boolean;
}

/**
 * 鎖定用戶輸入
 */
@InputType()
export class LockUserInput {
  @Field({
    description:
      '鎖定時長（分鐘），預設 60 分鐘，最長 43200 分鐘（30 天），999999 表示永久鎖定',
  })
  @IsInt({ message: '鎖定時長必須是整數' })
  @Min(1, { message: '鎖定時長至少需要 1 分鐘' })
  @Max(999999, { message: '鎖定時長最長為 999999 分鐘（永久）' })
  lockDurationMinutes: number;

  @Field({
    nullable: true,
    description: '鎖定原因',
  })
  @IsOptional()
  @IsString({ message: '鎖定原因必須是字串' })
  @MaxLength(500, { message: '鎖定原因長度不可超過 500 字元' })
  reason?: string;
}

/**
 * 分配角色輸入
 */
@InputType()
export class AssignRoleInput {
  @Field({ description: '目標用戶 ID' })
  @IsNotEmpty({ message: '目標用戶 ID 不可為空' })
  @IsString({ message: '目標用戶 ID 必須是字串' })
  targetUserId: string;

  @Field({ description: '角色 ID' })
  @IsNotEmpty({ message: '角色 ID 不可為空' })
  @IsString({ message: '角色 ID 必須是字串' })
  roleId: string;
}

/**
 * 撤銷角色輸入
 */
@InputType()
export class RevokeRoleInput {
  @Field({ description: '目標用戶 ID' })
  @IsNotEmpty({ message: '目標用戶 ID 不可為空' })
  @IsString({ message: '目標用戶 ID 必須是字串' })
  targetUserId: string;

  @Field({ description: '角色 ID' })
  @IsNotEmpty({ message: '角色 ID 不可為空' })
  @IsString({ message: '角色 ID 必須是字串' })
  roleId: string;
}

/**
 * 用戶狀態枚舉
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
}

// 註冊 GraphQL enum
registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: '用戶狀態',
});

/**
 * 用戶篩選輸入
 */
@InputType()
export class UserFilterInput {
  @Field({
    nullable: true,
    description: '搜尋關鍵字（搜尋名稱或電子郵件）',
  })
  @IsOptional()
  @IsString({ message: '搜尋關鍵字必須是字串' })
  search?: string;

  @Field(() => AccessScope, {
    nullable: true,
    description: '存取範圍篩選',
  })
  @IsOptional()
  @IsEnum(AccessScope, { message: '存取範圍必須是有效的 AccessScope' })
  accessScope?: AccessScope;

  @Field(() => UserStatus, {
    nullable: true,
    description: '用戶狀態篩選（啟用、已鎖定、已刪除）',
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '狀態必須是有效的 UserStatus' })
  status?: UserStatus;

  @Field({
    nullable: true,
    description: '角色 ID 篩選',
  })
  @IsOptional()
  @IsString({ message: '角色 ID 必須是字串' })
  roleId?: string;
}
