import type { Meta, StoryObj } from '@storybook/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from './FormField';
import { Button } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

/**
 * FormField 結合了 TextField 和錯誤處理。
 *
 * ## 特色
 * - 與 react-hook-form 完美整合
 * - 自動顯示驗證錯誤
 * - 支援 Zod schema 驗證
 * - 保留 TextField 的所有功能
 *
 * ## 使用場景
 * - 任何需要驗證的表單欄位
 * - 與 react-hook-form 一起使用
 */
const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '結合 TextField 和錯誤處理的表單欄位，與 react-hook-form 完美整合。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本用法
 * 沒有錯誤的正常狀態
 */
export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'user@example.com',
    helperText: '請輸入您的電子郵件地址',
  },
};

/**
 * 帶錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: '使用者名稱',
    defaultValue: 'ab',
    error: '使用者名稱必須至少 3 個字元',
  },
};

/**
 * react-hook-form 錯誤物件
 * 接受 FieldError 物件
 */
export const WithFieldError: Story = {
  args: {
    label: '密碼',
    type: 'password',
    defaultValue: '123',
    error: {
      type: 'minLength',
      message: '密碼長度必須至少 8 個字元',
    },
  },
};

/**
 * 必填欄位
 */
export const Required: Story = {
  args: {
    label: 'Email',
    required: true,
    helperText: '此欄位為必填',
  },
};

/**
 * 完整的表單範例
 * 使用 react-hook-form + Zod 驗證
 */
export const FormExample: Story = {
  render: function FormExampleComponent() {
    // 定義 Zod schema
    const schema = z.object({
      email: z.string().email('請輸入有效的電子郵件地址'),
      username: z.string().min(3, '使用者名稱至少需要 3 個字元'),
      age: z.number().min(18, '您必須年滿 18 歲').max(120, '請輸入有效的年齡'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
      // 模擬 API 請求
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('表單資料:', data);
      alert('提交成功！查看 Console');
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">註冊表單</Typography>

          <FormField
            label="Email"
            type="email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email}
            helperText="我們不會分享您的 Email"
          />

          <FormField
            label="使用者名稱"
            placeholder="輸入使用者名稱"
            {...register('username')}
            error={errors.username}
            helperText="至少 3 個字元"
          />

          <FormField
            label="年齡"
            type="number"
            {...register('age', { valueAsNumber: true })}
            error={errors.age}
            helperText="必須年滿 18 歲"
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
 * 登入表單範例
 * 簡單的 Email + 密碼表單
 */
export const LoginForm: Story = {
  render: function LoginFormComponent() {
    const schema = z.object({
      email: z.string().email('請輸入有效的 Email'),
      password: z.string().min(8, '密碼至少需要 8 個字元'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('登入資料:', data);
      alert('登入成功！');
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">登入</Typography>

          <FormField
            label="Email"
            type="email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email}
          />

          <FormField
            label="密碼"
            type="password"
            placeholder="輸入密碼"
            {...register('password')}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            登入
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 即時驗證
 * 使用 mode: 'onChange' 進行即時驗證
 */
export const RealtimeValidation: Story = {
  render: function RealtimeValidationComponent() {
    const schema = z.object({
      email: z.string().email('請輸入有效的 Email'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange', // 即時驗證
    });

    const onSubmit = (data: FormData) => {
      console.log(data);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            開始輸入即可看到即時驗證
          </Typography>

          <FormField
            label="Email"
            type="email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email}
          />

          {!errors.email && <Alert severity="success">Email 格式正確！</Alert>}
        </Stack>
      </form>
    );
  },
};

/**
 * 帶前綴文字
 * 顯示單位或標籤在欄位前面（數值自動靠右）
 */
export const WithStartAdornment: Story = {
  args: {
    label: '價格',
    type: 'number',
    startAdornment: '$',
    placeholder: '0.00',
    helperText: '請輸入產品價格（數值自動靠右對齊）',
  },
};

/**
 * 帶後綴文字
 * 顯示單位在欄位後面
 */
export const WithEndAdornment: Story = {
  args: {
    label: '重量',
    type: 'number',
    endAdornment: 'kg',
    placeholder: '0',
    helperText: '請輸入商品重量',
  },
};

/**
 * 前綴和後綴同時使用
 * 顯示貨幣符號和單位
 */
export const WithBothAdornments: Story = {
  args: {
    label: '金額',
    type: 'number',
    startAdornment: '$',
    endAdornment: 'USD',
    placeholder: '0.00',
    helperText: '請輸入金額（美元）',
  },
};

/**
 * 帶圖示前綴
 * 使用 MUI 圖示作為前綴
 */
export const WithIconStart: Story = {
  args: {
    label: '搜尋',
    startAdornment: <SearchIcon />,
    placeholder: '輸入關鍵字搜尋...',
  },
};

/**
 * 帶圖示後綴
 * 使用 MUI 圖示作為後綴
 */
export const WithIconEnd: Story = {
  args: {
    label: '使用者名稱',
    endAdornment: <PersonIcon />,
    placeholder: '請輸入使用者名稱',
  },
};

/**
 * 各種單位範例
 * 展示不同的單位標籤
 */
export const UnitsExamples: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">各種單位範例</Typography>

      <FormField
        label="價格"
        type="number"
        startAdornment="$"
        placeholder="0.00"
      />

      <FormField label="折扣" type="number" endAdornment="%" placeholder="0" />

      <FormField label="重量" type="number" endAdornment="kg" placeholder="0" />

      <FormField label="距離" type="number" endAdornment="km" placeholder="0" />

      <FormField label="溫度" type="number" endAdornment="°C" placeholder="0" />

      <FormField label="容量" type="number" endAdornment="L" placeholder="0" />
    </Stack>
  ),
};

/**
 * 各種圖示範例
 * 展示不同的圖示裝飾
 */
export const IconExamples: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">各種圖示範例</Typography>

      <FormField
        label="搜尋"
        startAdornment={<SearchIcon />}
        placeholder="輸入關鍵字..."
      />

      <FormField
        label="Email"
        startAdornment={<EmailIcon />}
        placeholder="your@email.com"
      />

      <FormField
        label="電話"
        startAdornment={<PhoneIcon />}
        placeholder="+886 912 345 678"
      />

      <FormField
        label="使用者名稱"
        startAdornment={<PersonIcon />}
        placeholder="username"
      />

      <FormField
        label="密碼"
        type="password"
        startAdornment={<LockIcon />}
        placeholder="輸入密碼"
      />
    </Stack>
  ),
};

/**
 * 貨幣輸入範例
 * 實際的金額輸入應用
 */
export const CurrencyInput: Story = {
  render: function CurrencyInputComponent() {
    const schema = z.object({
      amount: z.string().refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0 && num <= 1000000;
        },
        { message: '金額必須在 0 到 1,000,000 之間' },
      ),
      discount: z.string().refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: '折扣必須在 0% 到 100% 之間' },
      ),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange',
      defaultValues: {
        amount: '10000',
        discount: '0',
      },
    });

    // 解析格式化的數字字串
    const parseNumber = (str: string | undefined) => {
      if (!str || str === '') return 0;
      const cleaned = str.replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const amountValue = watch('amount');
    const discountValue = watch('discount');

    const amount = parseNumber(amountValue);
    const discount = parseNumber(discountValue);
    const finalAmount = amount * (1 - discount / 100);

    const onSubmit = (data: FormData) => {
      const finalAmt = parseNumber(data.amount);
      const finalDisc = parseNumber(data.discount);
      const final = finalAmt * (1 - finalDisc / 100);
      alert(
        `原價: $${finalAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
          `折扣: ${finalDisc}%\n` +
          `實付: $${final.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">商品價格計算</Typography>

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <FormField
                label="商品原價"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="USD"
                {...field}
                error={errors.amount}
                helperText="請輸入商品原價"
              />
            )}
          />

          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <FormField
                label="折扣"
                formatNumber
                decimalPlaces={0}
                endAdornment="%"
                {...field}
                error={errors.discount}
                helperText="請輸入折扣百分比"
              />
            )}
          />

          <Alert severity="info">
            <Typography variant="body2">
              <strong>原價：</strong>$
              {amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <br />
              <strong>折扣：</strong>
              {discount}%<br />
              <strong>實付金額：</strong>$
              {finalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Alert>

          <Button type="submit" variant="contained" fullWidth>
            確認價格
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 產品規格表單
 * 實際的產品資訊輸入應用
 */
export const ProductSpecForm: Story = {
  render: function ProductSpecFormComponent() {
    const schema = z.object({
      name: z.string().min(1, '請輸入產品名稱'),
      price: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: '價格不能為負數' },
      ),
      weight: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: '重量不能為負數' },
      ),
      length: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: '長度不能為負數' },
      ),
      width: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: '寬度不能為負數' },
      ),
      height: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: '高度不能為負數' },
      ),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange',
      defaultValues: {
        name: '',
        price: '',
        weight: '',
        length: '',
        width: '',
        height: '',
      },
    });

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 將格式化的字串轉換回數字顯示
      const parseNumber = (str: string) =>
        parseFloat(str.replace(/,/g, '')) || 0;

      console.log('產品資料（原始值）:', data);
      alert(
        `產品名稱: ${data.name}\n` +
          `售價: $${parseNumber(data.price).toLocaleString()} TWD\n` +
          `重量: ${parseNumber(data.weight).toLocaleString()} kg\n` +
          `長度: ${parseNumber(data.length).toLocaleString()} cm\n` +
          `寬度: ${parseNumber(data.width).toLocaleString()} cm\n` +
          `高度: ${parseNumber(data.height).toLocaleString()} cm`,
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">新增產品</Typography>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormField
                label="產品名稱"
                {...field}
                error={errors.name}
                placeholder="輸入產品名稱"
              />
            )}
          />

          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <FormField
                label="售價"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="TWD"
                {...field}
                error={errors.price}
              />
            )}
          />

          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <FormField
                label="重量"
                formatNumber
                decimalPlaces={2}
                endAdornment="kg"
                {...field}
                error={errors.weight}
              />
            )}
          />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            尺寸規格
          </Typography>

          <Controller
            name="length"
            control={control}
            render={({ field }) => (
              <FormField
                label="長度"
                formatNumber
                decimalPlaces={1}
                endAdornment="cm"
                {...field}
                error={errors.length}
              />
            )}
          />

          <Controller
            name="width"
            control={control}
            render={({ field }) => (
              <FormField
                label="寬度"
                formatNumber
                decimalPlaces={1}
                endAdornment="cm"
                {...field}
                error={errors.width}
              />
            )}
          />

          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <FormField
                label="高度"
                formatNumber
                decimalPlaces={1}
                endAdornment="cm"
                {...field}
                error={errors.height}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            儲存產品
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 文字對齊方式
 * 展示不同的對齊選項
 */
export const TextAlignment: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">文字對齊方式</Typography>

      <FormField
        label="靠左對齊（預設）"
        textAlign="left"
        defaultValue="Left aligned text"
        helperText="textAlign='left'"
      />

      <FormField
        label="靠右對齊"
        textAlign="right"
        defaultValue="Right aligned text"
        helperText="textAlign='right'"
      />

      <FormField
        label="置中對齊"
        textAlign="center"
        defaultValue="Center aligned text"
        helperText="textAlign='center'"
      />

      <FormField
        label="自動對齊（數值）"
        type="number"
        textAlign="auto"
        defaultValue={12345}
        helperText="textAlign='auto' - 數值自動靠右"
      />

      <FormField
        label="自動對齊（文字）"
        textAlign="auto"
        defaultValue="Auto aligned text"
        helperText="textAlign='auto' - 文字自動靠左"
      />

      <FormField
        label="強制靠左（數值）"
        type="number"
        textAlign="left"
        defaultValue={12345}
        helperText="數值也可以強制靠左"
      />
    </Stack>
  ),
};

/**
 * 帶圖示的登入表單
 * 結合圖示裝飾的實際應用
 */
export const LoginWithIcons: Story = {
  render: function LoginWithIconsComponent() {
    const schema = z.object({
      email: z.string().email('請輸入有效的 Email'),
      password: z.string().min(8, '密碼至少需要 8 個字元'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('登入資料:', data);
      alert('登入成功！');
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">登入</Typography>

          <FormField
            label="Email"
            type="email"
            startAdornment={<EmailIcon />}
            placeholder="your@email.com"
            {...register('email')}
            error={errors.email}
          />

          <FormField
            label="密碼"
            type="password"
            startAdornment={<LockIcon />}
            placeholder="輸入密碼"
            {...register('password')}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            登入
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 數字格式化 - 基本千分位
 * 自動加入千分位符號
 */
export const NumberFormatting: Story = {
  args: {
    label: '金額',
    formatNumber: true,
    startAdornment: '$',
    defaultValue: '1234567.89',
    helperText: '數字會自動加入千分位符號',
  },
};

/**
 * 數字格式化 - 對比
 * 格式化與非格式化的對比
 */
export const NumberFormattingComparison: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">格式化對比</Typography>

      <FormField
        label="未格式化"
        type="number"
        startAdornment="$"
        defaultValue={1234567.89}
        helperText="type='number' - 無千分位符號"
      />

      <FormField
        label="已格式化"
        formatNumber
        startAdornment="$"
        defaultValue="1234567.89"
        helperText="formatNumber={true} - 自動加入千分位"
      />

      <Alert severity="info">
        啟用 formatNumber 後，輸入時會移除格式方便編輯，失焦後自動格式化顯示
      </Alert>
    </Stack>
  ),
};

/**
 * 數字格式化 - 不同語系
 * 展示不同語系的格式化規則
 */
export const NumberFormattingLocales: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">不同語系的格式化</Typography>

      <FormField
        label="美國格式 (en-US)"
        formatNumber
        numberLocale="en-US"
        startAdornment="$"
        defaultValue="1234567.89"
        helperText="1,234,567.89 - 使用逗號和點"
      />

      <FormField
        label="台灣格式 (zh-TW)"
        formatNumber
        numberLocale="zh-TW"
        startAdornment="$"
        defaultValue="1234567.89"
        helperText="1,234,567.89 - 與 en-US 相同"
      />

      <FormField
        label="德國格式 (de-DE)"
        formatNumber
        numberLocale="de-DE"
        startAdornment="€"
        defaultValue="1234567.89"
        helperText="1.234.567,89 - 使用點和逗號（相反）"
      />

      <Alert severity="info">不同語系有不同的千分位和小數點符號規則</Alert>
    </Stack>
  ),
};

/**
 * 數字格式化 - 小數位數控制
 * 控制顯示的小數位數
 */
export const NumberFormattingDecimalPlaces: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">小數位數控制</Typography>

      <FormField
        label="無小數限制"
        formatNumber
        startAdornment="$"
        defaultValue="1234.56789"
        helperText="decimalPlaces 未設定 - 顯示所有小數"
      />

      <FormField
        label="2 位小數"
        formatNumber
        decimalPlaces={2}
        startAdornment="$"
        defaultValue="1234.56789"
        helperText="decimalPlaces={2} - 固定 2 位小數"
      />

      <FormField
        label="0 位小數"
        formatNumber
        decimalPlaces={0}
        defaultValue="1234.56789"
        helperText="decimalPlaces={0} - 只顯示整數"
      />

      <FormField
        label="4 位小數"
        formatNumber
        decimalPlaces={4}
        startAdornment="$"
        defaultValue="1234.5678"
        helperText="decimalPlaces={4} - 4 位小數（精確計算用）"
      />
    </Stack>
  ),
};

/**
 * 數字格式化 - 實際應用範例
 * 結合格式化的完整表單
 */
export const NumberFormattingRealWorld: Story = {
  render: function NumberFormattingRealWorldComponent() {
    const schema = z.object({
      salary: z.string().min(1, '請輸入年薪'),
      bonus: z.string().min(1, '請輸入獎金'),
      investment: z.string().min(1, '請輸入投資金額'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange',
      defaultValues: {
        salary: '',
        bonus: '',
        investment: '',
      },
    });

    // 計算總額
    const parseNumber = (str: string) => {
      if (!str) return 0;
      return parseFloat(str.replace(/,/g, '')) || 0;
    };

    const salary = parseNumber(watch('salary'));
    const bonus = parseNumber(watch('bonus'));
    const investment = parseNumber(watch('investment'));
    const total = salary + bonus + investment;

    const onSubmit = (data: FormData) => {
      console.log('表單資料（原始值）:', data);
      alert(
        `年薪: $${parseNumber(data.salary).toLocaleString()}\n` +
          `獎金: $${parseNumber(data.bonus).toLocaleString()}\n` +
          `投資: $${parseNumber(data.investment).toLocaleString()}\n` +
          `總計: $${total.toLocaleString()}`,
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">財務規劃表單</Typography>

          <Controller
            name="salary"
            control={control}
            render={({ field }) => (
              <FormField
                label="年薪"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="TWD"
                {...field}
                error={errors.salary}
                helperText="請輸入您的年薪"
              />
            )}
          />

          <Controller
            name="bonus"
            control={control}
            render={({ field }) => (
              <FormField
                label="年終獎金"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="TWD"
                {...field}
                error={errors.bonus}
                helperText="請輸入預期的年終獎金"
              />
            )}
          />

          <Controller
            name="investment"
            control={control}
            render={({ field }) => (
              <FormField
                label="投資金額"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="TWD"
                {...field}
                error={errors.investment}
                helperText="請輸入計劃投資金額"
              />
            )}
          />

          <Alert severity="success">
            <Typography variant="body2">
              <strong>總收入預估：</strong>$
              {total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              TWD
            </Typography>
          </Alert>

          <Alert severity="info">
            所有數值會自動格式化為千分位顯示，但提交時保持原始數值
          </Alert>

          <Button type="submit" variant="contained" fullWidth>
            提交
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 數字格式化 - 互動示範
 * 即時展示格式化效果
 */
export const NumberFormattingInteractive: Story = {
  render: function NumberFormattingInteractiveComponent() {
    const schema = z.object({
      amount: z.string(),
    });

    type FormData = z.infer<typeof schema>;

    const { control, watch } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange',
      defaultValues: {
        amount: '1234.56',
      },
    });

    const amount = watch('amount');
    const numericValue = parseFloat((amount || '').replace(/,/g, '')) || 0;

    return (
      <Stack spacing={2}>
        <Typography variant="h6">互動式格式化展示</Typography>

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <FormField
              label="輸入金額"
              formatNumber
              decimalPlaces={2}
              startAdornment="$"
              {...field}
              helperText="聚焦時移除格式，失焦時自動格式化"
            />
          )}
        />

        <Alert severity="info">
          <Typography variant="body2">
            <strong>當前輸入值：</strong>
            {amount}
            <br />
            <strong>數值：</strong>
            {numericValue}
            <br />
            <strong>格式化顯示：</strong>
            {numericValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Alert>

        <Alert severity="warning">
          <Typography variant="body2">
            <strong>使用提示：</strong>
            <br />
            • 點擊欄位聚焦時，會顯示原始數值方便編輯
            <br />
            • 點擊其他地方失焦後，會自動格式化顯示
            <br />• 表單提交時會取得原始數值（無逗號）
          </Typography>
        </Alert>
      </Stack>
    );
  },
};
