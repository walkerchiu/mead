import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

/**
 * 功能權限矩陣的 GraphQL 型別（對齊 nptc RbacDtos，跟隨 npt）。
 * 註：角色啟用／停用（isActive 凍結）屬後續階段，本模組僅提供「角色 × 功能 read/write」矩陣。
 */

@ObjectType({ description: '角色對單一功能的檢視／管理存取狀態' })
export class FeatureAccessType {
  @Field({ description: '功能 key（前端依此 i18n）' })
  featureKey: string;

  @Field({ description: '是否可檢視該功能' })
  canRead: boolean;

  @Field({ description: '是否可管理該功能' })
  canWrite: boolean;
}

@ObjectType({ description: '功能權限矩陣中的一列（一個角色 × 各功能存取）' })
export class RoleFeatureRowType {
  @Field({ description: '角色 ID' })
  roleId: string;

  @Field({ description: '角色名稱（OWNER/ADMIN/...）' })
  name: string;

  @Field({ description: '角色顯示名稱' })
  displayName: string;

  @Field(() => Int, { description: '角色 rank（5..1）' })
  rank: number;

  @Field({ description: '是否鎖定（OWNER 永遠全開且不可調整）' })
  locked: boolean;

  @Field(() => [FeatureAccessType], { description: '各功能的存取狀態' })
  features: FeatureAccessType[];
}

@InputType({ description: '設定角色對單一功能的檢視／管理存取' })
export class SetRoleFeatureAccessInput {
  @Field({ description: '角色 ID' })
  @IsString()
  roleId: string;

  @Field({ description: '功能 key' })
  @IsString()
  featureKey: string;

  @Field({ description: '是否可檢視' })
  @IsBoolean()
  canRead: boolean;

  @Field({ description: '是否可管理（隱含檢視）' })
  @IsBoolean()
  canWrite: boolean;
}
