import { useState, forwardRef } from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Tabs 組件 - Atomic Design: Molecule
 *
 * 分頁標籤組件，用於在多個內容面板之間切換。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Tabs
 *   tabs={[
 *     { label: '標籤一', content: <div>內容一</div> },
 *     { label: '標籤二', content: <div>內容二</div> },
 *   ]}
 * />
 *
 * // 受控組件
 * <Tabs
 *   value={activeTab}
 *   onChange={setActiveTab}
 *   tabs={[
 *     { label: '個人資料', content: <ProfileForm /> },
 *     { label: '安全設定', content: <SecurityForm /> },
 *   ]}
 * />
 *
 * // 帶圖示
 * <Tabs
 *   tabs={[
 *     { label: '首頁', icon: <HomeIcon />, content: <Home /> },
 *     { label: '設定', icon: <SettingsIcon />, content: <Settings /> },
 *   ]}
 * />
 * ```
 */

export interface TabItem {
  /**
   * 標籤文字
   */
  label: string;

  /**
   * 標籤圖示（僅支援 ReactElement，不支援 null 或 string）
   */
  icon?: React.ReactElement;

  /**
   * 標籤內容
   */
  content: React.ReactNode;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 圖示位置
   */
  iconPosition?: 'start' | 'end' | 'top' | 'bottom';
}

export interface TabsProps {
  /**
   * 標籤列表
   */
  tabs: TabItem[];

  /**
   * 當前啟用的標籤索引
   */
  value?: number;

  /**
   * 預設啟用的標籤索引
   */
  defaultValue?: number;

  /**
   * 標籤變更時的回調
   */
  onChange?: (value: number) => void;

  /**
   * 標籤方向
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * 標籤變體
   */
  variant?: 'standard' | 'scrollable' | 'fullWidth';

  /**
   * 指示器顏色
   */
  indicatorColor?: 'primary' | 'secondary';

  /**
   * 文字顏色
   */
  textColor?: 'primary' | 'secondary' | 'inherit';

  /**
   * 是否置中
   */
  centered?: boolean;

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Tabs 組件
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    tabs,
    value: controlledValue,
    defaultValue = 0,
    onChange,
    orientation = 'horizontal',
    variant = 'standard',
    indicatorColor = 'primary',
    textColor = 'primary',
    centered = false,
    sx,
    ...props
  },
  ref,
) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        display: orientation === 'vertical' ? 'flex' : 'block',
        ...sx,
      }}
      {...props}
    >
      <MuiTabs
        value={value}
        onChange={handleChange}
        orientation={orientation}
        variant={variant}
        indicatorColor={indicatorColor}
        textColor={textColor}
        centered={centered}
        sx={
          orientation === 'vertical'
            ? { borderRight: 1, borderColor: 'divider' }
            : {}
        }
      >
        {tabs.map((tab, index) => (
          <MuiTab
            key={index}
            label={tab.label}
            icon={tab.icon || undefined}
            iconPosition={tab.iconPosition}
            disabled={tab.disabled}
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
          />
        ))}
      </MuiTabs>
      <Box sx={{ flexGrow: orientation === 'vertical' ? 1 : 0 }}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            {tab.content}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
});

export default Tabs;
