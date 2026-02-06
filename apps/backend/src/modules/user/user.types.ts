import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AccessScope } from '../../common/enums/access-scope.enum';
import {
  SensitiveField,
  AdminOnly,
  SelfAccessible,
} from '../../common/decorators/field-auth.decorator';
import { PageInfo } from '../../common/types/pagination.types';

@ObjectType({ description: '使用者詳細資料（Profile）' })
export class ProfileType {
  @Field(() => ID, { description: 'Profile 唯一識別碼' })
  id: string;

  @Field(() => ID, { description: '關聯的使用者 ID' })
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
  @AdminOnly()
  deletedAt?: Date;
}

@ObjectType({ description: '使用者基本資料（User）' })
export class UserType {
  @Field(() => ID, { description: '使用者唯一識別碼' })
  id: string;

  @Field({
    description: '電子郵件地址（敏感資料，僅本人或管理員可見）',
  })
  @SensitiveField()
  @SelfAccessible()
  email: string;

  @Field(() => String, { nullable: true, description: '使用者顯示名稱' })
  name?: string;

  @Field(() => [AccessScope], {
    description: '訪問範圍陣列（PUBLIC_SCOPE, CUSTOMER_SCOPE, ADMIN_SCOPE）',
  })
  accessScopes: AccessScope[];

  @Field(() => Date, {
    nullable: true,
    description: '最後登入時間戳記（敏感資料，僅本人或管理員可見）',
  })
  @SensitiveField()
  @SelfAccessible()
  lastLoginAt?: Date;

  @Field({ description: '記錄建立時間' })
  createdAt: Date;

  @Field({ description: '記錄最後更新時間' })
  updatedAt: Date;

  @Field(() => Date, {
    nullable: true,
    description: '軟刪除時間戳記（僅管理員可見，用於軟刪除功能）',
  })
  @AdminOnly()
  deletedAt?: Date;

  @Field(() => ProfileType, {
    nullable: true,
    description: '使用者詳細資料（Profile，一對一關聯）',
  })
  profile?: ProfileType;

  // 注意: password 等敏感欄位永不暴露到 GraphQL API
}

/**
 * 分頁的使用者列表響應
 */
@ObjectType({ description: '分頁的使用者列表響應' })
export class PaginatedUsers {
  @Field(() => [UserType], { description: '使用者資料陣列' })
  data: UserType[];

  @Field(() => PageInfo, {
    description: '分頁資訊（包含總數、頁碼、是否有下一頁等）',
  })
  pageInfo: PageInfo;
}
