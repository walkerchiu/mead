import { gql } from '@apollo/client';

/**
 * Profile 片段
 */
export const PROFILE_FRAGMENT = gql`
  fragment ProfileFields on Profile {
    id
    userId
    bio
    avatar
    phone
    address
    website
    language
    createdAt
    updatedAt
  }
`;

/**
 * 用戶片段
 */
export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    name
    lastLoginAt
    createdAt
  }
`;

/**
 * 用戶完整片段（包含 Profile）
 */
export const USER_WITH_PROFILE_FRAGMENT = gql`
  ${PROFILE_FRAGMENT}
  fragment UserWithProfileFields on User {
    id
    email
    name
    lastLoginAt
    createdAt
    updatedAt
    profile {
      ...ProfileFields
    }
  }
`;

/**
 * 登入 Mutation
 */
export const LOGIN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ... on AuthResponse {
        __typename
        accessToken
        user {
          ...UserFields
        }
      }
      ... on TwoFactorLoginResponse {
        __typename
        requiresTwoFactor
        temporaryToken
        message
      }
    }
  }
`;

/**
 * 驗證 2FA 登入
 */
export const VERIFY_TWO_FACTOR_LOGIN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation VerifyTwoFactorLogin($input: VerifyTwoFactorInput!) {
    verifyTwoFactorLogin(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`;

/**
 * 請求密碼重設
 */
export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

/**
 * 驗證重設 Token
 */
export const VERIFY_PASSWORD_RESET_TOKEN_QUERY = gql`
  query VerifyPasswordResetToken($token: String!) {
    verifyPasswordResetToken(token: $token) {
      valid
    }
  }
`;

/**
 * 重設密碼
 */
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

/**
 * 查詢當前用戶
 */
export const ME_QUERY = gql`
  ${USER_WITH_PROFILE_FRAGMENT}
  query Me {
    me {
      ...UserWithProfileFields
    }
  }
`;

/**
 * 查詢 2FA 設定
 */
export const MY_2FA_SETTINGS_QUERY = gql`
  query My2FASettings {
    my2FASettings {
      type
      enabled
      lastVerifiedAt
      createdAt
      updatedAt
    }
  }
`;

/**
 * 請求啟用 2FA
 */
export const REQUEST_ENABLE_2FA_MUTATION = gql`
  mutation RequestEnable2FA {
    requestEnable2FA {
      message
    }
  }
`;

/**
 * 確認啟用 2FA
 */
export const CONFIRM_ENABLE_2FA_MUTATION = gql`
  mutation ConfirmEnable2FA($code: String!) {
    confirmEnable2FA(code: $code) {
      message
      backupCodes
    }
  }
`;

/**
 * 請求停用 2FA
 */
export const REQUEST_DISABLE_2FA_MUTATION = gql`
  mutation RequestDisable2FA {
    requestDisable2FA {
      message
    }
  }
`;

/**
 * 確認停用 2FA
 */
export const CONFIRM_DISABLE_2FA_MUTATION = gql`
  mutation ConfirmDisable2FA($code: String!) {
    confirmDisable2FA(code: $code) {
      message
    }
  }
`;

/**
 * 重新整理 Access Token（Refresh Token 透過 HttpOnly Cookie 自動帶入）
 */
export const REFRESH_TOKEN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`;

/**
 * 登出（清除 refresh token）
 */
export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

/**
 * 更新當前用戶的基本資料
 */
export const UPDATE_MY_PROFILE_MUTATION = gql`
  ${USER_WITH_PROFILE_FRAGMENT}
  mutation UpdateMyProfile($input: UpdateUserInput!) {
    updateMyProfile(input: $input) {
      ...UserWithProfileFields
    }
  }
`;

/**
 * 更新當前用戶的詳細資料（Profile）
 */
export const UPDATE_MY_PROFILE_DETAILS_MUTATION = gql`
  ${PROFILE_FRAGMENT}
  mutation UpdateMyProfileDetails($input: UpdateProfileInput!) {
    updateMyProfileDetails(input: $input) {
      ...ProfileFields
    }
  }
`;

/**
 * 修改密碼
 */
export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;
