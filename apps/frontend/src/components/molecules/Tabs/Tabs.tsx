import { useState, forwardRef } from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Tabs Component - Atomic Design: Molecule
 *
 * Tab component，for switching between multiple content panels。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Tabs
 *   tabs={[
 *     { label: 'Tab 1', content: <div>Content 1</div> },
 *     { label: 'Tab 2', content: <div>Content 2</div> },
 *   ]}
 * />
 *
 * // Controlled component
 * <Tabs
 *   value={activeTab}
 *   onChange={setActiveTab}
 *   tabs={[
 *     { label: 'Profile', content: <ProfileForm /> },
 *     { label: 'Security settings', content: <SecurityForm /> },
 *   ]}
 * />
 *
 * // With icon
 * <Tabs
 *   tabs={[
 *     { label: 'Home', icon: <Homeicon />, content: <Home /> },
 *     { label: 'Settings', icon: <Settingsicon />, content: <Settings /> },
 *   ]}
 * />
 * ```
 */

export interface TabItem {
  /**
   * labeltext
   */
  label: string;

  /**
   * label icon（only supports ReactElement, does not support null or string）
   */
  icon?: React.ReactElement;

  /**
   * labelContent
   */
  content: React.ReactNode;

  /**
   * Whether disabled
   */
  disabled?: boolean;

  /**
   * iconPosition
   */
  iconPosition?: 'start' | 'end' | 'top' | 'bottom';
}

export interface TabsProps {
  /**
   * labelcolumnList
   */
  tabs: TabItem[];

  /**
   * currently active tab index
   */
  value?: number;

  /**
   * default active tab index
   */
  defaultValue?: number;

  /**
   * labelchange callback
   */
  onChange?: (value: number) => void;

  /**
   * labeldirection
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * labelVariant
   */
  variant?: 'standard' | 'scrollable' | 'fullWidth';

  /**
   * Indicator color
   */
  indicatorColor?: 'primary' | 'secondary';

  /**
   * text color
   */
  textColor?: 'primary' | 'secondary' | 'inherit';

  /**
   * whetherCenter
   */
  centered?: boolean;

  /**
   * custom style
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
 * Tabs component
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
