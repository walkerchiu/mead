'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Link,
  Stack,
} from '@mui/material';
import {
  Info as InfoIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useLocale } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * AboutContent - Application information content component
 *
 * Displays application information based on the user's role:
 * - All users: basic features (profile, security, notifications)
 * - HQ/Admin: admin features (audit logs, session management, RBAC)
 */
export function AboutContent() {
  const locale = useLocale();
  const { hasPermission, hasScope } = usePermissions();

  const isHQ = hasScope('HQ_SCOPE');
  const canManageAuditLogs = hasPermission('audit_logs:read') || isHQ;
  const canManageSessions = hasPermission('sessions:read') || isHQ;

  const isZhTW = locale === 'zh-TW';

  const version = '0.1.0';
  const buildDate = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const techStack = [
    { name: 'Next.js', version: '16.x', category: 'Frontend Framework' },
    { name: 'React', version: '19.x', category: 'UI Library' },
    { name: 'TypeScript', version: '5.x', category: 'Language' },
    { name: 'Material-UI', version: '7.x', category: 'Component Library' },
    { name: 'Apollo Client', version: '4.x', category: 'GraphQL Client' },
    { name: 'Storybook', version: '10.x', category: 'UI Development' },
    { name: 'NestJS', version: '11.x', category: 'Backend Framework' },
    { name: 'Prisma', version: '6.x', category: 'Database ORM' },
    { name: 'PostgreSQL', version: '17.x', category: 'Database' },
    { name: 'RabbitMQ', version: 'Latest', category: 'Message Queue' },
    { name: 'Dragonfly', version: 'Latest', category: 'Cache & PubSub' },
    { name: 'Turbo', version: '2.x', category: 'Monorepo Tool' },
  ];

  // === Features (role-aware) ===
  const allFeatures: Array<{ label: string; visible: boolean }> = [
    {
      label: isZhTW ? '用戶認證與授權' : 'User Authentication & Authorization',
      visible: true,
    },
    {
      label: isZhTW ? '雙因素驗證 (2FA)' : 'Two-Factor Authentication (2FA)',
      visible: true,
    },
    { label: isZhTW ? '通知系統' : 'Notification System', visible: true },
    {
      label: isZhTW ? '國際化支援' : 'Internationalization Support',
      visible: true,
    },
    { label: 'GraphQL API', visible: isHQ },
    { label: 'GraphQL Subscriptions', visible: isHQ },
    {
      label: isZhTW ? '會話管理' : 'Session Management',
      visible: canManageSessions,
    },
    { label: isZhTW ? '審計日誌' : 'Audit Logs', visible: canManageAuditLogs },
    {
      label: isZhTW ? 'RBAC 權限控制' : 'RBAC Permission Control',
      visible: isHQ,
    },
    {
      label: isZhTW ? '欄位級授權' : 'Field-Level Authorization',
      visible: isHQ,
    },
    { label: 'Rate Limiting', visible: isHQ },
  ];

  const visibleFeatures = allFeatures.filter((f) => f.visible);

  return (
    <Box>
      {/* Version Information */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? 'MEAD 專案' : 'MEAD Project'}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 1 }}
        >
          <Chip
            label={`${isZhTW ? '版本' : 'Version'} ${version}`}
            color="primary"
            size="small"
            variant="outlined"
          />
          <Chip label="Alpha" color="warning" size="small" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {isZhTW ? '建置日期' : 'Build Date'}：{buildDate}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Project Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '專案簡介' : 'Project Description'}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {isZhTW
            ? 'MEAD（New Project Template）是一套企業級應用程式骨架，預先整合認證授權、用戶管理、稽核日誌、通知系統等基礎建設，協助團隊快速啟動新專案。'
            : 'MEAD (New Project Template) is an enterprise application skeleton with built-in infrastructure for authentication, user management, audit logs, and notifications to help teams kickstart new projects.'}
        </Typography>
        {isHQ && (
          <Typography variant="body2" color="text.secondary">
            {isZhTW
              ? '本專案採用 Monorepo 架構，整合前端（Next.js）、後端（NestJS）和資料庫（PostgreSQL）層，提供完整的開發體驗。'
              : 'This project adopts a Monorepo architecture, integrating frontend (Next.js), backend (NestJS), and database (PostgreSQL) layers for a complete development experience.'}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Main Features */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '主要功能' : 'Main Features'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {visibleFeatures.map((feature, index) => (
            <Chip
              key={index}
              label={feature.label}
              size="small"
              variant="outlined"
              icon={<SecurityIcon />}
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Technology Stack - only for HQ */}
      {isHQ && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {isZhTW ? '技術堆疊' : 'Technology Stack'}
            </Typography>
            <List dense>
              {techStack.map((tech, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2">{tech.name}</Typography>
                        <Box
                          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                        >
                          <Chip
                            label={tech.category}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            v{tech.version}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* License */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '授權資訊' : 'License'}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {isZhTW
            ? '本專案採用 MIT 授權條款發布。'
            : 'This project is released under the MIT License.'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Copyright © 2024 MEAD Project Contributors
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Contact */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '聯絡資訊' : 'Contact'}
        </Typography>
        <List dense>
          <ListItem>
            <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
            <ListItemText
              primary={isZhTW ? '專案作者' : 'Project Author'}
              secondary="Walker Chiu"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem>
            <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
            <Link
              href="mailto:walker.chiu@icp-si.com"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              walker.chiu@icp-si.com
            </Link>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}

export default AboutContent;
