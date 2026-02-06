import type { Meta, StoryObj } from '@storybook/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RadioGroup } from './RadioGroup';
import { Button } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * RadioGroup 結合了單選按鈕和錯誤處理。
 *
 * ## 特色
 * - 與 react-hook-form 完美整合
 * - 支援橫向或縱向排列
 * - 自動顯示驗證錯誤
 * - 支援選項描述
 *
 * ## 使用場景
 * - 單選題
 * - 性別選擇
 * - 方案選擇
 */
const meta = {
  title: 'Molecules/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '單選按鈕組組件，與 react-hook-form 完美整合。',
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
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '其他' },
];

const subscriptionOptions = [
  { value: 'free', label: '免費方案', description: '基本功能，適合個人使用' },
  { value: 'pro', label: '專業方案', description: 'NT$ 299/月，完整功能' },
  {
    value: 'enterprise',
    label: '企業方案',
    description: '客製化需求，請聯繫我們',
  },
];

const paymentOptions = [
  { value: 'monthly', label: '月付' },
  { value: 'quarterly', label: '季付' },
  { value: 'yearly', label: '年付' },
];

/**
 * 基本用法
 * 縱向排列的單選按鈕
 */
export const Default: Story = {
  args: {
    label: '性別',
    options: genderOptions,
    helperText: '請選擇您的性別',
  },
};

/**
 * 帶預設值
 * 顯示已選取的選項
 */
export const WithDefaultValue: Story = {
  args: {
    label: '性別',
    options: genderOptions,
    defaultValue: 'male',
    helperText: '預設選擇男性',
  },
};

/**
 * 帶錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: '性別',
    options: genderOptions,
    error: '此欄位為必填',
  },
};

/**
 * 橫向排列
 * 選項水平排列
 */
export const Row: Story = {
  args: {
    label: '付款週期',
    options: paymentOptions,
    row: true,
    helperText: '選擇您的付款週期',
  },
};

/**
 * 必填欄位
 * 顯示必填標記
 */
export const Required: Story = {
  args: {
    label: '性別',
    options: genderOptions,
    required: true,
    helperText: '此欄位為必填',
  },
};

/**
 * 禁用狀態
 * 不可選擇
 */
export const Disabled: Story = {
  args: {
    label: '性別',
    options: genderOptions,
    defaultValue: 'male',
    disabled: true,
    helperText: '此欄位已被禁用',
  },
};

/**
 * 部分選項禁用
 * 某些選項不可選擇
 */
export const WithDisabledOptions: Story = {
  args: {
    label: '訂閱方案',
    options: [
      { value: 'free', label: '免費方案' },
      { value: 'pro', label: '專業方案' },
      { value: 'enterprise', label: '企業方案（即將推出）', disabled: true },
    ],
    helperText: '企業方案即將推出',
  },
};

/**
 * 帶描述的選項
 * 每個選項都有說明文字
 */
export const WithDescription: Story = {
  args: {
    label: '選擇方案',
    options: subscriptionOptions,
    helperText: '請選擇適合您的方案',
  },
};

/**
 * 完整表單範例
 * 使用 react-hook-form + Zod 驗證
 */
export const FormExample: Story = {
  render: function FormExampleComponent() {
    const schema = z.object({
      gender: z.string().min(1, '請選擇性別'),
      subscription: z.string().min(1, '請選擇訂閱方案'),
      payment: z.string().min(1, '請選擇付款週期'),
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
      console.log('表單資料:', data);
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">會員註冊</Typography>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="性別"
                options={genderOptions}
                {...field}
                error={errors.gender}
                helperText="請選擇您的性別"
              />
            )}
          />

          <Controller
            name="subscription"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="訂閱方案"
                options={subscriptionOptions}
                {...field}
                error={errors.subscription}
                helperText="選擇適合您的方案"
              />
            )}
          />

          <Controller
            name="payment"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="付款週期"
                options={paymentOptions}
                row
                {...field}
                error={errors.payment}
                helperText="選擇付款週期"
              />
            )}
          />

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
 * 問卷調查範例
 * 多個單選題組
 */
export const SurveyExample: Story = {
  render: function SurveyExampleComponent() {
    const schema = z.object({
      satisfaction: z.string().min(1, '請選擇滿意度'),
      recommend: z.string().min(1, '請選擇是否推薦'),
      frequency: z.string().min(1, '請選擇使用頻率'),
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
      alert('感謝您完成問卷！\n\n' + JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">產品滿意度調查</Typography>

          <Controller
            name="satisfaction"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="1. 您對我們的產品滿意嗎？"
                options={[
                  { value: 'very-satisfied', label: '非常滿意' },
                  { value: 'satisfied', label: '滿意' },
                  { value: 'neutral', label: '普通' },
                  { value: 'dissatisfied', label: '不滿意' },
                  { value: 'very-dissatisfied', label: '非常不滿意' },
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
                label="2. 您會推薦給朋友嗎？"
                options={[
                  { value: 'definitely', label: '一定會' },
                  { value: 'probably', label: '可能會' },
                  { value: 'not-sure', label: '不確定' },
                  { value: 'probably-not', label: '可能不會' },
                  { value: 'definitely-not', label: '一定不會' },
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
                label="3. 您的使用頻率？"
                options={[
                  { value: 'daily', label: '每天' },
                  { value: 'weekly', label: '每週' },
                  { value: 'monthly', label: '每月' },
                  { value: 'rarely', label: '很少' },
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
 * 尺寸對比
 * 不同大小的單選按鈕
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">單選按鈕尺寸</Typography>

      <RadioGroup
        label="小尺寸"
        options={genderOptions}
        row
        helperText="使用預設 small size"
      />

      <RadioGroup
        label="中尺寸（預設）"
        options={genderOptions}
        row
        helperText="使用預設 medium size"
      />
    </Stack>
  ),
};
