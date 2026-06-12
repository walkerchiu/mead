import type { Meta, StoryObj } from '@storybook/nextjs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from './FormField';
import { Button } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormLabel from '@mui/material/FormLabel';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

/**
 * FormField 將 TextField 與錯誤處理結合在一起。
 *
 * ## 功能特性
 * - 與 react-hook-form 完美整合
 * - 自動顯示驗證錯誤
 * - 支援 Zod schema 驗證
 * - 保留所有 TextField 功能
 *
 * ## 使用情境
 * - 任何需要驗證的表單欄位
 * - 搭配 react-hook-form 使用
 */
const meta = {
  title: 'Shared/Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '結合 TextField 與錯誤處理的表單欄位，與 react-hook-form 完美整合。',
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

// ============================================
// Default
// ============================================

/**
 * 基本用法
 * 無錯誤的正常狀態
 */
export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'user@example.com',
    helperText: 'Please enter your email address',
  },
};

// ============================================
// States
// ============================================

/**
 * 含錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: 'Username',
    defaultValue: 'ab',
    error: 'Username must be at least 3 characters',
  },
};

/**
 * react-hook-form 的 error 物件
 * 接受 FieldError 物件
 */
export const WithFieldError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    defaultValue: '123',
    error: {
      type: 'minLength',
      message: 'Password must be at least 8 characters',
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
    helperText: 'This field is required',
  },
};

// ============================================
// Features: Text Alignment
// ============================================

/**
 * 文字對齊
 * 示範不同的對齊選項
 */
export const TextAlignment: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">文字對齊</Typography>

      <FormField
        label="Left aligned (default)"
        textAlign="left"
        defaultValue="Left aligned text"
        helperText="textAlign='left'"
      />

      <FormField
        label="Right aligned"
        textAlign="right"
        defaultValue="Right aligned text"
        helperText="textAlign='right'"
      />

      <FormField
        label="Center aligned"
        textAlign="center"
        defaultValue="Center aligned text"
        helperText="textAlign='center'"
      />

      <FormField
        label="Auto aligned (numbers)"
        type="number"
        textAlign="auto"
        defaultValue={12345}
        helperText="textAlign='auto' - Numbers auto-align right"
      />

      <FormField
        label="Auto aligned (text)"
        textAlign="auto"
        defaultValue="Auto aligned text"
        helperText="textAlign='auto' - Text auto-aligns left"
      />

      <FormField
        label="Force left (numbers)"
        type="number"
        textAlign="left"
        defaultValue={12345}
        helperText="Numbers can be forced left"
      />
    </Stack>
  ),
};

// ============================================
// Features: Adornments (Units)
// ============================================

/**
 * 含前側裝飾
 * 在欄位前顯示單位或標籤（數字自動靠右對齊）
 */
export const WithStartAdornment: Story = {
  args: {
    label: 'Price',
    type: 'number',
    startAdornment: '$',
    placeholder: '0.00',
    helperText: 'Enter product price (numbers auto-align right)',
  },
};

/**
 * 含後側裝飾
 * 在欄位後顯示單位
 */
export const WithEndAdornment: Story = {
  args: {
    label: 'Weight',
    type: 'number',
    endAdornment: 'kg',
    placeholder: '0',
    helperText: 'Enter product weight',
  },
};

/**
 * 含前後兩側裝飾
 * 顯示貨幣符號與單位
 */
export const WithBothAdornments: Story = {
  args: {
    label: 'Amount',
    type: 'number',
    startAdornment: 'NT$',
    endAdornment: 'TWD',
    placeholder: '0.00',
    helperText: 'Enter amount （TWD）',
  },
};

/**
 * 各種單位範例
 * 示範不同的單位標籤
 */
export const UnitsExamples: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">各式單位範例</Typography>

      <FormField
        label="Price"
        type="number"
        startAdornment="$"
        placeholder="0.00"
      />

      <FormField
        label="Discount"
        type="number"
        endAdornment="%"
        placeholder="0"
      />

      <FormField
        label="Weight"
        type="number"
        endAdornment="kg"
        placeholder="0"
      />

      <FormField
        label="Distance"
        type="number"
        endAdornment="km"
        placeholder="0"
      />

      <FormField
        label="Temperature"
        type="number"
        endAdornment="°C"
        placeholder="0"
      />

      <FormField
        label="Volume"
        type="number"
        endAdornment="L"
        placeholder="0"
      />
    </Stack>
  ),
};

// ============================================
// Features: Adornments (Icons)
// ============================================

/**
 * 含前側圖示
 * 使用 MUI 圖示作為前綴
 */
export const WithIconStart: Story = {
  args: {
    label: 'Search',
    startAdornment: <SearchIcon />,
    placeholder: 'Enter keywords to search...',
  },
};

/**
 * 含後側圖示
 * 使用 MUI 圖示作為後綴
 */
export const WithIconEnd: Story = {
  args: {
    label: 'Username',
    endAdornment: <PersonIcon />,
    placeholder: 'Enter username',
  },
};

/**
 * 各種圖示範例
 * 示範不同的圖示裝飾
 */
export const IconExamples: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">各式圖示範例</Typography>

      <FormField
        label="Search"
        startAdornment={<SearchIcon />}
        placeholder="Enter keywords..."
      />

      <FormField
        label="Email"
        startAdornment={<EmailIcon />}
        placeholder="your@email.com"
      />

      <FormField
        label="Phone"
        startAdornment={<PhoneIcon />}
        placeholder="+886 912 345 678"
      />

      <FormField
        label="Username"
        startAdornment={<PersonIcon />}
        placeholder="username"
      />

      <FormField
        label="Password"
        type="password"
        startAdornment={<LockIcon />}
        placeholder="Enter password"
      />
    </Stack>
  ),
};

// ============================================
// Features: Number Formatting
// ============================================

/**
 * 數字格式化 - 基本千分位
 * 自動加入千分位分隔符號
 */
export const NumberFormatting: Story = {
  args: {
    label: 'Amount',
    formatNumber: true,
    startAdornment: '$',
    defaultValue: '1234567.89',
    helperText: 'Numbers will auto-add thousands separator',
  },
};

/**
 * 數字格式化 - 比較
 * 格式化與未格式化的比較
 */
export const NumberFormattingComparison: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">格式化比較</Typography>

      <FormField
        label="Unformatted"
        type="number"
        startAdornment="$"
        defaultValue={1234567.89}
        helperText="type='number' - No thousands separator"
      />

      <FormField
        label="Formatted"
        formatNumber
        startAdornment="$"
        defaultValue="1234567.89"
        helperText="formatNumber={true} - Auto-add thousands separator"
      />

      <Alert severity="info">
        When formatNumber is enabled, formatting is removed on focus for easier
        editing, and automatically formatted on blur
      </Alert>
    </Stack>
  ),
};

/**
 * 數字格式化 - 不同語系
 * 示範不同語系的格式化規則
 */
export const NumberFormattingLocales: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">不同地區的格式化</Typography>

      <FormField
        label="US Format (en-US)"
        formatNumber
        numberLocale="en-US"
        startAdornment="$"
        defaultValue="1234567.89"
        helperText="1,234,567.89 - Uses comma and dot"
      />

      <FormField
        label="Taiwan Format (zh-TW)"
        formatNumber
        numberLocale="zh-TW"
        startAdornment="$"
        defaultValue="1234567.89"
        helperText="1,234,567.89 - Same as en-US"
      />

      <FormField
        label="German Format (de-DE)"
        formatNumber
        numberLocale="de-DE"
        startAdornment="€"
        defaultValue="1234567.89"
        helperText="1.234.567,89 - Uses dot and comma (reversed)"
      />

      <Alert severity="info">
        Different locales have different rules for thousands and decimal
        separators
      </Alert>
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
        label="No decimal limit"
        formatNumber
        startAdornment="$"
        defaultValue="1234.56789"
        helperText="decimalPlaces not set - Show all decimals"
      />

      <FormField
        label="2 decimal places"
        formatNumber
        decimalPlaces={2}
        startAdornment="$"
        defaultValue="1234.56789"
        helperText="decimalPlaces={2} - Fixed 2 decimal places"
      />

      <FormField
        label="0 decimal places"
        formatNumber
        decimalPlaces={0}
        defaultValue="1234.56789"
        helperText="decimalPlaces={0} - Only show integers"
      />

      <FormField
        label="4 decimal places"
        formatNumber
        decimalPlaces={4}
        startAdornment="$"
        defaultValue="1234.5678"
        helperText="decimalPlaces={4} - 4 decimal places (for precise calculations)"
      />
    </Stack>
  ),
};

/**
 * 數字格式化 - 互動示範
 * 即時格式化效果顯示
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
        <Typography variant="h6">互動格式化示範</Typography>

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <FormField
              label="Enter Amount"
              formatNumber
              decimalPlaces={2}
              startAdornment="$"
              {...field}
              helperText="Remove format on focus, auto-format on blur"
            />
          )}
        />

        <Alert severity="info">
          <Typography variant="body2">
            <strong>目前輸入值：</strong>
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
            • 聚焦時會顯示原始數值，以便編輯
            <br />
            • 失焦時會自動格式化顯示
            <br />• 表單送出時會取得原始數值（不含千分位逗號）
          </Typography>
        </Alert>
      </Stack>
    );
  },
};

// ============================================
// Interactive Examples
// ============================================

/**
 * 完整表單範例
 * 使用 react-hook-form + Zod 驗證
 */
export const FormExample: Story = {
  render: function FormExampleComponent() {
    // Define Zod schema
    const schema = z.object({
      email: z.string().email('Please enter a valid email address'),
      username: z.string().min(3, 'Username must be at least 3 characters'),
      age: z
        .number()
        .min(18, 'You must be 18 or older')
        .max(120, 'Please enter a valid age'),
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
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      alert('Submitted successfully! Check Console');
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Registration Form</Typography>

          <FormField
            label="Email"
            type="email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email}
            helperText="We won't share your email"
          />

          <FormField
            label="Username"
            placeholder="Enter username"
            {...register('username')}
            error={errors.username}
            helperText="At least 3 characters"
          />

          <FormField
            label="Age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            error={errors.age}
            helperText="Must be 18 or older"
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
 * 登入表單範例
 * 簡單的 email + 密碼表單
 */
export const LoginForm: Story = {
  render: function LoginFormComponent() {
    const schema = z.object({
      email: z.string().email('Please enter a valid email'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
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
      console.log('Login data:', data);
      alert('Login successful!');
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Login</Typography>

          <FormField
            label="Email"
            type="email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email}
          />

          <FormField
            label="Password"
            type="password"
            placeholder="Enter password"
            {...register('password')}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            Login
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 含圖示的登入表單
 * 含圖示裝飾的實際應用
 */
export const LoginWithIcons: Story = {
  render: function LoginWithIconsComponent() {
    const schema = z.object({
      email: z.string().email('Enter valid email'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
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
      console.log('Login data:', data);
      alert('Login successful!');
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Login</Typography>

          <FormField
            label="Email"
            type="email"
            startAdornment={<EmailIcon />}
            placeholder="your@email.com"
            {...register('email')}
            error={errors.email}
          />

          <FormField
            label="Password"
            type="password"
            startAdornment={<LockIcon />}
            placeholder="Enter password"
            {...register('password')}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            Login
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
      email: z.string().email('Please enter a valid email'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange', // Realtime validation
    });

    const onSubmit = (data: FormData) => {
      console.log(data);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Start typing to see realtime validation
          </Typography>

          <FormField
            label="Email"
            type="email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email}
          />

          {!errors.email && (
            <Alert severity="success">Email format is correct!</Alert>
          )}
        </Stack>
      </form>
    );
  },
};

/**
 * 貨幣輸入範例
 * 實際金額輸入應用
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
        { message: 'Amount must be between 0 and 1,000,000' },
      ),
      discount: z.string().refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: 'Discount must be between 0% and 100%' },
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

    // parse formatted number string
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
        `Original: $${finalAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
          `Discount: ${finalDisc}%\n` +
          `Final: $${final.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Product Price Calculation</Typography>

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <FormField
                label="Original Price"
                formatNumber
                decimalPlaces={2}
                startAdornment="NT$"
                endAdornment="TWD"
                {...field}
                error={errors.amount}
                helperText="Enter Original Price"
              />
            )}
          />

          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <FormField
                label="Discount"
                formatNumber
                decimalPlaces={0}
                endAdornment="%"
                {...field}
                error={errors.discount}
                helperText="Enter Discount percentage"
              />
            )}
          />

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Original:</strong>$
              {amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <br />
              <strong>Discount:</strong>
              {discount}%<br />
              <strong>Final Amount:</strong>$
              {finalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Alert>

          <Button type="submit" variant="contained" fullWidth>
            Confirm Price
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 產品規格表單
 * 實際產品資訊輸入應用
 */
export const ProductSpecForm: Story = {
  render: function ProductSpecFormComponent() {
    const schema = z.object({
      name: z.string().min(1, 'Enter product name'),
      price: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: 'Price cannot be negative' },
      ),
      weight: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: 'Weight cannot be negative' },
      ),
      length: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: 'Length cannot be negative' },
      ),
      width: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: 'Width cannot be negative' },
      ),
      height: z.string().refine(
        (val) => {
          if (!val) return false;
          const num = parseFloat(val.replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        },
        { message: 'Height cannot be negative' },
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

      // Convert formatted string back to number for display
      const parseNumber = (str: string) =>
        parseFloat(str.replace(/,/g, '')) || 0;

      console.log('Product data (raw values):', data);
      alert(
        `Product Name: ${data.name}\n` +
          `Price: $${parseNumber(data.price).toLocaleString()} TWD\n` +
          `Weight: ${parseNumber(data.weight).toLocaleString()} kg\n` +
          `Length: ${parseNumber(data.length).toLocaleString()} cm\n` +
          `Width: ${parseNumber(data.width).toLocaleString()} cm\n` +
          `Height: ${parseNumber(data.height).toLocaleString()} cm`,
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Add Product</Typography>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormField
                label="Product Name"
                {...field}
                error={errors.name}
                placeholder="Enter Product Name"
              />
            )}
          />

          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <FormField
                label="Price"
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
                label="Weight"
                formatNumber
                decimalPlaces={2}
                endAdornment="kg"
                {...field}
                error={errors.weight}
              />
            )}
          />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Dimensions
          </Typography>

          <Controller
            name="length"
            control={control}
            render={({ field }) => (
              <FormField
                label="Length"
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
                label="Width"
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
                label="Height"
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
            Save Product
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 數字格式化 - 實際應用範例
 * 含格式化的完整表單
 */
export const NumberFormattingRealWorld: Story = {
  render: function NumberFormattingRealWorldComponent() {
    const schema = z.object({
      salary: z.string().min(1, 'Enter Annual Salary'),
      bonus: z.string().min(1, 'Enter Bonus'),
      investment: z.string().min(1, 'Enter Investment Amount'),
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

    // Calculate total amount
    const parseNumber = (str: string) => {
      if (!str) return 0;
      return parseFloat(str.replace(/,/g, '')) || 0;
    };

    const salary = parseNumber(watch('salary'));
    const bonus = parseNumber(watch('bonus'));
    const investment = parseNumber(watch('investment'));
    const total = salary + bonus + investment;

    const onSubmit = (data: FormData) => {
      console.log('Form data (raw values):', data);
      alert(
        `Annual Salary: $${parseNumber(data.salary).toLocaleString()}\n` +
          `Bonus: $${parseNumber(data.bonus).toLocaleString()}\n` +
          `Investment: $${parseNumber(data.investment).toLocaleString()}\n` +
          `Total: $${total.toLocaleString()}`,
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Financial Planning Form</Typography>

          <Controller
            name="salary"
            control={control}
            render={({ field }) => (
              <FormField
                label="Annual Salary"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="TWD"
                {...field}
                error={errors.salary}
                helperText="Enter your annual salary"
              />
            )}
          />

          <Controller
            name="bonus"
            control={control}
            render={({ field }) => (
              <FormField
                label="Year-end Bonus"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="TWD"
                {...field}
                error={errors.bonus}
                helperText="Enter expected year-end bonus"
              />
            )}
          />

          <Controller
            name="investment"
            control={control}
            render={({ field }) => (
              <FormField
                label="Investment Amount"
                formatNumber
                decimalPlaces={2}
                startAdornment="$"
                endAdornment="TWD"
                {...field}
                error={errors.investment}
                helperText="Enter planned investment amount"
              />
            )}
          />

          <Alert severity="success">
            <Typography variant="body2">
              <strong>Total Income Estimate:</strong>$
              {total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              TWD
            </Typography>
          </Alert>

          <Alert severity="info">
            All numbers will be formatted with thousands separator for display,
            but maintain original values when submitting
          </Alert>

          <Button type="submit" variant="contained" fullWidth>
            Submit
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 部門表單範例
 * 來自部門管理的實際範例
 * 示範搭配外部標籤的多行 textarea 正確用法
 */
export const DepartmentForm: Story = {
  render: function DepartmentFormComponent() {
    const schema = z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
      code: z
        .string()
        .min(2, 'Code must be at least 2 characters')
        .max(50, 'Code cannot exceed 50 characters')
        .regex(
          /^[A-Z0-9_-]+$/,
          'Code must contain only uppercase, numbers, underscore, and hyphen',
        ),
      description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    });

    type FormData = z.infer<typeof schema>;

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange',
      defaultValues: {
        name: '',
        code: '',
        description: '',
      },
    });

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Department data:', data);
      alert('Department created successfully!');
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Create Department</Typography>

          <FormField
            {...register('name')}
            label="Department Name"
            required
            placeholder="Enter department name"
            error={errors.name}
            helperText={
              errors.name?.message || 'Enter department name (2-100 characters)'
            }
            autoFocus
          />

          <FormField
            {...register('code')}
            label="Department Code"
            required
            placeholder="DEPT-CODE"
            error={errors.code}
            helperText={
              errors.code?.message ||
              'Enter department code (uppercase letters, numbers, underscore, hyphen)'
            }
          />

          {/* Multiline textarea with external label */}
          <Box sx={{ mt: 3 }}>
            <FormLabel
              component="div"
              sx={{
                display: 'block',
                mb: 2,
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              Description
            </FormLabel>
            <FormField
              {...register('description')}
              fullWidth
              multiline
              rows={5}
              error={errors.description}
              helperText={
                errors.description?.message ||
                'Enter department description (optional, max 500 characters)'
              }
              placeholder="Enter detailed description of the department's responsibilities and scope..."
            />
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>備註：</strong>description 欄位使用外部的 FormLabel（搭配
              component="div"），而非內建的 label prop。對於多行
              textarea，這是建議做法，可避免 定位問題。
            </Typography>
          </Alert>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            Create Department
          </Button>
        </Stack>
      </form>
    );
  },
};
