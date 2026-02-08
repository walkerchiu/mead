import { ObjectType, Field, ID } from '@nestjs/graphql';

// 模板未預設任何 PAT scope。請於 personal-access-token.service.ts 的 ALLOWED_SCOPES 中
// 加入您專案需要的 scope 字串（如 'reports:read'）。

@ObjectType('PersonalAccessToken', { description: '個人存取權杖' })
export class PersonalAccessTokenType {
  @Field(() => ID, { description: '權杖 ID' })
  id: string;

  @Field(() => String, { description: '權杖名稱' })
  name: string;

  @Field(() => String, { description: '權杖前綴（供識別）' })
  tokenPrefix: string;

  @Field(() => [String], { description: '授權範圍' })
  scopes: string[];

  @Field(() => Date, { nullable: true, description: '最後使用時間' })
  lastUsedAt?: Date | null;

  @Field(() => String, { nullable: true, description: '最後使用的 IP' })
  lastUsedIp?: string | null;

  @Field(() => Date, { description: '到期時間' })
  expiresAt: Date;

  @Field(() => Date, { description: '建立時間' })
  createdAt: Date;

  @Field(() => Date, { nullable: true, description: '撤銷時間' })
  revokedAt?: Date | null;
}

@ObjectType({ description: '建立個人存取權杖結果（含明文 Token，僅此一次）' })
export class CreatePersonalAccessTokenResult {
  @Field(() => String, {
    description: '明文 Token（僅此一次顯示，請妥善保存）',
  })
  token: string;

  @Field(() => PersonalAccessTokenType, { description: '權杖資訊' })
  personalAccessToken: PersonalAccessTokenType;
}
