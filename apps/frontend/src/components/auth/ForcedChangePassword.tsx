'use client';

import { Alert, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/templates';
import { ChangePasswordForm } from '@/components/organisms';
import {
  getAccessToken,
  parseJwt,
  refreshAccessToken,
  logout,
} from '@/lib/auth';
import { AccessScope } from '@/types/auth';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';

export interface ForcedChangePasswordProps {
  /**
   * 登入入口所屬 scope，決定改密後的預設落點優先序（與登入頁一致）：
   * `hq` → 優先 `/hq/users`、`customer` → 優先 `/dashboard`。
   */
  scope: 'hq' | 'customer';
}

/**
 * 依登入入口 scope 決定落點（與登入頁 resolveLandingPath 一致）。
 */
function resolveLandingPath(scope: 'hq' | 'customer'): string {
  const token = getAccessToken();
  if (!token) return '/dashboard';
  const scopes = (parseJwt(token)?.accessScopes as string[]) || [];
  if (scope === 'hq') {
    if (scopes.includes(AccessScope.HQ_SCOPE)) return '/hq/users';
    if (scopes.includes(AccessScope.CUSTOMER_SCOPE)) return '/dashboard';
  } else {
    if (scopes.includes(AccessScope.CUSTOMER_SCOPE)) return '/dashboard';
    if (scopes.includes(AccessScope.HQ_SCOPE)) return '/hq/users';
  }
  // 純 public（無 CUSTOMER/HQ 商業 scope）：/dashboard 受守門，導向無守門的個人安全頁。
  return '/settings/security';
}

/**
 * 首次登入強制變更密碼的共用畫面。HQ 與 customer 各自的 `/change-password` 路由皆以此組成，
 * 差異僅在 `scope` 決定的落點優先序。改密成功後刷新出無 `mustChangePassword` claim 的 JWT，
 * 再導向 `next`（站內相對路徑）或依 scope 推導的落點。
 */
export default function ForcedChangePassword({
  scope,
}: ForcedChangePasswordProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.changePassword');

  /**
   * 只接受站內相對路徑作為落點，避免 open redirect；否則以 scope 推導。
   */
  const resolveTarget = (): string => {
    const next = searchParams.get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) {
      return next;
    }
    return resolveLandingPath(scope);
  };

  const handleSuccess = async () => {
    // 後端在變更密碼時已把 mustChangePassword 清為 false 且保留當前 session；
    // 刷新一次 token 取得不再帶該 claim 的新 JWT，ProtectedRoute 才會放行落點。
    const refreshed = await refreshAccessToken('forced-password-change');
    if (!refreshed) {
      // 極少數刷新失敗：登出走乾淨的重新登入，避免帶舊 claim 回落點造成關卡反覆導向。
      await logout();
      return;
    }
    router.replace(resolveTarget());
  };

  return (
    <AuthLayout title={t('title')} subtitle={t('subtitle')}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('notice')}
        </Alert>
        <ChangePasswordForm onSuccess={handleSuccess} />
      </Box>
    </AuthLayout>
  );
}
