import type { Meta, StoryObj } from '@storybook/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckboxGroup } from './CheckboxGroup';
import { Button } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useState } from 'react';

/**
 * CheckboxGroup 結合了複選框和錯誤處理。
 *
 * ## 特色
 * - 與 react-hook-form 完美整合
 * - 支援橫向或縱向排列
 * - 自動顯示驗證錯誤
 * - 支援選項描述
 * - 支援多選
 *
 * ## 使用場景
 * - 多選題
 * - 功能偏好設定
 * - 興趣選擇
 * - 權限管理
 */
const meta = {
  title: 'Molecules/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '複選框組組件,與 react-hook-form 完美整合。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// 常用選項資料
const interestOptions = [
  { value: 'reading', label: '閱讀' },
  { value: 'music', label: '音樂' },
  { value: 'sports', label: '運動' },
  { value: 'travel', label: '旅遊' },
];

const featureOptions = [
  {
    value: 'notifications',
    label: '接收通知',
    description: '透過 Email 接收重要通知',
  },
  { value: 'newsletter', label: '訂閱電子報', description: '每週接收最新消息' },
  { value: 'marketing', label: '行銷資訊', description: '接收優惠和活動訊息' },
];

const permissionOptions = [
  { value: 'read', label: '讀取' },
  { value: 'write', label: '寫入' },
  { value: 'delete', label: '刪除' },
  { value: 'admin', label: '管理員權限' },
];

/**
 * 基本用法
 * 縱向排列的複選框
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>([]);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="興趣"
          options={interestOptions}
          value={value}
          onChange={setValue}
          helperText="請選擇您的興趣（可複選）"
        />
        <Alert severity="info">
          已選擇: {value.length > 0 ? value.join(', ') : '(尚未選擇)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 帶預設值
 * 顯示已選取的選項
 */
export const WithDefaultValue: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>([
      'reading',
      'music',
    ]);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="興趣"
          options={interestOptions}
          value={value}
          onChange={setValue}
          helperText="預設已選擇閱讀和音樂"
        />
        <Alert severity="info">
          已選擇: {value.length > 0 ? value.join(', ') : '(尚未選擇)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 帶錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: '興趣',
    options: interestOptions,
    error: '至少選擇一項興趣',
  },
};

/**
 * 橫向排列
 * 選項水平排列
 */
export const Row: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>([]);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="權限"
          options={permissionOptions}
          value={value}
          onChange={setValue}
          row
          helperText="選擇使用者權限"
        />
        <Alert severity="info">
          已選擇: {value.length > 0 ? value.join(', ') : '(尚未選擇)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 必填欄位
 * 顯示必填標記
 */
export const Required: Story = {
  args: {
    label: '興趣',
    options: interestOptions,
    required: true,
    helperText: '此欄位為必填',
  },
};

/**
 * 禁用狀態
 * 不可選擇
 */
export const Disabled: Story = {
  render: () => {
    const [value] = useState<(string | number)[]>(['reading', 'music']);
    return (
      <CheckboxGroup
        label="興趣"
        options={interestOptions}
        value={value}
        disabled
        helperText="此欄位已被禁用"
      />
    );
  },
};

/**
 * 部分選項禁用
 * 某些選項不可選擇
 */
export const WithDisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>(['read']);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="權限"
          options={[
            { value: 'read', label: '讀取' },
            { value: 'write', label: '寫入' },
            { value: 'delete', label: '刪除（需要更高權限）', disabled: true },
            {
              value: 'admin',
              label: '管理員權限（需要更高權限）',
              disabled: true,
            },
          ]}
          value={value}
          onChange={setValue}
          helperText="某些權限需要更高級別"
        />
        <Alert severity="info">
          已選擇: {value.length > 0 ? value.join(', ') : '(尚未選擇)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 帶描述的選項
 * 每個選項都有說明文字
 */
export const WithDescription: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>([]);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="通知偏好"
          options={featureOptions}
          value={value}
          onChange={setValue}
          helperText="選擇您想要接收的通知類型"
        />
        <Alert severity="info">已選擇 {value.length} 項通知</Alert>
      </Stack>
    );
  },
};

/**
 * 全選/全不選功能
 * 提供一鍵全選
 */
export const WithSelectAll: Story = {
  render: function WithSelectAllComponent() {
    const [value, setValue] = useState<(string | number)[]>([]);

    const allValues = interestOptions.map((opt) => opt.value);
    const isAllSelected = value.length === allValues.length;

    const handleSelectAll = () => {
      setValue(isAllSelected ? [] : allValues);
    };

    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="興趣"
          options={interestOptions}
          value={value}
          onChange={setValue}
          helperText="請選擇您的興趣"
        />
        <Button variant="outlined" onClick={handleSelectAll} fullWidth>
          {isAllSelected ? '全不選' : '全選'}
        </Button>
        <Alert severity="info">
          已選擇: {value.length} / {allValues.length}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 完整表單範例
 * 使用 react-hook-form + Zod 驗證
 */
export const FormExample: Story = {
  render: function FormExampleComponent() {
    const schema = z.object({
      interests: z
        .array(z.string())
        .min(1, '至少選擇一項興趣')
        .max(3, '最多只能選擇三項'),
      notifications: z.array(z.string()),
      permissions: z.array(z.string()).min(1, '至少選擇一項權限'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
      watch,
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        interests: [],
        notifications: [],
        permissions: ['read'],
      },
    });

    const watchInterests = watch('interests');
    const watchNotifications = watch('notifications');
    const watchPermissions = watch('permissions');

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('表單資料:', data);
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">偏好設定</Typography>

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="興趣"
                options={interestOptions}
                {...field}
                error={errors.interests}
                helperText="選擇 1-3 項興趣"
              />
            )}
          />

          <Alert severity={watchInterests.length > 3 ? 'error' : 'info'}>
            已選擇 {watchInterests.length} 項 (上限 3 項)
          </Alert>

          <Controller
            name="notifications"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="通知偏好"
                options={featureOptions}
                {...field}
                error={errors.notifications}
                helperText="選擇您想要接收的通知"
              />
            )}
          />

          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="權限"
                options={permissionOptions}
                row
                {...field}
                error={errors.permissions}
                helperText="至少選擇一項權限"
              />
            )}
          />

          {(watchInterests.length > 0 ||
            watchNotifications.length > 0 ||
            watchPermissions.length > 0) && (
            <Alert severity="success">
              <Typography variant="subtitle2" gutterBottom>
                目前選擇：
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>興趣: {watchInterests.join(', ') || '未選擇'}</li>
                <li>通知: {watchNotifications.join(', ') || '未選擇'}</li>
                <li>權限: {watchPermissions.join(', ') || '未選擇'}</li>
              </ul>
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            提交
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 條件顯示範例
 * 根據選擇動態顯示內容
 */
export const ConditionalDisplay: Story = {
  render: function ConditionalDisplayComponent() {
    const [features, setFeatures] = useState<(string | number)[]>([]);

    return (
      <Stack spacing={3}>
        <CheckboxGroup
          label="啟用功能"
          options={[
            { value: 'email', label: '電子郵件通知' },
            { value: 'sms', label: '簡訊通知' },
            { value: 'push', label: '推播通知' },
          ]}
          value={features}
          onChange={setFeatures}
          helperText="選擇要啟用的通知功能"
        />

        {features.includes('email') && (
          <Alert severity="info">
            ✉️ 電子郵件通知已啟用，將發送到您註冊的 Email
          </Alert>
        )}

        {features.includes('sms') && (
          <Alert severity="warning">📱 簡訊通知可能產生額外費用</Alert>
        )}

        {features.includes('push') && (
          <Alert severity="success">
            🔔 推播通知已啟用，請確保瀏覽器允許通知
          </Alert>
        )}

        {features.length === 0 && (
          <Alert severity="error">⚠️ 請至少選擇一種通知方式</Alert>
        )}
      </Stack>
    );
  },
};

/**
 * 問卷調查範例
 * 多個複選題組
 */
export const SurveyExample: Story = {
  render: function SurveyExampleComponent() {
    const schema = z.object({
      features: z.array(z.string()).min(1, '至少選擇一項功能'),
      devices: z.array(z.string()).min(1, '至少選擇一項裝置'),
      frequency: z.array(z.string()).min(1, '至少選擇一項頻率'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        features: [],
        devices: [],
        frequency: [],
      },
    });

    const allAnswered =
      watch('features').length > 0 &&
      watch('devices').length > 0 &&
      watch('frequency').length > 0;

    const onSubmit = (data: FormData) => {
      alert('感謝您完成問卷！\n\n' + JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">產品使用調查</Typography>

          <Controller
            name="features"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="1. 您最常使用哪些功能？"
                options={[
                  { value: 'dashboard', label: '儀表板' },
                  { value: 'reports', label: '報表分析' },
                  { value: 'export', label: '資料匯出' },
                  { value: 'collaboration', label: '協作功能' },
                  { value: 'api', label: 'API 整合' },
                ]}
                {...field}
                error={errors.features}
              />
            )}
          />

          <Controller
            name="devices"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="2. 您使用哪些裝置？"
                options={[
                  { value: 'desktop', label: '桌上型電腦' },
                  { value: 'laptop', label: '筆記型電腦' },
                  { value: 'tablet', label: '平板' },
                  { value: 'mobile', label: '手機' },
                ]}
                row
                {...field}
                error={errors.devices}
              />
            )}
          />

          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="3. 您在哪些時段使用？"
                options={[
                  { value: 'morning', label: '早上 (6-12)' },
                  { value: 'afternoon', label: '下午 (12-18)' },
                  { value: 'evening', label: '晚上 (18-24)' },
                  { value: 'night', label: '深夜 (0-6)' },
                ]}
                row
                {...field}
                error={errors.frequency}
              />
            )}
          />

          {allAnswered && (
            <Alert severity="success">已完成所有問題，請點擊提交</Alert>
          )}

          <Button type="submit" variant="contained" fullWidth>
            提交問卷
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 最小/最大選擇限制
 * 限制選擇數量
 */
export const WithLimits: Story = {
  render: function WithLimitsComponent() {
    const MIN = 2;
    const MAX = 3;
    const [value, setValue] = useState<(string | number)[]>([]);

    const handleChange = (newValues: (string | number)[]) => {
      if (newValues.length <= MAX) {
        setValue(newValues);
      }
    };

    const isValid = value.length >= MIN && value.length <= MAX;

    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="選擇您的前三名興趣"
          options={[
            { value: 'reading', label: '閱讀' },
            { value: 'music', label: '音樂' },
            { value: 'sports', label: '運動' },
            { value: 'travel', label: '旅遊' },
            { value: 'cooking', label: '烹飪' },
            { value: 'gaming', label: '遊戲' },
          ]}
          value={value}
          onChange={handleChange}
          helperText={`請選擇 ${MIN}-${MAX} 項`}
        />

        <Alert
          severity={
            value.length < MIN
              ? 'error'
              : value.length > MAX
                ? 'warning'
                : 'success'
          }
        >
          已選擇 {value.length} / {MAX} 項
          {value.length < MIN && ` (至少需要 ${MIN} 項)`}
          {value.length === MAX && ' (已達上限)'}
        </Alert>

        <Button variant="contained" fullWidth disabled={!isValid}>
          繼續
        </Button>
      </Stack>
    );
  },
};
