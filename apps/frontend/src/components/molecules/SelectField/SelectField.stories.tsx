import type { Meta, StoryObj } from '@storybook/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SelectField } from './SelectField';
import { Button, Icon } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * SelectField 結合了 TextField Select 和錯誤處理。
 *
 * ## 特色
 * - 支援單選和多選
 * - 與 react-hook-form 完美整合
 * - 支援選項分組
 * - 支援選項加入圖示（Icon/Emoji）
 * - 支援搜尋篩選（使用 Autocomplete）
 * - 多選可顯示為 Chips
 * - 自動顯示驗證錯誤
 *
 * ## 使用場景
 * - 下拉選單
 * - 多選選單
 * - 分組選項選單
 * - 可搜尋的長列表選單
 * - 帶圖示的選項選單
 */
const meta = {
  title: 'Molecules/SelectField',
  component: SelectField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '結合 TextField Select 和錯誤處理的下拉選單組件，與 react-hook-form 完美整合。',
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

// 常用選項資料
const countryOptions = [
  { value: 'tw', label: '台灣' },
  { value: 'us', label: '美國' },
  { value: 'jp', label: '日本' },
  { value: 'kr', label: '韓國' },
  { value: 'cn', label: '中國' },
];

const cityOptions = [
  { group: '北部', value: 'taipei', label: '台北市' },
  { group: '北部', value: 'new-taipei', label: '新北市' },
  { group: '北部', value: 'taoyuan', label: '桃園市' },
  { group: '中部', value: 'taichung', label: '台中市' },
  { group: '中部', value: 'changhua', label: '彰化縣' },
  { group: '南部', value: 'tainan', label: '台南市' },
  { group: '南部', value: 'kaohsiung', label: '高雄市' },
  { group: '東部', value: 'hualien', label: '花蓮縣' },
  { group: '東部', value: 'taitung', label: '台東縣' },
];

const interestOptions = [
  { value: 'music', label: '音樂' },
  { value: 'sports', label: '運動' },
  { value: 'reading', label: '閱讀' },
  { value: 'travel', label: '旅遊' },
  { value: 'cooking', label: '烹飪' },
  { value: 'gaming', label: '電玩' },
  { value: 'art', label: '藝術' },
  { value: 'photography', label: '攝影' },
];

/**
 * 基本單選
 * 最簡單的下拉選單
 */
export const Default: Story = {
  args: {
    label: '國家',
    options: countryOptions,
    placeholder: '請選擇',
    helperText: '請選擇您的國家',
  },
};

/**
 * 帶預設值
 * 顯示已選取的值
 */
export const WithDefaultValue: Story = {
  args: {
    label: '國家',
    options: countryOptions,
    defaultValue: 'tw',
    helperText: '預設選擇台灣',
  },
};

/**
 * 帶錯誤訊息
 * 顯示驗證錯誤
 */
export const WithError: Story = {
  args: {
    label: '國家',
    options: countryOptions,
    placeholder: '請選擇',
    error: '此欄位為必填',
  },
};

/**
 * 帶 Placeholder
 * 提示使用者選擇
 */
export const WithPlaceholder: Story = {
  args: {
    label: '國家',
    options: countryOptions,
    placeholder: '請選擇一個國家',
    helperText: '必須選擇一個國家',
  },
};

/**
 * 禁用狀態
 * 不可選擇
 */
export const Disabled: Story = {
  args: {
    label: '國家',
    options: countryOptions,
    defaultValue: 'tw',
    disabled: true,
    helperText: '此欄位已被禁用',
  },
};

/**
 * 必填欄位
 * 顯示星號標記
 */
export const Required: Story = {
  args: {
    label: '國家',
    options: countryOptions,
    required: true,
    placeholder: '請選擇',
    helperText: '此欄位為必填',
  },
};

/**
 * 分組選項
 * 選項依照群組分類
 */
export const GroupedOptions: Story = {
  args: {
    label: '城市',
    options: cityOptions,
    placeholder: '請選擇城市',
    helperText: '選項依地區分組',
  },
};

/**
 * 部分選項禁用
 * 某些選項不可選擇
 */
export const WithDisabledOptions: Story = {
  args: {
    label: '國家',
    options: [
      { value: 'tw', label: '台灣' },
      { value: 'us', label: '美國' },
      { value: 'jp', label: '日本（暫停服務）', disabled: true },
      { value: 'kr', label: '韓國（暫停服務）', disabled: true },
      { value: 'cn', label: '中國' },
    ],
    placeholder: '請選擇',
    helperText: '部分國家暫停服務',
  },
};

/**
 * 多選選單
 * 可選擇多個選項
 */
export const Multiple: Story = {
  args: {
    label: '興趣愛好',
    options: interestOptions,
    multiple: true,
    placeholder: '請選擇興趣',
    defaultValue: ['music', 'sports'],
    helperText: '可以選擇多個興趣',
  },
};

/**
 * 多選 - 顯示 Chips
 * 以標籤形式顯示已選項目
 */
export const MultipleWithChips: Story = {
  args: {
    label: '興趣愛好',
    options: interestOptions,
    multiple: true,
    renderChips: true,
    placeholder: '請選擇興趣',
    defaultValue: ['music', 'sports', 'reading'],
    helperText: '選取的項目會顯示為標籤',
  },
};

/**
 * 多選 - 不顯示 Checkbox
 * 簡潔的多選樣式
 */
export const MultipleWithoutCheckbox: Story = {
  args: {
    label: '興趣愛好',
    options: interestOptions,
    multiple: true,
    showCheckbox: false,
    renderChips: true,
    placeholder: '請選擇興趣',
    defaultValue: ['music', 'sports'],
    helperText: '多選但不顯示 checkbox',
  },
};

/**
 * 多選 - 不顯示 Chips
 * 以文字列表顯示
 */
export const MultipleWithoutChips: Story = {
  args: {
    label: '興趣愛好',
    options: interestOptions,
    multiple: true,
    renderChips: false,
    placeholder: '請選擇興趣',
    defaultValue: ['music', 'sports', 'reading'],
    helperText: '選取的項目以文字列表顯示',
  },
};

/**
 * 完整表單範例
 * 使用 react-hook-form + Zod 驗證
 */
export const FormExample: Story = {
  render: function FormExampleComponent() {
    const schema = z.object({
      country: z.string().min(1, '請選擇國家'),
      city: z.string().min(1, '請選擇城市'),
      interests: z.array(z.string()).min(1, '請至少選擇一個興趣'),
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
      console.log('表單資料:', data);
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">個人資料表單</Typography>

          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <SelectField
                label="國家"
                options={countryOptions}
                placeholder="請選擇國家"
                {...field}
                error={errors.country}
                helperText="請選擇您的國家"
              />
            )}
          />

          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <SelectField
                label="城市"
                options={cityOptions}
                placeholder="請選擇城市"
                {...field}
                error={errors.city}
                helperText="選項會依地區分組"
              />
            )}
          />

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <SelectField
                label="興趣愛好"
                options={interestOptions}
                multiple
                renderChips
                {...field}
                error={errors.interests}
                helperText="可以選擇多個興趣"
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
 * 依賴選單範例
 * 第二個選單根據第一個選單的值變化
 */
export const DependentSelects: Story = {
  render: function DependentSelectsComponent() {
    const schema = z.object({
      category: z.string().min(1, '請選擇分類'),
      item: z.string().min(1, '請選擇項目'),
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
      { value: 'fruits', label: '水果' },
      { value: 'vegetables', label: '蔬菜' },
      { value: 'meats', label: '肉類' },
    ];

    const itemOptionsMap: Record<string, typeof countryOptions> = {
      fruits: [
        { value: 'apple', label: '蘋果' },
        { value: 'banana', label: '香蕉' },
        { value: 'orange', label: '橘子' },
      ],
      vegetables: [
        { value: 'carrot', label: '紅蘿蔔' },
        { value: 'cabbage', label: '高麗菜' },
        { value: 'broccoli', label: '青花菜' },
      ],
      meats: [
        { value: 'pork', label: '豬肉' },
        { value: 'beef', label: '牛肉' },
        { value: 'chicken', label: '雞肉' },
      ],
    };

    const itemOptions = category ? itemOptionsMap[category] || [] : [];

    const onSubmit = (data: FormData) => {
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">依賴選單</Typography>

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <SelectField
                label="分類"
                options={categoryOptions}
                placeholder="請先選擇分類"
                {...field}
                error={errors.category}
                helperText="選擇後會更新下方的項目選單"
              />
            )}
          />

          <Controller
            name="item"
            control={control}
            render={({ field }) => (
              <SelectField
                label="項目"
                options={itemOptions}
                placeholder={category ? '請選擇項目' : '請先選擇分類'}
                disabled={!category}
                {...field}
                error={errors.item}
                helperText={category ? '根據分類顯示項目' : '請先選擇分類'}
              />
            )}
          />

          <Button type="submit" variant="contained" fullWidth>
            提交
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 各種尺寸
 * 顯示不同大小的選單
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">各種尺寸</Typography>

      <SelectField
        label="國家（小）"
        options={countryOptions}
        size="small"
        placeholder="請選擇"
        defaultValue="tw"
        helperText="size='small'"
      />

      <SelectField
        label="國家（中）"
        options={countryOptions}
        size="medium"
        placeholder="請選擇"
        defaultValue="tw"
        helperText="size='medium'"
      />
    </Stack>
  ),
};

/**
 * 各種變體
 * 顯示不同樣式的選單
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h6">各種變體</Typography>

      <SelectField
        label="國家（Outlined）"
        options={countryOptions}
        variant="outlined"
        placeholder="請選擇"
        defaultValue="tw"
        helperText="variant='outlined'"
      />

      <SelectField
        label="國家（Filled）"
        options={countryOptions}
        variant="filled"
        placeholder="請選擇"
        defaultValue="tw"
        helperText="variant='filled'"
      />

      <SelectField
        label="國家（Standard）"
        options={countryOptions}
        variant="standard"
        placeholder="請選擇"
        defaultValue="tw"
        helperText="variant='standard'"
      />
    </Stack>
  ),
};

/**
 * 滿版寬度
 * 佔滿容器寬度
 */
export const FullWidth: Story = {
  args: {
    label: '國家',
    options: countryOptions,
    fullWidth: true,
    placeholder: '請選擇',
    defaultValue: 'tw',
    helperText: 'fullWidth={true}',
  },
};

/**
 * 數字值選項
 * 選項值為數字類型
 */
export const NumberValues: Story = {
  render: function NumberValuesComponent() {
    const schema = z.object({
      quantity: z.number().min(1, '請選擇數量'),
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
      { value: 1, label: '1 個' },
      { value: 2, label: '2 個' },
      { value: 5, label: '5 個' },
      { value: 10, label: '10 個' },
      { value: 20, label: '20 個' },
      { value: 50, label: '50 個' },
    ];

    const onSubmit = (data: FormData) => {
      alert(`選擇數量: ${data.quantity}`);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h6">數字值選項</Typography>

          <Controller
            name="quantity"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <SelectField
                label="數量"
                options={quantityOptions}
                placeholder="請選擇數量"
                value={value || ''}
                onChange={(e) => onChange(Number(e.target.value))}
                {...field}
                error={errors.quantity}
                helperText="選項值為數字類型"
              />
            )}
          />

          <Button type="submit" variant="contained" fullWidth>
            提交
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * 帶圖示的選項
 * 選項可以包含圖示
 */
export const WithIcons: Story = {
  args: {
    label: '交通工具',
    options: [
      { value: 'car', label: '汽車', icon: <Icon>🚗</Icon> },
      { value: 'bus', label: '公車', icon: <Icon>🚌</Icon> },
      { value: 'train', label: '火車', icon: <Icon>🚆</Icon> },
      { value: 'plane', label: '飛機', icon: <Icon>✈️</Icon> },
      { value: 'bike', label: '腳踏車', icon: <Icon>🚲</Icon> },
    ],
    placeholder: '請選擇交通工具',
    helperText: '選項帶有圖示',
  },
};

/**
 * 帶圖示的分組選項
 * 分組選項可以包含圖示
 */
export const GroupedWithIcons: Story = {
  args: {
    label: '食物',
    options: [
      { group: '水果', value: 'apple', label: '蘋果', icon: <Icon>🍎</Icon> },
      { group: '水果', value: 'banana', label: '香蕉', icon: <Icon>🍌</Icon> },
      { group: '水果', value: 'orange', label: '橘子', icon: <Icon>🍊</Icon> },
      {
        group: '蔬菜',
        value: 'carrot',
        label: '紅蘿蔔',
        icon: <Icon>🥕</Icon>,
      },
      {
        group: '蔬菜',
        value: 'broccoli',
        label: '青花菜',
        icon: <Icon>🥦</Icon>,
      },
      { group: '蔬菜', value: 'tomato', label: '番茄', icon: <Icon>🍅</Icon> },
      { group: '肉類', value: 'chicken', label: '雞肉', icon: <Icon>🍗</Icon> },
      { group: '肉類', value: 'beef', label: '牛肉', icon: <Icon>🥩</Icon> },
      { group: '肉類', value: 'pork', label: '豬肉', icon: <Icon>🥓</Icon> },
    ],
    placeholder: '請選擇食物',
    helperText: '分組選項帶有圖示',
  },
};

/**
 * 可搜尋選單
 * 啟用搜尋功能，可以輸入關鍵字篩選選項
 */
export const Searchable: Story = {
  args: {
    label: '國家',
    options: [
      { value: 'tw', label: '台灣 (Taiwan)' },
      { value: 'us', label: '美國 (United States)' },
      { value: 'jp', label: '日本 (Japan)' },
      { value: 'kr', label: '韓國 (Korea)' },
      { value: 'cn', label: '中國 (China)' },
      { value: 'uk', label: '英國 (United Kingdom)' },
      { value: 'fr', label: '法國 (France)' },
      { value: 'de', label: '德國 (Germany)' },
      { value: 'au', label: '澳洲 (Australia)' },
      { value: 'ca', label: '加拿大 (Canada)' },
    ],
    searchable: true,
    placeholder: '搜尋國家',
    helperText: '可以輸入關鍵字搜尋',
  },
};

/**
 * 可搜尋 + 圖示
 * 結合搜尋功能和圖示
 */
export const SearchableWithIcons: Story = {
  args: {
    label: '天氣',
    options: [
      { value: 'sunny', label: '晴天', icon: <Icon>☀️</Icon> },
      { value: 'cloudy', label: '多雲', icon: <Icon>☁️</Icon> },
      { value: 'rainy', label: '下雨', icon: <Icon>🌧️</Icon> },
      { value: 'snowy', label: '下雪', icon: <Icon>❄️</Icon> },
      { value: 'stormy', label: '暴風雨', icon: <Icon>⛈️</Icon> },
      { value: 'foggy', label: '起霧', icon: <Icon>🌫️</Icon> },
      { value: 'windy', label: '颳風', icon: <Icon>💨</Icon> },
    ],
    searchable: true,
    placeholder: '搜尋天氣',
    helperText: '可搜尋的選項帶有圖示',
  },
};

/**
 * 可搜尋 + 分組
 * 搜尋功能支援分組選項
 */
export const SearchableGrouped: Story = {
  args: {
    label: '城市',
    options: [
      { group: '北部', value: 'taipei', label: '台北市' },
      { group: '北部', value: 'new-taipei', label: '新北市' },
      { group: '北部', value: 'taoyuan', label: '桃園市' },
      { group: '北部', value: 'hsinchu', label: '新竹市' },
      { group: '中部', value: 'taichung', label: '台中市' },
      { group: '中部', value: 'changhua', label: '彰化縣' },
      { group: '中部', value: 'nantou', label: '南投縣' },
      { group: '南部', value: 'tainan', label: '台南市' },
      { group: '南部', value: 'kaohsiung', label: '高雄市' },
      { group: '南部', value: 'pingtung', label: '屏東縣' },
      { group: '東部', value: 'hualien', label: '花蓮縣' },
      { group: '東部', value: 'taitung', label: '台東縣' },
    ],
    searchable: true,
    placeholder: '搜尋城市',
    helperText: '可搜尋的分組選項',
  },
};

/**
 * 可搜尋多選
 * 搜尋功能支援多選
 */
export const SearchableMultiple: Story = {
  args: {
    label: '興趣愛好',
    options: [
      { value: 'music', label: '音樂', icon: <Icon>🎵</Icon> },
      { value: 'sports', label: '運動', icon: <Icon>⚽</Icon> },
      { value: 'reading', label: '閱讀', icon: <Icon>📚</Icon> },
      { value: 'travel', label: '旅遊', icon: <Icon>✈️</Icon> },
      { value: 'cooking', label: '烹飪', icon: <Icon>🍳</Icon> },
      { value: 'gaming', label: '電玩', icon: <Icon>🎮</Icon> },
      { value: 'art', label: '藝術', icon: <Icon>🎨</Icon> },
      { value: 'photography', label: '攝影', icon: <Icon>📷</Icon> },
      { value: 'dancing', label: '跳舞', icon: <Icon>💃</Icon> },
      { value: 'singing', label: '唱歌', icon: <Icon>🎤</Icon> },
    ],
    searchable: true,
    multiple: true,
    renderChips: true,
    defaultValue: ['music', 'sports'],
    placeholder: '搜尋興趣',
    helperText: '可搜尋的多選選項',
  },
};

/**
 * 完整功能展示
 * 可搜尋 + 分組 + 圖示 + 多選
 */
export const FullFeatures: Story = {
  args: {
    label: '選擇你喜歡的活動',
    options: [
      {
        group: '戶外活動',
        value: 'hiking',
        label: '登山健行',
        icon: <Icon>🥾</Icon>,
      },
      {
        group: '戶外活動',
        value: 'camping',
        label: '露營',
        icon: <Icon>⛺</Icon>,
      },
      {
        group: '戶外活動',
        value: 'cycling',
        label: '騎自行車',
        icon: <Icon>🚴</Icon>,
      },
      {
        group: '戶外活動',
        value: 'surfing',
        label: '衝浪',
        icon: <Icon>🏄</Icon>,
      },
      {
        group: '室內活動',
        value: 'reading',
        label: '閱讀',
        icon: <Icon>📖</Icon>,
      },
      {
        group: '室內活動',
        value: 'gaming',
        label: '電玩',
        icon: <Icon>🎮</Icon>,
      },
      {
        group: '室內活動',
        value: 'cooking',
        label: '烹飪',
        icon: <Icon>👨‍🍳</Icon>,
      },
      {
        group: '室內活動',
        value: 'painting',
        label: '繪畫',
        icon: <Icon>🖌️</Icon>,
      },
      {
        group: '運動',
        value: 'basketball',
        label: '籃球',
        icon: <Icon>🏀</Icon>,
      },
      { group: '運動', value: 'soccer', label: '足球', icon: <Icon>⚽</Icon> },
      {
        group: '運動',
        value: 'swimming',
        label: '游泳',
        icon: <Icon>🏊</Icon>,
      },
      { group: '運動', value: 'yoga', label: '瑜珈', icon: <Icon>🧘</Icon> },
    ],
    searchable: true,
    multiple: true,
    renderChips: true,
    showCheckbox: true,
    defaultValue: ['hiking', 'reading', 'basketball'],
    placeholder: '搜尋活動',
    helperText: '展示所有功能：可搜尋 + 分組 + 圖示 + 多選',
  },
};
