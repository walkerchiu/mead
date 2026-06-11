'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ForcedChangePassword from '@/components/auth/ForcedChangePassword';

/**
 * HQ scope 的首次登入強制變更密碼頁（`/hq/change-password`）。改完回 HQ 落點
 * （`/hq/users` 優先）。customer 版在 `/change-password`。
 *
 * 以 ProtectedRoute 包裹確保已登入；因路徑含 `/change-password`，ProtectedRoute 的強制改密
 * 關卡不會把本頁再導回自己（不會 loop）。
 */
export default function HqChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ForcedChangePassword scope="hq" />
    </ProtectedRoute>
  );
}
