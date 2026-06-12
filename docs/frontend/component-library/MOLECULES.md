# 組件庫 — Molecules（分子組件）

> 本文件是 [組件庫總覽](../COMPONENT_LIBRARY.md) 的一部分，專注於 Atomic Design 的第二層 — Molecules（分子組件）。

## 本文件涵蓋

由多個 Atoms 組合而成的功能性 UI 單元，例如表單欄位（Label + Input + Helper Text）、導航項、通知卡片等。

---

## 目錄

- [本文件涵蓋](#本文件涵蓋)
  - [Molecules（分子組件）](#molecules分子組件)
  - [Toast 通知配置](#toast-通知配置)

### Molecules（分子組件）

由 2-3 個原子組件組合而成，具有簡單的業務邏輯。

#### Accordion

**路徑**: `components/molecules/Accordion/`

**功能**:

- 可折疊面板組件
- 內容展開/收合
- 支援多個面板組合

**Storybook**: ✅ `Accordion.stories.tsx`

---

#### AlertMessage

**路徑**: `components/molecules/AlertMessage/`

**功能**:

- 警告/提示訊息
- 成功/錯誤狀態

**Props**:

```typescript
interface AlertMessageProps {
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}
```

**Storybook**: ✅ `AlertMessage.stories.tsx`

---

#### Card

**路徑**: `components/molecules/Card/`

**功能**:

- 通用卡片容器組件
- 內容分組和展示（title、subheader、image、content、actions）
- 支援點擊整卡（`clickable`）或多顆 action button

**使用時機**：文章卡、產品卡、通知卡，任何「結構化內容」的呈現。

**Storybook**: ✅ `Card.stories.tsx`

---

#### CheckboxGroup

**路徑**: `components/molecules/CheckboxGroup/`

**功能**:

- 複選框群組
- React Hook Form 整合

**Storybook**: ✅ `CheckboxGroup.stories.tsx`

---

#### DataList

**路徑**: `components/molecules/DataList/`

**功能**:

- 功能完整的數據列表組件
- 列表樣式呈現
- 支援排序、篩選、高亮、展開/收合
- 支援多選、分頁、Badge 顯示

**Storybook**: ✅ `DataList.stories.tsx`

---

#### DataTable

**路徑**: `components/molecules/DataTable/`

**功能**:

- 功能完整的數據表格組件
- 支援排序、篩選、高亮、展開/收合
- 支援多選、分頁

**Storybook**: ✅ `DataTable.stories.tsx`

---

#### DetailRow

**路徑**: `components/molecules/DetailRow/`

**功能**:

- 統一的詳情資訊顯示組件
- 支援三種佈局模式：horizontal（水平）、vertical（垂直）、auto（自動）
- 可選的複製功能
- 自動根據內容長度選擇最佳佈局

**Props**:

```typescript
interface DetailRowProps {
  icon?: React.ReactNode; // 圖示（可選）
  label: string; // 標籤文字
  value: React.ReactNode; // 值內容（字串或 ReactNode）
  copyable?: boolean; // 是否可複製（僅當 value 是字串時生效）
  fieldName?: string; // 複製的欄位名稱（用於追蹤狀態）
  layout?: 'horizontal' | 'vertical' | 'auto'; // 佈局模式（預設 'auto'）
  autoThreshold?: number; // 自動模式的判斷閾值（字元數，預設 30）
  sx?: SxProps<Theme>; // 自訂樣式
}
```

**使用範例**:

```tsx
// 水平佈局（適合短文字）
<DetailRow
  icon={<PersonIcon fontSize="small" />}
  label="User ID"
  value="123456"
  copyable
  layout="horizontal"
/>

// 垂直佈局（適合長文字）
<DetailRow
  label="Description"
  value="This is a very long description that needs vertical layout for better readability..."
  layout="vertical"
/>

// 自動模式（根據內容長度自動選擇）
<DetailRow
  label="Email"
  value="user@example.com"
  layout="auto"
  autoThreshold={30}
/>

// 帶圖示和複製功能
<DetailRow
  icon={<EmailIcon fontSize="small" />}
  label="Email Address"
  value="john.doe@example.com"
  copyable
  fieldName="email"
  layout="horizontal"
/>

// ReactNode 值（自訂渲染）
<DetailRow
  label="Status"
  value={
    <Chip label="Active" color="success" size="small" />
  }
  layout="horizontal"
/>

// 完整功能範例
<DetailRow
  icon={<FingerprintIcon fontSize="small" />}
  label="Session ID"
  value={
    <Typography variant="body2" fontFamily="monospace">
      {session.id}
    </Typography>
  }
  copyable
  fieldName="sessionId"
  layout="auto"
  autoThreshold={40}
/>
```

**組成**:

- Box (MUI) - 容器佈局
- Typography (MUI) - 標籤和值顯示
- IconButton (Atom) - 複製按鈕
- Tooltip (MUI) - 複製提示
- ContentCopy / Check Icons - 複製狀態圖示
- Clipboard API - 複製功能

**佈局模式**:

1. **horizontal（水平佈局）**:
   - 圖示 - 標籤 - 值 橫向排列
   - 標籤固定寬度（100px）
   - 值區域自動填充
   - 適合短文字（ID、日期、狀態等）

2. **vertical（垂直佈局）**:
   - 標籤在上，值在下
   - 圖示與標籤同行
   - 值區域左縮排（如有圖示）
   - 適合長文字（描述、地址、詳細資訊）

3. **auto（自動模式）**:
   - 根據內容長度自動選擇
   - 預設閾值 30 字元
   - 超過閾值使用垂直佈局
   - 未超過使用水平佈局

**特性**:

- 三種靈活的佈局模式
- 智能自動佈局選擇
- 一鍵複製功能（帶視覺反饋）
- 統一的樣式和間距
- 可選圖示支援
- 支援 ReactNode 自訂渲染
- 複製成功提示（2 秒自動消失）
- 國際化支援（複製/已複製文字）

**複製功能細節**:

```typescript
// 複製邏輯
const handleCopy = async () => {
  await navigator.clipboard.writeText(value);
  setCopiedField(fieldName || 'default');
  setTimeout(() => setCopiedField(null), 2000);
};

// 複製按鈕狀態
<IconButton
  onClick={handleCopy}
  sx={{
    color: isCopied ? 'success.main' : 'text.secondary',
    '&:hover': {
      bgcolor: isCopied ? 'success.light' : 'action.hover',
    },
  }}
>
  {isCopied ? <Check /> : <ContentCopy />}
</IconButton>
```

**使用場景**:

- 詳情模態框（AuditLogDetailsModal、SessionDetailsModal）
- 用戶資料展示
- 訂單詳情
- 系統資訊顯示
- 任何需要統一樣式的鍵值對顯示

**Storybook**: ✅ `DetailRow.stories.tsx`

---

#### ErrorDisplay

**路徑**: `components/molecules/ErrorDisplay/`

**功能**:

- 錯誤訊息展示組件
- 統一的錯誤處理顯示

**Storybook**: ✅ `ErrorDisplay.stories.tsx`

---

#### FormField

**路徑**: `components/molecules/FormField/`

**功能**:

- TextField + React Hook Form 整合
- 自動錯誤顯示
- 表單驗證

**Props**:

```typescript
interface FormFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  type?: 'text' | 'email' | 'password';
  rules?: RegisterOptions;
}
```

**使用範例**:

```tsx
<FormField
  name="email"
  label="Email"
  control={control}
  type="email"
  rules={{ required: 'Email 為必填欄位' }}
/>
```

**Storybook**: ✅ `FormField.stories.tsx`

---

#### InfiniteNotificationList

**路徑**: `components/molecules/InfiniteNotificationList/`

**功能**:

- 無限滾動通知列表組件
- 使用 Intersection Observer API 自動載入更多通知
- 整合 NotificationList 組件

**Props**:

```typescript
interface InfiniteNotificationListProps {
  notifications: UnifiedNotification[]; // 通知列表
  loading: boolean; // 是否正在載入
  hasMore: boolean; // 是否還有更多通知
  onLoadMore: () => void; // 載入更多回調
  onMarkAsRead?: (id: string) => void; // 標記已讀回調
  onNotificationClick?: (id: string) => void; // 通知點擊回調
  onNotificationDelete?: (id: string) => void; // 通知刪除回調
  onMarkAllAsRead?: () => void; // 標記全部已讀回調
  onClearRead?: () => void; // 清除已讀通知回調
}
```

**使用範例**:

```tsx
// 基本用法
<InfiniteNotificationList
  notifications={notifications}
  loading={loading}
  hasMore={hasMore}
  onLoadMore={loadMore}
  onMarkAsRead={markAsRead}
  onNotificationClick={handleClick}
/>;

// 完整功能
const {
  notifications,
  loading,
  hasMore,
  loadMore,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  clearRead,
} = useInfiniteNotifications();

<InfiniteNotificationList
  notifications={notifications}
  loading={loading}
  hasMore={hasMore}
  onLoadMore={loadMore}
  onMarkAsRead={markAsRead}
  onNotificationClick={(id) => router.push(`/notifications/${id}`)}
  onNotificationDelete={deleteNotification}
  onMarkAllAsRead={markAllAsRead}
  onClearRead={clearRead}
/>;
```

**組成**:

- NotificationList (Molecule) - 核心列表組件
- Intersection Observer - 自動檢測滾動到底部
- CircularProgress (Atom) - 載入指示器
- Typography (MUI) - 結束提示訊息

**特性**:

- 無限滾動自動載入
- Intersection Observer API（性能優化）
- 提前 100px 開始載入（rootMargin）
- 智能載入控制（避免重複請求）
- 結束提示訊息
- 完整的 CRUD 操作支援

**技術細節**:

```typescript
// Intersection Observer 配置
const observer = new IntersectionObserver(handleIntersection, {
  threshold: 0.1, // 10% 可見時觸發
  rootMargin: '100px', // 提前 100px 載入
});

// 自動載入邏輯
if (target.isIntersecting && hasMore && !loading) {
  onLoadMore(); // 觸發載入更多
}
```

**使用場景**:

- 通知中心長列表
- 任何需要無限滾動的通知場景
- 提升大量通知的載入性能

**Storybook**: ✅ `InfiniteNotificationList.stories.tsx`

---

#### KPICard

**路徑**: `components/molecules/KPICard/`

**功能**:

- Dashboard 專用的指標卡片
- 展示**單一關鍵數值** + icon + 副標 + 提示（hint）
- 內建 loading skeleton
- 支援 `href` / `onClick` 導航
- 可透過 `accentColor` 切換強調色（primary / secondary / success / warning / error）
- 自動撐滿 Grid 高度，同列多卡對齊

**使用時機**：Dashboard 首頁、統計面板、系統健康度等「以數字為中心」的卡片。

**與 Card 的差異**：

| 面向       | Card                            | KPICard                      |
| ---------- | ------------------------------- | ---------------------------- |
| 資訊結構   | title + content + actions       | **value**（大字）+ icon 方框 |
| 主要 props | `title`、`content`、`actions[]` | `value`、`subtitle`、`hint`  |
| 典型使用   | 文章卡、通知卡                  | KPI、統計指標                |

底層仍使用 MUI `<Card>` 作為容器，視覺基調（elevation / border / radius）一致。

**Storybook**: ✅ `KPICard.stories.tsx`（9 個 story，含角色視角範例）

---

#### LanguageSwitcher

**路徑**: `components/molecules/LanguageSwitcher/`

**功能**:

- 語言切換組件
- 支援多語系切換
- 無縫路由切換

**組成**:

- IconButton (Atom) - 觸發按鈕
- Menu (MUI Component) - 下拉選單容器
- MenuItem (MUI Component) - 語言選項
- 路由切換邏輯
- i18n 整合

**特性**:

- 顯示當前語言旗幟和名稱
- 支援圖示模式或文字標籤模式
- 使用 Next.js router 進行語言切換
- useTransition 實現流暢的切換體驗
- 選中狀態標記

**Props**:

```typescript
interface LanguageSwitcherProps {
  /**
   * 顯示語言名稱而非圖示 (預設: false)
   */
  showLabel?: boolean;
  /**
   * 圖示按鈕大小
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 按鈕顏色
   */
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  /**
   * MUI sx 樣式屬性
   */
  sx?: SxProps<Theme>;
}
```

**支援語言**:

- English (en)- Traditional Chinese (zh-TW)
  **使用場景**:

- 應用程式頂部導航列
- 用戶偏好設定
- 全域語言切換

**整合**:

- next-intl 國際化
- Next.js App Router
- 自訂 i18n routing

**Storybook**: ✅ `LanguageSwitcher.stories.tsx`

---

#### NotificationFilters

**路徑**: `components/molecules/NotificationFilters/`

**功能**:

- 通知篩選器組件
- 提供搜尋和多維度篩選功能
- 支援 debounce 搜尋優化

**Props**:

```typescript
interface NotificationFiltersProps {
  searchQuery: string; // 搜尋關鍵字
  onSearchChange: (query: string) => void; // 搜尋變更回調
  selectedType: NotificationTypeFilter; // 選中的類型
  onTypeChange: (type: NotificationTypeFilter) => void; // 類型變更回調
  readStatus: ReadStatusFilter; // 已讀狀態
  onReadStatusChange: (status: ReadStatusFilter) => void; // 已讀狀態變更回調
}

type NotificationTypeFilter = 'all' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
type ReadStatusFilter = 'all' | 'read' | 'unread';
```

**使用範例**:

```tsx
// 基本用法
<NotificationFilters
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  selectedType={selectedType}
  onTypeChange={setSelectedType}
  readStatus={readStatus}
  onReadStatusChange={setReadStatus}
/>;

// 完整用法（整合狀態管理）
const [searchQuery, setSearchQuery] = useState('');
const [selectedType, setSelectedType] = useState<NotificationTypeFilter>('all');
const [readStatus, setReadStatus] = useState<ReadStatusFilter>('all');

<NotificationFilters
  searchQuery={searchQuery}
  onSearchChange={(query) => {
    setSearchQuery(query);
    // Trigger API refetch with new filters
    refetch();
  }}
  selectedType={selectedType}
  onTypeChange={(type) => {
    setSelectedType(type);
    refetch();
  }}
  readStatus={readStatus}
  onReadStatusChange={(status) => {
    setReadStatus(status);
    refetch();
  }}
/>;
```

**組成**:

- TextField (Atom) - 搜尋輸入框，帶搜尋圖示
- Select (MUI Component) - 類型篩選下拉選單
- Chip (Atom) - 已讀狀態篩選（all/unread/read）
- useDebounce Hook - 搜尋防抖優化（500ms）

**特性**:

- 搜尋框支援 debounce（避免頻繁 API 請求）
- 類型下拉選單（全部/資訊/成功/警告/錯誤）
- ✅ 已讀狀態 Chips（全部/未讀/已讀）
- 響應式設計（手機版垂直排列，桌面版水平排列）
- 完整國際化支援

**使用場景**:

- 通知中心頁面
- 通知列表頁面
- 任何需要篩選通知的場景

**Storybook**: ✅ `NotificationFilters.stories.tsx`

---

#### NotificationList

**路徑**: `components/molecules/NotificationList/`

**功能**:

- 全頁面通知列表組件
- 包含 Paper 容器 (可選)
- 支援 Tabs 篩選
- 支援操作按鈕(標記全部已讀、清除全部)

**特性**:

- showContainer: 顯示 Paper 容器
- showHeader: 顯示標題和操作按鈕
- showFilterTabs: 顯示篩選 Tabs
- 使用 NotificationItem atoms

**使用場景**: /notifications 全頁面通知中心

**Storybook**: ✅ `NotificationList.stories.tsx`

---

#### NotificationMenuList

**路徑**: `components/molecules/NotificationMenuList/`

**功能**:

- Menu 下拉通知列表組件
- MenuItem-based 設計
- 簡化顯示,無額外容器
- 直接使用 MenuItem,不使用 NotificationItem

**使用場景**: AppBar 下拉選單

**用戶**: NotificationMenu

**Storybook**: ✅ `NotificationMenuList.stories.tsx`

---

#### PageHeader

**路徑**: `components/molecules/PageHeader/`

**功能**:

- 統一的頁面標題區域組件
- 提供一致的頁面頭部佈局
- 支援返回導航、麵包屑、標題和操作按鈕

**Props**:

```typescript
interface PageHeaderProps {
  title: string; // 頁面標題
  description?: string; // 頁面描述
  icon?: React.ReactNode; // 頁面圖示（emoji 或 React 元素）
  showBackButton?: boolean; // 是否顯示返回按鈕（預設 false）
  onBack?: () => void; // 返回按鈕點擊處理
  backAriaLabel?: string; // 返回按鈕 aria-label（預設 'Back'）
  breadcrumbs?: BreadcrumbItem[]; // 麵包屑導航
  actions?: React.ReactNode; // 右側操作按鈕區域
  elevated?: boolean; // 是否使用卡片樣式（預設 true）
  sx?: SxProps<Theme>; // 自訂樣式
}

interface BreadcrumbItem {
  label: string; // 麵包屑文字
  href?: string; // 連結地址
  onClick?: () => void; // 點擊處理
}
```

**使用範例**:

```tsx
// 基本用法
<PageHeader title="用戶管理" description="管理系統用戶和權限" />

// 帶返回按鈕
<PageHeader
  title="編輯用戶"
  showBackButton
  onBack={() => router.back()}
/>

// 完整功能
<PageHeader
  title="系統設定"
  description="配置系統參數和選項"
  icon="⚙️"
  showBackButton
  onBack={() => router.push('/dashboard')}
  breadcrumbs={[
    { label: '首頁', href: '/dashboard' },
    { label: '設定', href: '/settings' },
    { label: '系統設定' },
  ]}
  actions={
    <Button variant="contained" startIcon={<SaveIcon />}>
      儲存
    </Button>
  }
/>

// 無卡片樣式（平面設計）
<PageHeader
  title="通知中心"
  elevated={false}
  actions={<IconButton><FilterIcon /></IconButton>}
/>
```

**特性**:

- 響應式設計（標題和字體大小自動調整）
- 可選的返回按鈕
- 麵包屑導航支援
- 支援 emoji 或 React 元素作為圖示
- 可選的描述文字
- 右側操作按鈕區域
- 兩種樣式（elevated 卡片 / flat 平面）
- 完整的無障礙支援

**使用場景**:

- 所有需要標題區域的頁面
- 管理後台頁面
- 詳情頁面
- 設定頁面

**Storybook**: ✅ `PageHeader.stories.tsx`

---

#### Pagination

**路徑**: `components/molecules/Pagination/`

**功能**:

- 分頁組件
- 頁面導航控制

**Storybook**: ✅ `Pagination.stories.tsx`

---

#### PasswordField

**路徑**: `components/molecules/PasswordField/`

**功能**:

- 密碼輸入欄位
- 可見性切換按鈕
- React Hook Form 整合

**特性**:

- 顯示/隱藏密碼
- ✅ 表單驗證支援
- 自動完成處理

**Storybook**: ✅ `PasswordField.stories.tsx`

---

#### RadioGroup

**路徑**: `components/molecules/RadioGroup/`

**功能**:

- 單選按鈕群組
- React Hook Form 整合

**Storybook**: ✅ `RadioGroup.stories.tsx`

---

#### SelectField

**路徑**: `components/molecules/SelectField/`

**功能**:

- 下拉選單組件
- 支援單選和多選
- 支援選項分組
- 支援選項圖示
- 支援搜尋模式（切換為 Autocomplete）
- React Hook Form 整合

**Props**:

```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string; // 選項分組
  icon?: React.ReactNode; // 選項圖示
}

interface SelectFieldProps {
  options: SelectOption[];
  error?: FieldError | string;
  helperText?: string;
  multiple?: boolean; // 多選
  renderChips?: boolean; // 多選時顯示為 Chips
  showCheckbox?: boolean; // 多選時顯示 checkbox
  placeholder?: string;
  searchable?: boolean; // 啟用搜尋功能
  noOptionsText?: string;
}
```

**使用範例**:

```tsx
// 基本單選
<SelectField
  label="國家"
  options={[
    { value: 'tw', label: '台灣' },
    { value: 'us', label: '美國' },
  ]}
  {...register('country')}
  error={errors.country}
/>

// 多選
<SelectField
  label="興趣"
  multiple
  options={interestOptions}
  {...register('interests')}
/>

// 分組選項
<SelectField
  label="城市"
  options={[
    { group: '北部', value: 'taipei', label: '台北' },
    { group: '北部', value: 'taoyuan', label: '桃園' },
    { group: '南部', value: 'kaohsiung', label: '高雄' },
  ]}
/>

// 帶圖示的選項
<SelectField
  label="天氣"
  options={[
    { value: 'sunny', label: '晴天', icon: <Icon>☀️</Icon> },
    { value: 'rainy', label: '下雨', icon: <Icon>🌧️</Icon> },
  ]}
/>

// 可搜尋選單
<SelectField
  label="國家"
  searchable
  options={countryOptions}
  placeholder="搜尋國家"
/>

// 完整功能（搜尋 + 分組 + 圖示 + 多選）
<SelectField
  label="活動"
  searchable
  multiple
  options={[
    { group: '戶外', value: 'hiking', label: '登山', icon: <Icon>🥾</Icon> },
    { group: '室內', value: 'reading', label: '閱讀', icon: <Icon>📖</Icon> },
  ]}
/>
```

**Storybook**: ✅ `SelectField.stories.tsx`

---

#### SettingsMenuList

**路徑**: `components/molecules/SettingsMenuList/`

**功能**:

- 設定選單項目列表組件
- 渲染多個設定 MenuItem
- 支援圖示和連結

**用戶**: SettingsMenu

**Storybook**: ✅ `SettingsMenuList.stories.tsx`

---

#### SnackbarWithProgress

**路徑**: `components/molecules/SnackbarWithProgress/`

**功能**:

- 帶倒數進度條的通知組件
- 自動關閉計時器
- 視覺化倒數顯示

**組成**:

- Alert (Atom) - 通知容器
- LinearProgress (Atom) - 進度條
- 倒數計時邏輯

**特性**:

- 支援所有 MUI Alert 嚴重程度 (success/error/warning/info)
- 視覺化倒數進度條
- 可手動關閉
- 自動關閉後清理

**Props**:

```typescript
interface SnackbarWithProgressProps extends CustomContentProps {
  id: SnackbarKey;
  message: string | React.ReactNode;
  variant?: 'default' | 'error' | 'success' | 'warning';
  autoHideDuration?: number; // 自動關閉時間(毫秒)
}
```

**使用場景**:

- 需要視覺化倒數的通知
- 臨時性提示訊息
- 操作成功/失敗反饋

**整合**:

- 與 notistack 整合
- 作為自訂 SnackbarProvider 內容組件

**Storybook**: ✅ `SnackbarWithProgress.stories.tsx`

---

### Toast 通知配置

**配置文件**: `src/config/snackbar.config.ts`

Toast 通知使用 `notistack` 庫實現，並通過獨立配置文件集中管理樣式和行為。

#### 配置選項

```typescript
export const snackbarConfig: SnackbarConfig = {
  // 通知位置：下方中央（視窗固定位置）
  // 可選值：top-left, top-center, top-right
  //         bottom-left, bottom-center, bottom-right
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },

  // 自動隱藏時間：1.5 秒
  // 建議範圍：1000-5000ms
  autoHideDuration: 1500,

  // 最大同時顯示數量：3 個
  // 建議範圍：1-5
  maxSnack: 3,
};
```

#### 自定義 Toast 位置

**方法 1：修改配置文件** (推薦)

編輯 `src/config/snackbar.config.ts`：

```typescript
// 使用預定義位置
import { snackbarPositions } from '@/config/snackbar.config';

export const snackbarConfig: SnackbarConfig = {
  anchorOrigin: snackbarPositions.topRight, // 右上角
  // ... 其他配置
};
```

**可用的預定義位置**：

- `topRight` - 右上角
- `topCenter` - 上方中央
- `topLeft` - 左上角
- `bottomRight` - 右下角
- `bottomCenter` - 下方中央（預設）
- `bottomLeft` - 左下角

**方法 2：修改 globals.css**

如需更精確的位置控制，可在 `src/app/globals.css` 中調整：

```css
/* Toast 通知位置覆蓋 */
[class*='notistack-SnackbarContainer'] {
  bottom: 32px !important; /* 調整距離底部的距離 */
}
```

#### 整合到應用程式

Toast 已在 `src/app/[locale]/providers.tsx` 中全域配置：

```typescript
<SnackbarProvider
  maxSnack={snackbarConfig.maxSnack}
  anchorOrigin={snackbarConfig.anchorOrigin}
  autoHideDuration={snackbarConfig.autoHideDuration}
  Components={{
    success: SnackbarWithProgress,
    error: SnackbarWithProgress,
    warning: SnackbarWithProgress,
    info: SnackbarWithProgress,
    default: SnackbarWithProgress,
  }}
>
  {children}
</SnackbarProvider>
```

#### CSS 位置修正

為確保 Toast 固定在**視窗下方**（而非頁面內容下方），`globals.css` 中包含強制定位規則：

```css
/* Snackbar (Toast) 通知位置修正 */
[class*='notistack-SnackbarContainer'] {
  position: fixed !important;
  z-index: 9999 !important;
  top: auto !important;
  bottom: 24px !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
}
```

這確保 Toast 通知始終顯示在視窗下方中央，不隨頁面滾動。

#### 使用範例

```typescript
import { useSnackbar } from 'notistack';

function MyComponent() {
  const { enqueueSnackbar } = useSnackbar();

  const handleSuccess = () => {
    enqueueSnackbar('操作成功', { variant: 'success' });
  };

  const handleError = () => {
    enqueueSnackbar('操作失敗', { variant: 'error' });
  };

  return (
    <>
      <button onClick={handleSuccess}>成功通知</button>
      <button onClick={handleError}>錯誤通知</button>
    </>
  );
}
```

---

#### Stepper

**路徑**: `components/molecules/Stepper/`

**功能**:

- 步驟指示器
- 多步驟流程導航

**Storybook**: ✅ `Stepper.stories.tsx`

---

#### Tabs

**路徑**: `components/molecules/Tabs/`

**功能**:

- 頁籤切換組件
- 內容區域管理

**Storybook**: ✅ `Tabs.stories.tsx`

---

#### ThemeSelector

**路徑**: `components/molecules/ThemeSelector/`

**功能**:

- 主題選擇器組件
- 支援 light/dark/system 三種模式
- 視覺化主題選擇介面

**用戶**: SettingsMenu

**Storybook**: ✅ `ThemeSelector.stories.tsx`

---

#### UserMenuHeader

**路徑**: `components/molecules/UserMenuHeader/`

**功能**:

- 用戶選單頭部組件
- 顯示用戶資訊(頭像、名稱、郵箱、角色)
- 支援狀態指示器

**用戶**: UserMenu

**Storybook**: ✅ `UserMenuHeader.stories.tsx`

---

#### UserMenuList

**路徑**: `components/molecules/UserMenuList/`

**功能**:

- 用戶選單項目列表組件
- 渲染多個 MenuItem
- 支援分隔線和危險操作樣式

**用戶**: UserMenu

**Storybook**: ✅ `UserMenuList.stories.tsx`

---

#### AboutContent

**路徑**: `components/molecules/AboutContent/`

**功能**:

- 展示應用程式版本、專案簡介、主要功能清單，支援英文與正體中文雙語切換
- 根據用戶角色（HQ/Admin 權限）動態顯示技術堆疊、授權資訊等內容
- 包含聯絡資訊與項目作者相關連結，完整呈現系統商務與技術概述

**Storybook**: ✅ `AboutContent.stories.tsx`

---

#### ActivityDiffModal

**路徑**: `components/molecules/ActivityDiffModal/`

**功能**:

- 以左右兩欄對比顯示欄位變更前後的內容（Diff Modal），支援純文字與 Markdown（等寬字體）兩種模式
- 頂部顯示欄位標籤、操作人名稱與變更時間戳，提供完整變更上下文
- 基於 `Modal` Organism 建構，享受全系統統一的 Modal 外觀與行為

**Storybook**: ✅ `ActivityDiffModal.stories.tsx`

---

#### ActivityLogItem

**路徑**: `components/molecules/ActivityLogItem/`

**功能**:

- 垂直時間軸樣式的活動紀錄項目，左側為顏色編碼的 Icon Dot 與連接線，右側為時間軸卡片
- 自動計算相對時間（「5 分鐘前」）與絕對時間（「2025/01/15 14:30」），支援自訂時區格式
- 支援點擊事件（用於開啟 Diff Modal），並通過 `isFirst`、`isLast` 控制時間軸線段顯示

**Storybook**: ✅ `ActivityLogItem.stories.tsx`

---

#### FileUploader

**路徑**: `components/molecules/FileUploader/`

**功能**:

- 拖放上傳區域，支援最大檔案數、最大檔案大小、檔案類型篩選，錯誤訊息動態顯示
- 自動檢測相同檔名並替換舊檔案，防止重複，並顯示警告訊息
- 已上傳檔案列表，每項可刪除，並顯示上傳狀態 Chip（已上傳/待上傳）
- 檔案大小自動格式化（Bytes/KB/MB/GB），支援完整的表單整合與國際化

---

#### HelpContent

**路徑**: `components/molecules/HelpContent/`

**功能**:

- 快速開始步驟引導、常見問題 FAQ 手風琴展開、常用功能列表，支援英文與正體中文雙語
- 根據用戶權限動態顯示相應的幫助內容（如審計日誌、會話管理等 HQ/Admin 功能）
- 聯絡資訊區段，包含項目作者與電子郵件連結，提供完整的用戶自助文檔

**Storybook**: ✅ `HelpContent.stories.tsx`

---

#### ScrollControl

**路徑**: `components/molecules/ScrollControl/`

**功能**:

- 組合多個 `ScrollButton` 提供完整的滾動控制組件，支援向上/向下/捲至頂/捲至底四項功能
- 支援九種預設位置與自訂位置，通過固定定位浮動在視口邊緣
- 自動偵測滾動位置，隱藏不可用按鈕（到頂時隱藏向上按鈕）
- 支援自訂滾動容器、滾動偏移量、可見性閾值、滾動行為（平滑/即時）

---

#### StatusTransitionMenu

**路徑**: `components/molecules/StatusTransitionMenu/`

**功能**:

- 下拉選單展示當前狀態與可用狀態轉換選項，每項狀態配有對應的顏色 Chip
- 選擇目標狀態後彈出確認對話框，允許用戶輸入選填的轉換備註／反饋
- 對話框顯示狀態轉換的前後對比（Chip 視覺），清晰呈現變更意圖
- 支援異步 onTransition 回調，自動處理提交中狀態，允許自訂標籤文字

---

**相關文件**：[組件庫總覽](../COMPONENT_LIBRARY.md) | [Atoms](./ATOMS.md) | [Organisms](./ORGANISMS.md) | [Templates](./TEMPLATES.md)
