'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ForcedChangePassword from '@/components/auth/ForcedChangePassword';

/**
 * Customer scope 的首次登入強制變更密碼頁（`/change-password`）。改完回 customer 落點
 * （`/dashboard` 優先）。HQ 版在 `/hq/change-password`。
 *
 * 以 ProtectedRoute 包裹確保已登入；因路徑含 `/change-password`，ProtectedRoute 的強制改密
 * 關卡不會把本頁再導回自己（不會 loop）。
 */
export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ForcedChangePassword scope="customer" />
    </ProtectedRoute>
  );
}
