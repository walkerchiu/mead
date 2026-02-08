'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  AdminPanelSettings as AdminIcon,
  People as UsersIcon,
  Assessment as AuditIcon,
  Devices as SessionIcon,
  Schedule as CronIcon,
} from '@mui/icons-material';
import { getAccessToken, parseJwt } from '@/lib/auth';
import { useAuthReady } from '@/components/auth/ProtectedRoute';
import { AccessScope } from '@/types/auth';
import type { SidebarMenuItem } from '@/components/organisms';

export function useSidebarItems(): SidebarMenuItem[] {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const authReady = useAuthReady();

  const [permissions, setPermissions] = useState<{
    isHQ: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
    canManageSessions: boolean;
    canViewCronJobs: boolean;
  }>({
    isHQ: false,
    canManageUsers: false,
    canViewAuditLogs: false,
    canManageSessions: false,
    canViewCronJobs: false,
  });

  useEffect(() => {
    if (!authReady) return;

    const token = getAccessToken();
    if (!token) return;

    const payload = parseJwt(token);
    const scopes = (payload?.accessScopes as string[]) || [];
    const perms = (payload?.permissions as string[]) || [];
    const roles =
      (payload?.roles as Array<{ scope: string; roleNames: string[] }>) || [];

    const hasHQScope = scopes.includes(AccessScope.HQ_SCOPE);
    const isSuperHQ =
      hasHQScope && roles.some((r) => r.roleNames?.includes('SUPER_HQ'));

    setPermissions({
      isHQ: hasHQScope,
      canManageUsers:
        isSuperHQ ||
        perms.includes('users:create') ||
        (hasHQScope && perms.includes('users:read')),
      canViewAuditLogs: isSuperHQ || perms.includes('audit-logs:read'),
      canManageSessions: isSuperHQ || perms.includes('sessions:read'),
      canViewCronJobs: isSuperHQ || perms.includes('cron_jobs:read'),
    });
  }, [authReady]);

  const isActive = (path: string) => {
    const stripped = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
    return stripped === path || stripped.startsWith(path + '/');
  };

  // Build menu items based on permissions
  // Note: Dashboard 入口整併到側邊欄標題點擊，不再出現在選單列表
  const items: SidebarMenuItem[] = [];

  // HQ Administration submenu
  const adminChildren: SidebarMenuItem[] = [];

  if (permissions.canManageUsers) {
    adminChildren.push({
      id: 'users',
      label: t('users'),
      icon: <UsersIcon />,
      path: permissions.isHQ ? '/hq/users' : '/users',
    });
  }

  if (permissions.canViewAuditLogs) {
    adminChildren.push({
      id: 'auditLogs',
      label: t('auditLogs'),
      icon: <AuditIcon />,
      path: '/hq/audit-logs',
    });
  }

  if (permissions.canManageSessions) {
    adminChildren.push({
      id: 'sessions',
      label: t('sessions'),
      icon: <SessionIcon />,
      path: '/hq/sessions',
    });
  }

  if (permissions.canViewCronJobs) {
    adminChildren.push({
      id: 'cronJobs',
      label: t('cronJobs'),
      icon: <CronIcon />,
      path: '/hq/cron-jobs',
    });
  }

  if (adminChildren.length > 0) {
    items.push({
      id: 'administration',
      label: t('administration'),
      icon: <AdminIcon />,
      children: adminChildren,
      defaultExpanded: adminChildren.some((child) => isActive(child.path!)),
    });
  }

  return items;
}

export function useActiveItemId(): string {
  const pathname = usePathname();

  const isActive = (path: string) => {
    const stripped = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
    return stripped === path || stripped.startsWith(path + '/');
  };

  if (isActive('/hq/users') || isActive('/users')) return 'users';
  if (isActive('/hq/audit-logs')) return 'auditLogs';
  if (isActive('/hq/sessions')) return 'sessions';
  if (isActive('/hq/cron-jobs')) return 'cronJobs';
  return 'dashboard';
}
