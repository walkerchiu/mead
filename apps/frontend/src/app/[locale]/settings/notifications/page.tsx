'use client';

import { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout';
import { PageHeader } from '@/components/molecules';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Button } from '@/components/atoms';
import { UpdateNotificationPreferencesInput } from '@/graphql/notification';

/**
 * Notification Settings Page - 通知設定頁面
 *
 * 功能：
 * - 通知類型開關
 * - 通知渠道設定
 * - 靜音時段設定
 */
function NotificationSettingsPageContent() {
  const { enqueueSnackbar } = useSnackbar();
  const authReady = useAuthReady();
  const t = useTranslations('pages.settings.notifications');
  const tCommon = useTranslations('common');

  // 使用通知偏好設定 hook
  const {
    preferences,
    loading: loadingPreferences,
    error: preferencesError,
    updatePreferences,
    updating: saving,
  } = useNotificationPreferences({ skip: !authReady });

  // 追蹤用戶的變更（只儲存變更的欄位）
  const [userChanges, setUserChanges] = useState<
    Partial<UpdateNotificationPreferencesInput>
  >({});

  // 合併後端資料和用戶變更，得到最終的設定值
  const settings = useMemo(() => {
    const defaultSettings = {
      enableInfo: true,
      enableSuccess: true,
      enableWarning: true,
      enableError: true,
      enableBrowser: true,
      enableEmail: true,
      enablePush: false,
      enableSound: true,
      enableDesktop: true,
      enableMobile: true,
    };

    return {
      ...defaultSettings,
      ...(preferences && {
        enableInfo: preferences.enableInfo,
        enableSuccess: preferences.enableSuccess,
        enableWarning: preferences.enableWarning,
        enableError: preferences.enableError,
        enableBrowser: preferences.enableBrowser,
        enableEmail: preferences.enableEmail,
        enablePush: preferences.enablePush,
        enableSound: preferences.enableSound,
        enableDesktop: preferences.enableDesktop,
        enableMobile: preferences.enableMobile,
      }),
      ...userChanges,
    };
  }, [preferences, userChanges]);

  // 處理取消（重置未儲存的更改）
  const handleCancel = () => {
    setUserChanges({});
    enqueueSnackbar(t('changesCancelled'), { variant: 'info' });
  };

  // 處理設定變更
  const handleChange = (field: keyof UpdateNotificationPreferencesInput) => {
    setUserChanges((prev) => ({
      ...prev,
      [field]: !settings[field],
    }));
  };

  // 處理儲存
  const handleSave = async () => {
    console.log('[NotificationSettings] handleSave called');
    console.log('[NotificationSettings] userChanges:', userChanges);

    if (Object.keys(userChanges).length === 0) {
      console.log('[NotificationSettings] No changes to save');
      enqueueSnackbar(t('noChanges'), { variant: 'info' });
      return;
    }

    try {
      await updatePreferences(userChanges);
      setUserChanges({});
    } catch (error) {
      console.error('[NotificationSettings] Failed to save:', error);
      // 錯誤已經在 hook 中處理並顯示
    }
  };

  return (
    <AppShell>
      {/* 主要內容 */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* 頁面標題 */}
        <PageHeader
          breadcrumbs={[
            { label: tCommon('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tCommon('breadcrumb.notificationSettings') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={
            <NotificationsIcon
              sx={{ fontSize: '2rem', color: 'primary.main' }}
            />
          }
        />

        {/* 載入錯誤提示（警告但不阻止使用）*/}
        {preferencesError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {t('loadError')}
          </Alert>
        )}

        {/* 載入中 */}
        {loadingPreferences && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 提示訊息 */}
        {!loadingPreferences && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('applyToAllDevices')}
          </Alert>
        )}

        {/* 設定卡片（即使有錯誤也顯示，使用預設值）*/}
        {!loadingPreferences && (
          <>
            {/* 通知類型設定 */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('types.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {t('types.description')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableInfo}
                        onChange={() => handleChange('enableInfo')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('types.info.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('types.info.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableSuccess}
                        onChange={() => handleChange('enableSuccess')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('types.success.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('types.success.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableWarning}
                        onChange={() => handleChange('enableWarning')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('types.warning.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('types.warning.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableError}
                        onChange={() => handleChange('enableError')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('types.error.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('types.error.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </CardContent>
            </Card>

            {/* 通知渠道設定 */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('channels.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {t('channels.description')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableBrowser}
                        onChange={() => handleChange('enableBrowser')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('channels.browser.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('channels.browser.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableEmail}
                        onChange={() => handleChange('enableEmail')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('channels.email.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('channels.email.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enablePush}
                        onChange={() => handleChange('enablePush')}
                        disabled
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('channels.push.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('channels.push.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </CardContent>
            </Card>

            {/* 進階設定 */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('advanced.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {t('advanced.description')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableSound}
                        onChange={() => handleChange('enableSound')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('advanced.sound.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('advanced.sound.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableDesktop}
                        onChange={() => handleChange('enableDesktop')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('advanced.desktop.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('advanced.desktop.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableMobile}
                        onChange={() => handleChange('enableMobile')}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t('advanced.mobile.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('advanced.mobile.helper')}
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </CardContent>
            </Card>

            {/* 儲存按鈕 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={Object.keys(userChanges).length === 0 || saving}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                loading={saving}
                disabled={saving}
              >
                {t('saveSettings')}
              </Button>
            </Box>
          </>
        )}

        {/* 說明文字 */}
        {!loadingPreferences && (
          <Paper
            elevation={2}
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('warning')}
            </Typography>
          </Paper>
        )}
      </Container>
    </AppShell>
  );
}

export default function NotificationSettingsPage() {
  return (
    <ProtectedRoute>
      <NotificationSettingsPageContent />
    </ProtectedRoute>
  );
}
