import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { AccessScope } from '../common/enums/access-scope.enum';
import { UserType } from '../modules/user/user.types';

// 註冊 AccessScope enum 到 GraphQL Schema
registerEnumType(AccessScope, {
  name: 'AccessScope',
  description:
    '訪問範圍層級（PUBLIC_SCOPE: 公開訪問, CUSTOMER_SCOPE: 客戶層級, HQ_SCOPE: 管理員層級）',
});

/**
 * JWT Token Payload（內部使用，不暴露到 GraphQL）
 */
export interface JwtPayload {
  /** 用戶 ID（JWT sub claim） */
  sub: string;

  /** 用戶電子郵件 */
  email: string;

  /** 用戶可訪問的範圍陣列 */
  accessScopes: AccessScope[];

  /** 用戶的角色資訊（按 scope 分組） */
  roles?: {
    /** 角色所屬的訪問範圍 */
    scope: AccessScope;

    /** 該 scope 下的角色名稱陣列 */
    roleNames: string[];
  }[];

  /** 用戶的權限名稱陣列（扁平化所有 scope 的權限） */
  permissions?: string[];
}

/**
 * Auth Response - 登入/註冊成功後的 GraphQL 回應
 * Refresh Token 透過 HttpOnly Cookie 傳遞，不在 GraphQL 回應中暴露
 */
@ObjectType({ description: '認證響應（包含 Access Token 和用戶資訊）' })
export class AuthResponse {
  @Field(() => String, {
    description: 'Access Token（JWT，有效期 15 分鐘，用於 API 請求認證）',
  })
  accessToken: string;

  @Field(() => UserType, { description: '登入用戶的基本資訊' })
  user: UserType;
}

/**
 * 內部使用的 Token 結果（包含 refreshToken，供 resolver 設定 HttpOnly Cookie）
 * 不暴露到 GraphQL Schema
 */
export interface AuthTokenResult {
  accessToken: string;
  refreshToken: string;
  user: UserType;
}

/**
 * Register Input（已棄用，請使用 registerCustomer 或 registerHQ）
 */
@InputType({ description: '註冊輸入（已棄用）' })
export class RegisterInput {
  @Field(() => String, { description: '電子郵件地址' })
  @IsEmail({}, { message: '無效的電子郵件格式' })
  email: string;

  @Field(() => String, {
    description: '密碼（至少 8 字符，包含大小寫字母和數字）',
  })
  @IsString()
  @Length(8, 100, { message: '密碼長度必須在 8-100 字符之間' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};:,.<>])/,
    {
      message: '密碼必須包含大小寫字母、數字和特殊符號',
    },
  )
  password: string;

  @Field(() => String, { nullable: true, description: '顯示名稱（選填）' })
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: '名稱長度必須在 2-50 字符之間' })
  name?: string;
}

/**
 * Login Input
 */
@InputType({ description: '登入輸入' })
export class LoginInput {
  @Field(() => String, { description: '電子郵件地址' })
  @IsEmail({}, { message: '無效的電子郵件格式' })
  email: string;

  @Field(() => String, { description: '密碼' })
  @IsString()
  @Length(1, 100, { message: '密碼不可為空' })
  password: string;
}

/**
 * 2FA 登入回應（需要驗證）
 */
@ObjectType({ description: '需要雙因素認證的登入回應' })
export class TwoFactorLoginResponse {
  @Field({ description: '是否需要雙因素認證' })
  requiresTwoFactor: boolean;

  @Field({ description: '臨時 Token（用於完成 2FA 驗證）' })
  temporaryToken: string;

  @Field({ description: '提示訊息' })
  message: string;
}

/**
 * 驗證 2FA 輸入
 */
@InputType({ description: '驗證雙因素認證輸入' })
export class VerifyTwoFactorInput {
  @Field(() => String, { description: '臨時 Token（從登入回應中獲取）' })
  @IsString()
  @Length(1, 500, { message: '無效的臨時 Token' })
  temporaryToken: string;

  @Field(() => String, { description: '6 位數驗證碼（從 Email 獲取）' })
  @IsString()
  @Matches(/^\d{6}$/, { message: '驗證碼必須是 6 位數字' })
  code: string;

  @Field(() => Boolean, {
    nullable: true,
    description: '是否使用備用驗證碼（預設：false）',
  })
  @IsOptional()
  @IsBoolean()
  isBackupCode?: boolean;
}
