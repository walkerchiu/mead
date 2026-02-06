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
 * 解析字串為 AccessScope
 * 無效值返回空陣列
 */
export function parseAccessScopes(scopes?: string | string[]): AccessScope[] {
  if (!scopes) return [];

  const scopeArray = Array.isArray(scopes) ? scopes : [scopes];
  const validScopes: AccessScope[] = [];

  for (const scope of scopeArray) {
    const upperScope = scope.toUpperCase();
    if (Object.values(AccessScope).includes(upperScope as AccessScope)) {
      validScopes.push(upperScope as AccessScope);
    }
  }

  return validScopes;
}

/**
 * 檢查使用者是否有指定的 AccessScope
 */
export function hasAccessScope(
  userScopes: AccessScope[],
  requiredScope: AccessScope,
): boolean {
  return userScopes.includes(requiredScope);
}

/**
 * 檢查使用者是否有任一指定的 AccessScope（OR 邏輯）
 */
export function hasAnyAccessScope(
  userScopes: AccessScope[],
  requiredScopes: AccessScope[],
): boolean {
  return requiredScopes.some((scope) => userScopes.includes(scope));
}
