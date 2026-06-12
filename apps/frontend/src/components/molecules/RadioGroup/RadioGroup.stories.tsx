import type { Meta, StoryObj } from '@storybook/nextjs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RadioGroup } from './RadioGroup';
import { Button } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * RadioGroup 將單選按鈕與錯誤處理結合在一起。
 *
 * ## 功能特性
 * - 與 react-hook-form 完美整合
 * - 支援水平或垂直排列
 * - 自動顯示驗證錯誤
 * - 支援選項說明文字
 *
 * ## 使用情境
 * - 單選題
 * - 性別選擇
 * - 方案選擇
 */
const meta = {
  title: 'Shared/Molecules/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '單選按鈕群組元件，與 react-hook-form 完美整合。',
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
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// 常用選項資料
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const subscriptionOptions = [
  {
    value: 'free',
    label: 'Free Plan',
    description: '基本功能，適合個人使用',
  },
  {
    value: 'pro',
    label: 'Professional Plan',
    description: '每月 NT$ 299，完整功能',
  },
  {
    value: 'enterprise',
    label: 'Enterprise Plan',
    description: '客製化需求，請與我們聯絡',
  },
];

const paymentOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

/**
 * 基本用法
 * 垂直排列的單選按鈕
 */
export const Default: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    helperText: 'Please select your gender',
  },
};

/**
 * 含預設值
 * 顯示預先選取的選項
 */
export const WithDefaultValue: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    defaultValue: 'male',
    helperText: 'Default selection is male',
  },
};

/**
 * 含錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    error: 'This field is required',
  },
};

/**
 * 水平排列
 * 選項水平排列
 */
export const Row: Story = {
  args: {
    label: 'Payment Cycle',
    options: paymentOptions,
    row: true,
    helperText: 'Select your payment cycle',
  },
};

/**
 * 必填欄位
 * 顯示必填標示
 */
export const Required: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    required: true,
    helperText: 'This field is required',
  },
};

/**
 * 停用狀態
 * 無法選取
 */
export const Disabled: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    defaultValue: 'male',
    disabled: true,
    helperText: 'This field is disabled',
  },
};

/**
 * 部分選項停用
 * 部分選項無法選取
 */
export const WithDisabledOptions: Story = {
  args: {
    label: 'Subscription Plan',
    options: [
      { value: 'free', label: 'Free Plan' },
      { value: 'pro', label: 'Professional Plan' },
      {
        value: 'enterprise',
        label: 'Enterprise Plan (Coming Soon)',
        disabled: true,
      },
    ],
    helperText: 'Enterprise plan coming soon',
  },
};

/**
 * 含說明文字的選項
 * 每個選項都附帶說明文字
 */
export const WithDescription: Story = {
  args: {
    label: 'Choose Plan',
    options: subscriptionOptions,
    helperText: 'Please select a plan that suits you',
  },
};

/**
 * 完整表單範例
 * 使用 react-hook-form + Zod 驗證
 */
export const FormExample: Story = {
  render: function FormExampleComponent() {
    const schema = z.object({
      gender: z.string().min(1, 'Please select gender'),
      subscription: z.string().min(1, 'Please select subscription plan'),
      payment: z.string().min(1, 'Please select payment cycle'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        gender: '',
        subscription: '',
        payment: '',
      },
    });

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Member Registration</Typography>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Gender"
                options={genderOptions}
                {...field}
                error={errors.gender}
                helperText="Please select your gender"
              />
            )}
          />

          <Controller
            name="subscription"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Subscription Plan"
                options={subscriptionOptions}
                {...field}
                error={errors.subscription}
                helperText="Select a plan that suits you"
              />
            )}
          />

          <Controller
            name="payment"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Payment Cycle"
                options={paymentOptions}
                row
                {...field}
                error={errors.payment}
                helperText="Select payment cycle"
              />
            )}
          />

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
 * 多組單選題
 */
export const SurveyExample: Story = {
  render: function SurveyExampleComponent() {
    const schema = z.object({
      satisfaction: z.string().min(1, 'Please select satisfaction level'),
      recommend: z.string().min(1, 'Please select recommendation'),
      frequency: z.string().min(1, 'Please select usage frequency'),
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
        satisfaction: '',
        recommend: '',
        frequency: '',
      },
    });

    const allAnswered =
      watch('satisfaction') && watch('recommend') && watch('frequency');

    const onSubmit = (data: FormData) => {
      alert(
        'Thank you for completing the survey!\n\n' +
          JSON.stringify(data, null, 2),
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Product Satisfaction Survey</Typography>

          <Controller
            name="satisfaction"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="1. Are you satisfied with our product?"
                options={[
                  { value: 'very-satisfied', label: 'Very Satisfied' },
                  { value: 'satisfied', label: 'Satisfied' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'dissatisfied', label: 'Dissatisfied' },
                  { value: 'very-dissatisfied', label: 'Very Dissatisfied' },
                ]}
                {...field}
                error={errors.satisfaction}
              />
            )}
          />

          <Controller
            name="recommend"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="2. Would you recommend to friends?"
                options={[
                  { value: 'definitely', label: 'Definitely' },
                  { value: 'probably', label: 'Probably' },
                  { value: 'not-sure', label: 'Not Sure' },
                  { value: 'probably-not', label: 'Probably Not' },
                  { value: 'definitely-not', label: 'Definitely Not' },
                ]}
                {...field}
                error={errors.recommend}
              />
            )}
          />

          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="3. Your usage frequency?"
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'rarely', label: 'Rarely' },
                ]}
                row
                {...field}
                error={errors.frequency}
              />
            )}
          />

          {allAnswered && (
            <Alert severity="success">
              All questions completed, please click submit
            </Alert>
          )}

          <Button type="submit" variant="contained" fullWidth>
            Submit Survey
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 尺寸比較
 * 不同尺寸的單選按鈕
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Radio Button Sizes</Typography>

      <RadioGroup
        label="Small Size"
        options={genderOptions}
        row
        helperText="Using default small size"
      />

      <RadioGroup
        label="Medium Size (Default)"
        options={genderOptions}
        row
        helperText="Using default medium size"
      />
    </Stack>
  ),
};
