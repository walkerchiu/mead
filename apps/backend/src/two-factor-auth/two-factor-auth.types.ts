import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

// 註冊 enum 到 GraphQL
export enum TwoFactorType {
  EMAIL = 'EMAIL',
  TOTP = 'TOTP',
  SMS = 'SMS',
}

registerEnumType(TwoFactorType, {
  name: 'TwoFactorType',
  description: '雙因素認證類型',
});

export enum VerificationPurpose {
  LOGIN = 'LOGIN',
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

registerEnumType(VerificationPurpose, {
  name: 'VerificationPurpose',
  description: '驗證目的',
});

/**
 * 2FA 設定資訊
 */
@ObjectType({ description: '雙因素認證設定資訊' })
export class TwoFactorAuthType {
  @Field(() => TwoFactorType, { description: '雙因素認證類型' })
  type: TwoFactorType;

  @Field({ description: '是否已啟用' })
  enabled: boolean;

  @Field(() => Date, { nullable: true, description: '最後驗證時間' })
  lastVerifiedAt?: Date;

  @Field(() => Date, { description: '建立時間' })
  createdAt: Date;

  @Field(() => Date, { description: '更新時間' })
  updatedAt: Date;
}

/**
 * 基本成功回應
 */
@ObjectType({ description: '基本成功回應' })
export class BasicResponse {
  @Field({ description: '成功訊息' })
  message: string;
}

/**
 * 啟用 2FA 的回應（包含備用驗證碼）
 */
@ObjectType({ description: '啟用雙因素認證的回應' })
export class Enable2FAResponse {
  @Field({ description: '成功訊息' })
  message: string;

  @Field(() => [String], {
    description: '備用驗證碼（僅顯示一次，請妥善保存）',
  })
  backupCodes: string[];
}

/**
 * 2FA 登入回應（需要驗證碼）
 */
@ObjectType({ description: '需要雙因素認證的登入回應' })
export class TwoFactorRequiredResponse {
  @Field({ description: '是否需要雙因素認證' })
  twoFactorRequired: boolean;

  @Field({ description: '提示訊息' })
  message: string;

  @Field({ description: '臨時 Token（用於完成 2FA 驗證）' })
  temporaryToken: string;
}

/**
 * 驗證 2FA 後的登入回應
 */
@ObjectType({ description: '驗證雙因素認證後的登入回應' })
export class VerifyTwoFactorResponse {
  @Field({ description: '存取 Token' })
  accessToken: string;

  @Field({ description: '成功訊息' })
  message: string;
}
