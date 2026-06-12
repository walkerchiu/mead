import type { Meta, StoryObj } from '@storybook/nextjs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SelectField } from './SelectField';
import { FormField } from '../FormField';
import { Button, Icon } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * SelectField 將 TextField Select 與錯誤處理結合在一起。
 *
 * ## 功能特性
 * - 支援單選與多選
 * - 與 react-hook-form 完美整合
 * - 支援選項分組
 * - 支援含圖示的選項（Icon／Emoji）
 * - 支援搜尋篩選（使用 Autocomplete）
 * - 多選可顯示為 Chip
 * - 自動顯示驗證錯誤
 *
 * ## 使用情境
 * - 下拉選單
 * - 多選選單
 * - 分組選項選單
 * - 可搜尋的長列表選單
 * - 含圖示的選項選單
 */
const meta = {
  title: 'Shared/Molecules/SelectField',
  component: SelectField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '結合 TextField Select 與錯誤處理的下拉選單元件，與 react-hook-form 完美整合。',
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
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Common option data
const countryOptions = [
  { value: 'tw', label: 'Taiwan' },
  { value: 'us', label: 'United States' },
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'cn', label: 'China' },
];

const cityOptions = [
  { group: 'North', value: 'taipei', label: 'Taipei City' },
  { group: 'North', value: 'new-taipei', label: 'New Taipei City' },
  { group: 'North', value: 'taoyuan', label: 'Taoyuan City' },
  { group: 'Central', value: 'taichung', label: 'Taichung City' },
  { group: 'Central', value: 'changhua', label: 'Changhua County' },
  { group: 'South', value: 'tainan', label: 'Tainan City' },
  { group: 'South', value: 'kaohsiung', label: 'Kaohsiung City' },
  { group: 'East', value: 'hualien', label: 'Hualien County' },
  { group: 'East', value: 'taitung', label: 'Taitung County' },
];

const interestOptions = [
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'reading', label: 'Reading' },
  { value: 'travel', label: 'Travel' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'art', label: 'Art' },
  { value: 'photography', label: 'Photography' },
];

/**
 * 基本單選
 * 最簡單的下拉選單
 */
export const Default: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Please select',
    helperText: 'Please select your country',
  },
};

/**
 * 含預設值
 * 顯示預先選取的值
 */
export const WithDefaultValue: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    defaultValue: 'tw',
    helperText: 'Default selection is Taiwan',
  },
};

/**
 * 含佔位文字
 * 提示使用者進行選擇
 */
export const WithPlaceholder: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Please select a country',
    helperText: 'A country must be selected',
  },
};

/**
 * 含錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Please select',
    error: 'This field is required',
  },
};

/**
 * 停用狀態
 * 無法選取
 */
export const Disabled: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    defaultValue: 'tw',
    disabled: true,
    helperText: 'This field is disabled',
  },
};

/**
 * 必填欄位
 * 顯示星號標記
 */
export const Required: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    required: true,
    placeholder: 'Please select',
    helperText: 'This field is required',
  },
};

/**
 * 各種變體
 * 顯示不同樣式的選單
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">Various Variants</Typography>

      <SelectField
        label="Country (Outlined)"
        options={countryOptions}
        variant="outlined"
        placeholder="Please select"
        defaultValue="tw"
        helperText="variant='outlined'"
      />

      <SelectField
        label="Country (Filled)"
        options={countryOptions}
        variant="filled"
        placeholder="Please select"
        defaultValue="tw"
        helperText="variant='filled'"
      />

      <SelectField
        label="Country (Standard)"
        options={countryOptions}
        variant="standard"
        placeholder="Please select"
        defaultValue="tw"
        helperText="variant='standard'"
      />
    </Stack>
  ),
};

/**
 * 各種尺寸
 * 顯示不同尺寸的選單並與 FormField 比較
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Various Sizes</Typography>

      <Stack spacing={2}>
        <Typography variant="subtitle2" color="primary">
          Small Size
        </Typography>
        <SelectField
          label="Country (Small)"
          options={countryOptions}
          size="small"
          placeholder="Please select"
          defaultValue="tw"
          helperText="size='small'"
        />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="subtitle2" color="primary">
          Medium Size (Default)
        </Typography>
        <SelectField
          label="Country (Medium)"
          options={countryOptions}
          size="medium"
          placeholder="Please select"
          defaultValue="tw"
          helperText="size='medium'"
        />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="subtitle2" color="primary">
          Large Size
        </Typography>
        <SelectField
          label="Country (Large)"
          options={countryOptions}
          size="large"
          placeholder="Please select"
          defaultValue="tw"
          helperText="size='large'"
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Both FormField and SelectField maintain consistent styling across
        different sizes.
      </Typography>

      <Stack spacing={2}>
        <Typography variant="subtitle2" color="primary">
          Size Comparison with FormField
        </Typography>
        <FormField
          label="Text Input (Medium)"
          placeholder="Enter text"
          size="medium"
        />
        <SelectField
          label="Select (Medium)"
          options={countryOptions}
          placeholder="Select option"
          size="medium"
        />
      </Stack>
    </Stack>
  ),
};

/**
 * 完整寬度
 * 佔滿容器寬度
 */
export const FullWidth: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    fullWidth: true,
    placeholder: 'Please select',
    defaultValue: 'tw',
    helperText: 'fullWidth={true}',
  },
};

/**
 * 分組選項
 * 依群組分類的選項
 */
export const GroupedOptions: Story = {
  args: {
    label: 'City',
    options: cityOptions,
    placeholder: 'Please select a city',
    helperText: 'Options are grouped by region',
  },
};

/**
 * 部分選項停用
 * 部分選項無法選取
 */
export const WithDisabledOptions: Story = {
  args: {
    label: 'Country',
    options: [
      { value: 'tw', label: 'Taiwan' },
      { value: 'us', label: 'United States' },
      { value: 'jp', label: 'Japan (Service Suspended)', disabled: true },
      { value: 'kr', label: 'South Korea (Service Suspended)', disabled: true },
      { value: 'cn', label: 'China' },
    ],
    placeholder: 'Please select',
    helperText: 'Some countries have suspended service',
  },
};

/**
 * 多選選單
 * 可選取多個選項
 */
export const Multiple: Story = {
  args: {
    label: 'Interests',
    options: interestOptions,
    multiple: true,
    placeholder: 'Please select interests',
    defaultValue: ['music', 'sports'],
    helperText: 'You can select multiple interests',
  },
};

/**
 * 多選 - 顯示 Chip
 * 以 chip 顯示已選取的項目
 */
export const MultipleWithChips: Story = {
  args: {
    label: 'Interests',
    options: interestOptions,
    multiple: true,
    renderChips: true,
    placeholder: 'Please select interests',
    defaultValue: ['music', 'sports', 'reading'],
    helperText: 'Selected items will be displayed as chips',
  },
};

/**
 * 多選 - 不含核取方塊
 * 簡潔的多選樣式
 */
export const MultipleWithoutCheckbox: Story = {
  args: {
    label: 'Interests',
    options: interestOptions,
    multiple: true,
    showCheckbox: false,
    renderChips: true,
    placeholder: 'Please select interests',
    defaultValue: ['music', 'sports'],
    helperText: 'Multiple selection without checkbox',
  },
};

/**
 * 多選 - 不含 Chip
 * 顯示為文字列表
 */
export const MultipleWithoutChips: Story = {
  args: {
    label: 'Interests',
    options: interestOptions,
    multiple: true,
    renderChips: false,
    placeholder: 'Please select interests',
    defaultValue: ['music', 'sports', 'reading'],
    helperText: 'Selected items displayed as text list',
  },
};

/**
 * 含圖示的選項
 * 選項可包含圖示
 */
export const WithIcons: Story = {
  args: {
    label: 'Transportation',
    options: [
      { value: 'car', label: 'Car', icon: <Icon>🚗</Icon> },
      { value: 'bus', label: 'Bus', icon: <Icon>🚌</Icon> },
      { value: 'train', label: 'Train', icon: <Icon>🚆</Icon> },
      { value: 'plane', label: 'Plane', icon: <Icon>✈️</Icon> },
      { value: 'bike', label: 'Bicycle', icon: <Icon>🚲</Icon> },
    ],
    placeholder: 'Please select transportation',
    helperText: 'Options with icons',
  },
};

/**
 * 含圖示的分組選項
 * 分組選項可包含圖示
 */
export const GroupedWithIcons: Story = {
  args: {
    label: 'Food',
    options: [
      {
        group: 'Fruits',
        value: 'apple',
        label: 'Apple',
        icon: <Icon>🍎</Icon>,
      },
      {
        group: 'Fruits',
        value: 'banana',
        label: 'Banana',
        icon: <Icon>🍌</Icon>,
      },
      {
        group: 'Fruits',
        value: 'orange',
        label: 'Orange',
        icon: <Icon>🍊</Icon>,
      },
      {
        group: 'Vegetables',
        value: 'carrot',
        label: 'Carrot',
        icon: <Icon>🥕</Icon>,
      },
      {
        group: 'Vegetables',
        value: 'broccoli',
        label: 'Broccoli',
        icon: <Icon>🥦</Icon>,
      },
      {
        group: 'Vegetables',
        value: 'tomato',
        label: 'Tomato',
        icon: <Icon>🍅</Icon>,
      },
      {
        group: 'Meats',
        value: 'chicken',
        label: 'Chicken',
        icon: <Icon>🍗</Icon>,
      },
      { group: 'Meats', value: 'beef', label: 'Beef', icon: <Icon>🥩</Icon> },
      { group: 'Meats', value: 'pork', label: 'Pork', icon: <Icon>🥓</Icon> },
    ],
    placeholder: 'Please select food',
    helperText: 'Grouped options with icons',
  },
};

/**
 * 可搜尋的選單
 * 啟用搜尋功能以關鍵字篩選選項
 */
export const Searchable: Story = {
  args: {
    label: 'Country',
    options: [
      { value: 'tw', label: 'Taiwan' },
      { value: 'us', label: 'United States' },
      { value: 'jp', label: 'Japan' },
      { value: 'kr', label: 'South Korea' },
      { value: 'cn', label: 'China' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
      { value: 'au', label: 'Australia' },
      { value: 'ca', label: 'Canada' },
    ],
    searchable: true,
    placeholder: 'Search country',
    helperText: 'You can enter keywords to search',
  },
};

/**
 * 可搜尋 + 圖示
 * 結合搜尋功能與圖示
 */
export const SearchableWithIcons: Story = {
  args: {
    label: 'Weather',
    options: [
      { value: 'sunny', label: 'Sunny', icon: <Icon>☀️</Icon> },
      { value: 'cloudy', label: 'Cloudy', icon: <Icon>☁️</Icon> },
      { value: 'rainy', label: 'Rainy', icon: <Icon>🌧️</Icon> },
      { value: 'snowy', label: 'Snowy', icon: <Icon>❄️</Icon> },
      { value: 'stormy', label: 'Stormy', icon: <Icon>⛈️</Icon> },
      { value: 'foggy', label: 'Foggy', icon: <Icon>🌫️</Icon> },
      { value: 'meady', label: 'Windy', icon: <Icon>💨</Icon> },
    ],
    searchable: true,
    placeholder: 'Search weather',
    helperText: 'Searchable options with icons',
  },
};

/**
 * 可搜尋 + 分組
 * 搜尋功能支援分組選項
 */
export const SearchableGrouped: Story = {
  args: {
    label: 'City',
    options: [
      { group: 'North', value: 'taipei', label: 'Taipei City' },
      { group: 'North', value: 'new-taipei', label: 'New Taipei City' },
      { group: 'North', value: 'taoyuan', label: 'Taoyuan City' },
      { group: 'North', value: 'hsinchu', label: 'Hsinchu City' },
      { group: 'Central', value: 'taichung', label: 'Taichung City' },
      { group: 'Central', value: 'changhua', label: 'Changhua County' },
      { group: 'Central', value: 'nantou', label: 'Nantou County' },
      { group: 'South', value: 'tainan', label: 'Tainan City' },
      { group: 'South', value: 'kaohsiung', label: 'Kaohsiung City' },
      { group: 'South', value: 'pingtung', label: 'Pingtung County' },
      { group: 'East', value: 'hualien', label: 'Hualien County' },
      { group: 'East', value: 'taitung', label: 'Taitung County' },
    ],
    searchable: true,
    placeholder: 'Search city',
    helperText: 'Searchable grouped options',
  },
};

/**
 * 可搜尋的多選
 * 搜尋功能支援多選
 */
export const SearchableMultiple: Story = {
  args: {
    label: 'Interests',
    options: [
      { value: 'music', label: 'Music', icon: <Icon>🎵</Icon> },
      { value: 'sports', label: 'Sports', icon: <Icon>⚽</Icon> },
      { value: 'reading', label: 'Reading', icon: <Icon>📚</Icon> },
      { value: 'travel', label: 'Travel', icon: <Icon>✈️</Icon> },
      { value: 'cooking', label: 'Cooking', icon: <Icon>🍳</Icon> },
      { value: 'gaming', label: 'Gaming', icon: <Icon>🎮</Icon> },
      { value: 'art', label: 'Art', icon: <Icon>🎨</Icon> },
      { value: 'photography', label: 'Photography', icon: <Icon>📷</Icon> },
      { value: 'dancing', label: 'Dancing', icon: <Icon>💃</Icon> },
      { value: 'singing', label: 'Singing', icon: <Icon>🎤</Icon> },
    ],
    searchable: true,
    multiple: true,
    renderChips: true,
    defaultValue: ['music', 'sports'],
    placeholder: 'Search interests',
    helperText: 'Searchable multiple selection options',
  },
};

/**
 * 數值型選項
 * 選項值為數值型
 */
export const NumberValues: Story = {
  render: function NumberValuesComponent() {
    const schema = z.object({
      quantity: z.number().min(1, 'Please select a quantity'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        quantity: 0,
      },
    });

    const quantityOptions = [
      { value: 1, label: '1 item' },
      { value: 2, label: '2 items' },
      { value: 5, label: '5 items' },
      { value: 10, label: '10 items' },
      { value: 20, label: '20 items' },
      { value: 50, label: '50 items' },
    ];

    const onSubmit = (data: FormData) => {
      alert(`Selected quantity: ${data.quantity}`);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Number Value Options</Typography>

          <Controller
            name="quantity"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <SelectField
                label="Quantity"
                options={quantityOptions}
                placeholder="Please select quantity"
                value={value || ''}
                onChange={(e) => onChange(Number(e.target.value))}
                {...field}
                error={errors.quantity}
                helperText="Option values are numeric type"
              />
            )}
          />

          <Button type="submit" variant="contained" fullWidth>
            Submit
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 完整功能展示
 * 可搜尋 + 分組 + 圖示 + 多選
 */
export const FullFeatures: Story = {
  args: {
    label: 'Select your favorite activities',
    options: [
      {
        group: 'Outdoor Activities',
        value: 'hiking',
        label: 'Hiking',
        icon: <Icon>🥾</Icon>,
      },
      {
        group: 'Outdoor Activities',
        value: 'camping',
        label: 'Camping',
        icon: <Icon>⛺</Icon>,
      },
      {
        group: 'Outdoor Activities',
        value: 'cycling',
        label: 'Cycling',
        icon: <Icon>🚴</Icon>,
      },
      {
        group: 'Outdoor Activities',
        value: 'surfing',
        label: 'Surfing',
        icon: <Icon>🏄</Icon>,
      },
      {
        group: 'Indoor Activities',
        value: 'reading',
        label: 'Reading',
        icon: <Icon>📖</Icon>,
      },
      {
        group: 'Indoor Activities',
        value: 'gaming',
        label: 'Gaming',
        icon: <Icon>🎮</Icon>,
      },
      {
        group: 'Indoor Activities',
        value: 'cooking',
        label: 'Cooking',
        icon: <Icon>👨‍🍳</Icon>,
      },
      {
        group: 'Indoor Activities',
        value: 'painting',
        label: 'Painting',
        icon: <Icon>🖌️</Icon>,
      },
      {
        group: 'Sports',
        value: 'basketball',
        label: 'Basketball',
        icon: <Icon>🏀</Icon>,
      },
      {
        group: 'Sports',
        value: 'soccer',
        label: 'Soccer',
        icon: <Icon>⚽</Icon>,
      },
      {
        group: 'Sports',
        value: 'swimming',
        label: 'Swimming',
        icon: <Icon>🏊</Icon>,
      },
      { group: 'Sports', value: 'yoga', label: 'Yoga', icon: <Icon>🧘</Icon> },
    ],
    searchable: true,
    multiple: true,
    renderChips: true,
    showCheckbox: true,
    defaultValue: ['hiking', 'reading', 'basketball'],
    placeholder: 'Search activities',
    helperText:
      'Demonstrating all features: Searchable + Grouped + Icons + Multiple selection',
  },
};

/**
 * 文字對齊檢查
 * 驗證文字在 SelectField 中是否正確對齊
 */
export const TextAlignment: Story = {
  render: () => (
    <Stack spacing={2.5}>
      <Typography variant="h6">Text Alignment Verification</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        All fields should have text aligned at the same vertical position:
      </Typography>

      <FormField
        label="用戶 ID"
        placeholder="輸入用戶 ID"
        defaultValue="user123"
        helperText="Text input - check vertical alignment"
      />

      <SelectField
        label="狀態"
        options={[
          { value: 'active', label: '活躍' },
          { value: 'expired', label: '過期' },
          { value: 'revoked', label: '已撤銷' },
        ]}
        defaultValue="active"
        helperText="Select field - text should align with above"
      />

      <FormField
        label="設備資訊"
        placeholder="例如：Chrome、iPhone"
        defaultValue="Chrome"
        helperText="Another text input for comparison"
      />

      <SelectField
        label="地理位置"
        options={[
          { value: 'tw', label: '台灣' },
          { value: 'us', label: '美國' },
          { value: 'jp', label: '日本' },
        ]}
        defaultValue="tw"
        helperText="Another select - alignment should be consistent"
      />
    </Stack>
  ),
};

/**
 * 樣式一致性
 * 示範 SelectField 與 FormField 樣式相符
 */
export const StyleConsistency: Story = {
  render: function StyleConsistencyComponent() {
    const schema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      country: z.string().min(1, 'Please select a country'),
      email: z.string().email('Invalid email address'),
      status: z.string().min(1, 'Please select a status'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        username: '',
        country: '',
        email: '',
        status: '',
      },
    });

    const onSubmit = (data: FormData) => {
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          <Typography variant="h6">Form Fields Style Consistency</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Notice how SelectField and FormField have identical styling:
            <br />
            • Same border colors and thickness
            <br />
            • Same hover and focus states
            <br />
            • Same label positioning
            <br />
            • Same height and padding
            <br />• Same error states
          </Typography>

          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <FormField
                label="Username"
                placeholder="Enter username"
                {...field}
                error={errors.username}
                helperText="This is a FormField (text input)"
              />
            )}
          />

          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Country"
                options={countryOptions}
                placeholder="Select a country"
                {...field}
                error={errors.country}
                helperText="This is a SelectField (dropdown) - same style!"
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormField
                label="Email"
                type="email"
                placeholder="Enter email"
                {...field}
                error={errors.email}
                helperText="Another FormField for comparison"
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
                placeholder="Select status"
                {...field}
                error={errors.status}
                helperText="Another SelectField - consistent styling"
              />
            )}
          />

          <Button type="submit" variant="contained" fullWidth>
            Submit Form
          </Button>
        </Stack>
      </form>
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
      country: z.string().min(1, 'Please select a country'),
      city: z.string().min(1, 'Please select a city'),
      interests: z
        .array(z.string())
        .min(1, 'Please select at least one interest'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        country: '',
        city: '',
        interests: [],
      },
    });

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Personal Information Form</Typography>

          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Country"
                options={countryOptions}
                placeholder="Please select a country"
                {...field}
                error={errors.country}
                helperText="Please select your country"
              />
            )}
          />

          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <SelectField
                label="City"
                options={cityOptions}
                placeholder="Please select a city"
                {...field}
                error={errors.city}
                helperText="Options are grouped by region"
              />
            )}
          />

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Interests"
                options={interestOptions}
                multiple
                renderChips
                {...field}
                error={errors.interests}
                helperText="You can select multiple interests"
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
 * 連動選擇範例
 * 第二個選單依第一個選單的值而變動
 */
export const DependentSelects: Story = {
  render: function DependentSelectsComponent() {
    const schema = z.object({
      category: z.string().min(1, 'Please select a category'),
      item: z.string().min(1, 'Please select an item'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        category: '',
        item: '',
      },
    });

    const category = watch('category');

    const categoryOptions = [
      { value: 'fruits', label: 'Fruits' },
      { value: 'vegetables', label: 'Vegetables' },
      { value: 'meats', label: 'Meats' },
    ];

    const itemOptionsMap: Record<string, typeof countryOptions> = {
      fruits: [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },
      ],
      vegetables: [
        { value: 'carrot', label: 'Carrot' },
        { value: 'cabbage', label: 'Cabbage' },
        { value: 'broccoli', label: 'Broccoli' },
      ],
      meats: [
        { value: 'pork', label: 'Pork' },
        { value: 'beef', label: 'Beef' },
        { value: 'chicken', label: 'Chicken' },
      ],
    };

    const itemOptions = category ? itemOptionsMap[category] || [] : [];

    const onSubmit = (data: FormData) => {
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">Dependent Selects</Typography>

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Category"
                options={categoryOptions}
                placeholder="Please select a category first"
                {...field}
                error={errors.category}
                helperText="The item menu will update after selection"
              />
            )}
          />

          <Controller
            name="item"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Item"
                options={itemOptions}
                placeholder={
                  category
                    ? 'Please select an item'
                    : 'Please select a category first'
                }
                disabled={!category}
                {...field}
                error={errors.item}
                helperText={
                  category
                    ? 'Items displayed based on category'
                    : 'Please select a category first'
                }
              />
            )}
          />

          <Button type="submit" variant="contained" fullWidth>
            Submit
          </Button>
        </Stack>
      </form>
    );
  },
};
