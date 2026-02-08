import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AccessScope } from '../../common/enums/access-scope.enum';
import {
  SensitiveField,
  HQOnly,
  SelfAccessible,
} from '../../common/decorators/field-auth.decorator';
import { PageInfo } from '../../common/types/pagination.types';

/**
 * 用戶基本資訊
 * 用於其他模組引用時,不包含敏感資料
 */
@ObjectType({ description: '用戶基本資訊' })
export class UserBasicType {
  @Field(() => ID, { description: '用戶唯一識別碼' })
  id: string;

  @Field(() => String, { nullable: true, description: '用戶顯示名稱' })
  name?: string;

  @Field(() => String, { description: '電子郵件地址' })
  email: string;

  @Field(() => Date, { nullable: true, description: '刪除時間（已離職）' })
  deletedAt?: Date;
}

@ObjectType('Profile', { description: '用戶詳細資料（Profile）' })
export class ProfileType {
  @Field(() => ID, { description: 'Profile 唯一識別碼' })
  id: string;

  @Field(() => ID, { description: '關聯的用戶 ID' })
  userId: string;

  @Field(() => String, {
    nullable: true,
    description: '個人簡介（支援多行文字）',
  })
  bio?: string;

  @Field(() => String, { nullable: true, description: '頭像圖片 URL' })
  avatar?: string;

  @Field(() => String, {
    nullable: true,
    description: '聯絡電話（敏感資料，僅本人或管理員可見）',
  })
  @SensitiveField()
  @SelfAccessible()
  phone?: string;

  @Field(() => String, {
    nullable: true,
    description: '聯絡地址（敏感資料，僅本人或管理員可見）',
  })
  @SensitiveField()
  @SelfAccessible()
  address?: string;

  @Field(() => String, { nullable: true, description: '個人網站 URL' })
  website?: string;

  @Field(() => String, {
    nullable: true,
    description: '偏好語言（用於 email 和介面）',
  })
  language?: string;

  @Field({ description: '記錄建立時間' })
  createdAt: Date;

  @Field({ description: '記錄最後更新時間' })
  updatedAt: Date;

  @Field(() => Date, {
    nullable: true,
    description: '軟刪除時間戳記（僅管理員可見）',
  })
  @HQOnly()
  deletedAt?: Date;
}

@ObjectType('User', { description: '用戶基本資料（User）' })
export class UserType {
  @Field(() => ID, { description: '用戶唯一識別碼' })
  id: string;

  @Field({
    description: '電子郵件地址',
  })
  email: string;

  @Field(() => String, { nullable: true, description: '用戶顯示名稱' })
  name?: string;

  @Field(() => [AccessScope], {
    description: '訪問範圍陣列（PUBLIC_SCOPE, CUSTOMER_SCOPE, HQ_SCOPE）',
  })
  accessScopes: AccessScope[];

  @Field(() => Date, {
    nullable: true,
    description: '最後登入時間戳記',
  })
  lastLoginAt?: Date;

  @Field(() => Date, {
    nullable: true,
    description: '帳號鎖定至此時間（null 表示未鎖定）',
  })
  lockedUntil?: Date;

  @Field({ description: '記錄建立時間' })
  createdAt: Date;

  @Field({ description: '記錄最後更新時間' })
  updatedAt: Date;

  @Field(() => Date, {
    nullable: true,
    description: '軟刪除時間戳記（用於軟刪除功能）',
  })
  deletedAt?: Date;

  @Field(() => ProfileType, {
    nullable: true,
    description: '用戶詳細資料（Profile，一對一關聯）',
  })
  profile?: ProfileType;

  @Field(() => [RoleType], { nullable: true, description: '用戶角色列表' })
  roles?: RoleType[];

  // 注意: password 等敏感欄位永不暴露到 GraphQL API
}

/**
 * 角色資訊
 */
@ObjectType({ description: '角色資訊' })
export class RoleType {
  @Field(() => ID, { description: '角色唯一識別碼' })
  id: string;

  @Field(() => String, { description: '角色名稱' })
  name: string;

  @Field(() => String, { description: '角色顯示名稱' })
  displayName: string;

  @Field(() => String, { description: '角色範圍' })
  scope: string;

  @Field(() => String, { nullable: true, description: '角色描述' })
  description?: string;

  @Field(() => Boolean, { description: '是否為系統角色' })
  isSystem: boolean;
}

/**
 * 用戶角色關聯資訊
 */
@ObjectType({ description: '用戶角色關聯資訊' })
export class UserRoleType {
  @Field(() => ID, { description: '用戶角色關聯唯一識別碼' })
  id: string;

  @Field(() => RoleType, { description: '角色資訊' })
  role: RoleType;

  @Field(() => Date, { description: '授予時間' })
  grantedAt: Date;

  @Field(() => String, { nullable: true, description: '授予者 ID' })
  grantedBy?: string;
}

/**
 * 分頁的用戶列表響應
 */
@ObjectType({ description: '分頁的用戶列表響應' })
export class PaginatedUsers {
  @Field(() => [UserType], { description: '用戶資料陣列' })
  data: UserType[];

  @Field(() => PageInfo, {
    description: '分頁資訊（包含總數、頁碼、是否有下一頁等）',
  })
  pageInfo: PageInfo;
}
