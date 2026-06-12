import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Typography } from '@mui/material';
import { SettingsButton } from './SettingsButton';

/**
 * SettingsButton - Atomic Design: Atom
 *
 * 設定選單的觸發按鈕，可僅顯示圖示或含文字標籤。
 */
const meta = {
  title: 'Shared/Atoms/SettingsButton',
  component: SettingsButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    showLabel: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof SettingsButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設樣式 - 僅圖示
 */
export const Default: Story = {
  args: {
    onClick: () => alert('Settings clicked'),
  },
};

/**
 * 含文字標籤
 */
export const WithLabel: Story = {
  args: {
    showLabel: true,
    label: 'Settings',
    onClick: () => alert('Settings clicked'),
  },
};

/**
 * 自訂標籤文字
 */
export const CustomLabel: Story = {
  args: {
    showLabel: true,
    label: 'System Settings',
    onClick: () => alert('Settings clicked'),
  },
};

/**
 * 不同尺寸 - 僅圖示與含標籤
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Icon Only
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <SettingsButton
              size="small"
              onClick={() => alert('Settings clicked')}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Small
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <SettingsButton
              size="medium"
              onClick={() => alert('Settings clicked')}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Medium
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <SettingsButton
              size="large"
              onClick={() => alert('Settings clicked')}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Large
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          With Label
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <SettingsButton
              size="small"
              showLabel={true}
              label="Settings"
              onClick={() => alert('Settings clicked')}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Small
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <SettingsButton
              size="medium"
              showLabel={true}
              label="Settings"
              onClick={() => alert('Settings clicked')}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Medium
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <SettingsButton
              size="large"
              showLabel={true}
              label="Settings"
              onClick={() => alert('Settings clicked')}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Large
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  ),
};

/**
 * 不同顏色
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <SettingsButton
          color="primary"
          onClick={() => alert('Settings clicked')}
        />
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Primary
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <SettingsButton
          color="secondary"
          onClick={() => alert('Settings clicked')}
        />
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Secondary
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <SettingsButton
          color="inherit"
          onClick={() => alert('Settings clicked')}
        />
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Inherit
        </Typography>
      </Box>
    </Box>
  ),
};

/**
 * 含工具提示
 */
export const WithTooltip: Story = {
  args: {
    tooltipTitle: 'Open Settings Menu',
    onClick: () => alert('Settings clicked'),
  },
};
