import type { Meta, StoryObj } from '@storybook/nextjs';
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
 * CheckboxGroup 將核取方塊與錯誤處理結合在一起。
 *
 * ## 功能特性
 * - 與 react-hook-form 完美整合
 * - 支援水平或垂直版面
 * - 自動顯示驗證錯誤
 * - 支援選項說明文字
 * - 支援多選
 *
 * ## 使用情境
 * - 複選題
 * - 功能偏好
 * - 興趣選擇
 * - 權限管理
 */
const meta = {
  title: 'Shared/Molecules/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '核取方塊群組元件，與 react-hook-form 完美整合。',
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

// Common option data
const interestOptions = [
  { value: 'reading', label: 'Reading' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'travel', label: 'Travel' },
];

const featureOptions = [
  {
    value: 'notifications',
    label: 'Receive Notifications',
    description: '透過 email 接收重要通知',
  },
  {
    value: 'newsletter',
    label: 'Subscribe to Newsletter',
    description: '接收每週更新',
  },
  {
    value: 'marketing',
    label: 'Marketing Info',
    description: '接收優惠活動與活動更新',
  },
];

const permissionOptions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'delete', label: 'Delete' },
  { value: 'hq', label: 'HQ Access' },
];

/**
 * 基本用法
 * 垂直排列的核取方塊
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>([]);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="Interests"
          options={interestOptions}
          value={value}
          onChange={setValue}
          helperText="Select your interests (multiple selection allowed)"
        />
        <Alert severity="info">
          Selected: {value.length > 0 ? value.join(', ') : '(none selected)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 含預設值
 * 顯示預先選取的選項
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
          label="Interests"
          options={interestOptions}
          value={value}
          onChange={setValue}
          helperText="Default selected: Reading and Music"
        />
        <Alert severity="info">
          Selected: {value.length > 0 ? value.join(', ') : '(none selected)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 含錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: 'Interests',
    options: interestOptions,
    error: 'Select at least one interest',
  },
};

/**
 * 水平版面
 * 選項水平排列
 */
export const Row: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>([]);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="Permissions"
          options={permissionOptions}
          value={value}
          onChange={setValue}
          row
          helperText="Select user permissions"
        />
        <Alert severity="info">
          Selected: {value.length > 0 ? value.join(', ') : '(none selected)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 必填欄位
 * 顯示必填標示
 */
export const Required: Story = {
  args: {
    label: 'Interests',
    options: interestOptions,
    required: true,
    helperText: 'This field is required',
  },
};

/**
 * 停用狀態
 * 無法選取
 */
export const Disabled: Story = {
  render: () => {
    const [value] = useState<(string | number)[]>(['reading', 'music']);
    return (
      <CheckboxGroup
        label="Interests"
        options={interestOptions}
        value={value}
        disabled
        helperText="This field is disabled"
      />
    );
  },
};

/**
 * 部分選項已停用
 * 部分選項無法選取
 */
export const WithDisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>(['read']);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="Permissions"
          options={[
            { value: 'read', label: 'Read' },
            { value: 'write', label: 'Write' },
            {
              value: 'delete',
              label: 'Delete (requires higher permissions)',
              disabled: true,
            },
            {
              value: 'hq',
              label: 'HQ Access (requires higher permissions)',
              disabled: true,
            },
          ]}
          value={value}
          onChange={setValue}
          helperText="Some permissions require higher level"
        />
        <Alert severity="info">
          Selected: {value.length > 0 ? value.join(', ') : '(none selected)'}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 含說明文字
 * 每個選項都附帶說明文字
 */
export const WithDescription: Story = {
  render: () => {
    const [value, setValue] = useState<(string | number)[]>([]);
    return (
      <Stack spacing={2}>
        <CheckboxGroup
          label="Notification Preferences"
          options={featureOptions}
          value={value}
          onChange={setValue}
          helperText="Select the notification types you want to receive"
        />
        <Alert severity="info">Selected {value.length} notifications</Alert>
      </Stack>
    );
  },
};

/**
 * 全選／取消全選功能
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
          label="Interests"
          options={interestOptions}
          value={value}
          onChange={setValue}
          helperText="Select your interests"
        />
        <Button variant="outlined" onClick={handleSelectAll} fullWidth>
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </Button>
        <Alert severity="info">
          Selected: {value.length} / {allValues.length}
        </Alert>
      </Stack>
    );
  },
};

/**
 * 條件式顯示範例
 * 依選取內容動態顯示
 */
export const ConditionalDisplay: Story = {
  render: function ConditionalDisplayComponent() {
    const [features, setFeatures] = useState<(string | number)[]>([]);

    return (
      <Stack spacing={3}>
        <CheckboxGroup
          label="Enable Features"
          options={[
            { value: 'email', label: 'Email Notifications' },
            { value: 'sms', label: 'SMS Notifications' },
            { value: 'push', label: 'Push Notifications' },
          ]}
          value={features}
          onChange={setFeatures}
          helperText="Select notification features to enable"
        />

        {features.includes('email') && (
          <Alert severity="info">
            ✉️ Email notifications enabled, will be sent to your registered
            email
          </Alert>
        )}

        {features.includes('sms') && (
          <Alert severity="warning">
            📱 SMS notifications may incur additional charges
          </Alert>
        )}

        {features.includes('push') && (
          <Alert severity="success">
            🔔 Push notifications enabled, please ensure browser allows
            notifications
          </Alert>
        )}

        {features.length === 0 && (
          <Alert severity="error">
            ⚠️ Please select at least one notification method
          </Alert>
        )}
      </Stack>
    );
  },
};

/**
 * 最少／最多選取限制
 * 限制選取數量
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
          label="Select your top three interests"
          options={[
            { value: 'reading', label: 'Reading' },
            { value: 'music', label: 'Music' },
            { value: 'sports', label: 'Sports' },
            { value: 'travel', label: 'Travel' },
            { value: 'cooking', label: 'Cooking' },
            { value: 'gaming', label: 'Gaming' },
          ]}
          value={value}
          onChange={handleChange}
          helperText={`Please select ${MIN}-${MAX} items`}
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
          Selected {value.length} / {MAX} items
          {value.length < MIN && ` (at least ${MIN} items needed)`}
          {value.length === MAX && ' (limit reached)'}
        </Alert>

        <Button variant="contained" fullWidth disabled={!isValid}>
          Continue
        </Button>
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
        .min(1, 'Select at least one interest')
        .max(3, 'Maximum 3 selections allowed'),
      notifications: z.array(z.string()),
      permissions: z.array(z.string()).min(1, 'Select at least one permission'),
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
      console.log('Form data:', data);
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Preference Settings</Typography>

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="Interests"
                options={interestOptions}
                {...field}
                error={errors.interests}
                helperText="Select 1-3 interests"
              />
            )}
          />

          <Alert severity={watchInterests.length > 3 ? 'error' : 'info'}>
            Selected {watchInterests.length} items (limit 3 items)
          </Alert>

          <Controller
            name="notifications"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="Notification Preferences"
                options={featureOptions}
                {...field}
                error={errors.notifications}
                helperText="Select the notifications you want to receive"
              />
            )}
          />

          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="Permissions"
                options={permissionOptions}
                row
                {...field}
                error={errors.permissions}
                helperText="Select at least one permission"
              />
            )}
          />

          {(watchInterests.length > 0 ||
            watchNotifications.length > 0 ||
            watchPermissions.length > 0) && (
            <Alert severity="success">
              <Typography variant="subtitle2" gutterBottom>
                Current Selection：
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>
                  Interests: {watchInterests.join(', ') || 'not selected'}
                </li>
                <li>
                  Notifications:{' '}
                  {watchNotifications.join(', ') || 'not selected'}
                </li>
                <li>
                  Permissions: {watchPermissions.join(', ') || 'not selected'}
                </li>
              </ul>
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            Submit
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 問卷範例
 * 多組核取方塊題目
 */
export const SurveyExample: Story = {
  render: function SurveyExampleComponent() {
    const schema = z.object({
      features: z.array(z.string()).min(1, 'Select at least one feature'),
      devices: z.array(z.string()).min(1, 'Select at least one device'),
      frequency: z.array(z.string()).min(1, 'Select at least one frequency'),
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
      alert(
        'Thank you for completing the survey!\n\n' +
          JSON.stringify(data, null, 2),
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Product Usage Survey</Typography>

          <Controller
            name="features"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="1. Which features do you use most often？"
                options={[
                  { value: 'dashboard', label: 'Dashboard' },
                  { value: 'reports', label: 'Report Analysis' },
                  { value: 'export', label: 'Data Export' },
                  { value: 'collaboration', label: 'Collaboration' },
                  { value: 'api', label: 'API Integration' },
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
                label="2. Which devices do you use？"
                options={[
                  { value: 'desktop', label: 'Desktop Computer' },
                  { value: 'laptop', label: 'Laptop' },
                  { value: 'tablet', label: 'Tablet' },
                  { value: 'mobile', label: 'Mobile Phone' },
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
                label="3. When do you use it？"
                options={[
                  { value: 'morning', label: 'Morning (6-12)' },
                  { value: 'afternoon', label: 'Afternoon (12-18)' },
                  { value: 'evening', label: 'Evening (18-24)' },
                  { value: 'night', label: 'Night (0-6)' },
                ]}
                row
                {...field}
                error={errors.frequency}
              />
            )}
          />

          {allAnswered && (
            <Alert severity="success">
              completed all questions，please clickSubmit
            </Alert>
          )}

          <Button type="submit" variant="contained" fullWidth>
            Submitquestionnaire
          </Button>
        </Stack>
      </form>
    );
  },
};
