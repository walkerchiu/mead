'use client';

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useLocale } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * HelpContent - Help and documentation content component
 *
 * Displays help information based on the user's role:
 * - All users: profile, security, notification settings
 * - HQ/Admin: audit logs, session management, user management
 */
export function HelpContent() {
  const locale = useLocale();
  const { hasPermission, hasScope } = usePermissions();

  const isHQ = hasScope('HQ_SCOPE');
  const canManageAuditLogs = hasPermission('audit_logs:read') || isHQ;
  const canManageSessions = hasPermission('sessions:read') || isHQ;
  const canManageUsers = hasPermission('users:manage') || isHQ;

  const isZhTW = locale === 'zh-TW';

  // === Quick Start Steps ===
  const quickStartSteps: string[] = [
    isZhTW ? '完善您的個人資料資訊' : 'Complete your profile information',
    isZhTW
      ? '設定雙因素驗證以提高帳戶安全性'
      : 'Set up two-factor authentication for enhanced account security',
    isZhTW ? '自訂通知偏好設定' : 'Customize notification preferences',
    isZhTW
      ? '熟悉主要功能和導航'
      : 'Familiarize yourself with main features and navigation',
  ];
  if (canManageAuditLogs) {
    quickStartSteps.push(
      isZhTW
        ? '探索審計日誌與管理功能'
        : 'Explore audit logs and management features',
    );
  }

  // === FAQ Items ===
  const faqItems: Array<{ question: string; answer: string }> = [
    {
      question: isZhTW
        ? '如何修改我的個人資料？'
        : 'How do I update my profile?',
      answer: isZhTW
        ? '前往「設定 > 個人資料」頁面，您可以在此更新您的姓名、電子郵件等個人資訊。'
        : 'Go to "Settings > Profile" page, where you can update your name, email, and other personal information.',
    },
    {
      question: isZhTW
        ? '如何啟用雙因素驗證？'
        : 'How do I enable two-factor authentication?',
      answer: isZhTW
        ? '前往「設定 > 安全性」頁面，點擊「啟用雙因素驗證」按鈕，然後使用您的驗證器應用程式掃描 QR 碼。'
        : 'Go to "Settings > Security" page, click "Enable Two-Factor Authentication" button, then scan the QR code with your authenticator app.',
    },
    {
      question: isZhTW ? '如何更改密碼？' : 'How do I change my password?',
      answer: isZhTW
        ? '前往「設定 > 安全性」頁面，在「變更密碼」區塊輸入您的當前密碼和新密碼，然後點擊儲存。'
        : 'Go to "Settings > Security" page, enter your current password and new password in the "Change Password" section, then click save.',
    },
    {
      question: isZhTW
        ? '如何更改通知偏好設定？'
        : 'How do I change notification preferences?',
      answer: isZhTW
        ? '前往「設定 > 通知」頁面，您可以自訂各種通知類型的接收偏好。'
        : 'Go to "Settings > Notifications" page, where you can customize preferences for various notification types.',
    },
    {
      question: isZhTW
        ? '我忘記密碼了怎麼辦？'
        : 'What if I forget my password?',
      answer: isZhTW
        ? '在登入頁面點擊「忘記密碼？」連結，輸入您的電子郵件地址，我們將發送重設密碼的連結給您。'
        : 'Click the "Forgot password?" link on the login page, enter your email address, and we will send you a password reset link.',
    },
  ];
  // === Common Features ===
  const features: Array<{ title: string; description: string }> = [
    {
      title: isZhTW ? '個人資料管理' : 'Profile Management',
      description: isZhTW
        ? '更新您的個人資訊和偏好設定'
        : 'Update your personal information and preferences',
    },
    {
      title: isZhTW ? '安全性設定' : 'Security Settings',
      description: isZhTW
        ? '管理密碼、雙因素驗證和帳戶安全'
        : 'Manage password, two-factor authentication, and account security',
    },
    {
      title: isZhTW ? '通知管理' : 'Notification Management',
      description: isZhTW
        ? '自訂通知類型和接收方式'
        : 'Customize notification types and delivery methods',
    },
  ];
  if (canManageAuditLogs) {
    features.push({
      title: isZhTW ? '審計日誌' : 'Audit Logs',
      description: isZhTW
        ? '查看用戶操作記錄和系統事件'
        : 'View user activity records and system events',
    });
  }
  if (canManageSessions) {
    features.push({
      title: isZhTW ? '會話管理' : 'Session Management',
      description: isZhTW
        ? '管理用戶登入狀態和撤銷會話'
        : 'Manage user login sessions and revoke sessions',
    });
  }
  if (canManageUsers) {
    features.push({
      title: isZhTW ? '用戶管理' : 'User Management',
      description: isZhTW
        ? '管理系統用戶帳號和權限'
        : 'Manage system user accounts and permissions',
    });
  }

  return (
    <Box>
      {/* Quick Start */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '快速開始' : 'Quick Start'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isZhTW
            ? '歡迎使用 MEAD 專案！按照以下步驟快速上手：'
            : 'Welcome to MEAD project! Follow these steps to get started:'}
        </Typography>
        <List dense>
          {quickStartSteps.map((step, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${index + 1}. ${step}`}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* FAQ */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '常見問題' : 'Frequently Asked Questions'}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {faqItems.map((item, index) => (
            <Accordion key={index} elevation={0}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`faq-${index}-content`}
                id={`faq-${index}-header`}
              >
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Common Features */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '常用功能' : 'Common Features'}
        </Typography>
        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={feature.title}
                secondary={feature.description}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Need More Help */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isZhTW ? '需要更多幫助？' : 'Need More Help?'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isZhTW
            ? '如果您還有其他問題或需要技術支援，歡迎聯絡我們：'
            : 'If you have any questions or need technical support, please contact us:'}
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2">
                  {isZhTW ? '電子郵件' : 'Email'}：
                  <Link
                    href="mailto:walker.chiu@icp-si.com"
                    sx={{ ml: 1 }}
                    underline="hover"
                  >
                    walker.chiu@icp-si.com
                  </Link>
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}

export default HelpContent;
