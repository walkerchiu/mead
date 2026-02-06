/**
 * 前端認證相關類型定義
 * 與後端 AccessScope 枚舉保持同步
 */

/**
 * AccessScope - 訪問範圍枚舉
 * 決定使用者可以訪問哪個介面
 */
export enum AccessScope {
  PUBLIC_SCOPE = 'PUBLIC_SCOPE', // 公開頁面訪問
  CUSTOMER_SCOPE = 'CUSTOMER_SCOPE', // 客戶儀表板訪問
  ADMIN_SCOPE = 'ADMIN_SCOPE', // 管理後台訪問
}

/**
 * 使用者基本資訊類型
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  accessScopes?: AccessScope[];
  permissions?: Permission[];
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

/**
 * 權限類型
 */
export interface Permission {
  id: string;
  name: string;
  resource?: string;
  action?: string;
}

/**
 * 認證響應類型
 */
export interface AuthResponse {
  accessToken: string;
  user: User;
}
