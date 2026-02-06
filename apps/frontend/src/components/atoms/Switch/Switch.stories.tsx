import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';
import { useState } from 'react';

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '開關標籤',
    },
    checked: {
      control: 'boolean',
      description: '是否選中',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: '開關大小',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      description: '開關顏色',
    },
    labelPlacement: {
      control: 'select',
      options: ['start', 'end', 'top', 'bottom'],
      description: '標籤位置',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '啟用通知',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: '啟用通知',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: '維護模式',
    disabled: true,
    helperText: '需要管理員權限才能修改',
  },
};

export const WithHelperText: Story = {
  args: {
    label: '接收電子郵件通知',
    helperText: '我們會在重要活動發生時通知您',
  },
};

export const WithError: Story = {
  args: {
    label: '同意服務條款',
    error: { type: 'required', message: '您必須同意服務條款才能繼續' },
  },
};

export const Required: Story = {
  args: {
    label: '同意隱私政策',
    required: true,
  },
};

export const Small: Story = {
  args: {
    label: '小尺寸開關',
    size: 'small',
  },
};

export const LabelStart: Story = {
  args: {
    label: '標籤在左側',
    labelPlacement: 'start',
  },
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch label="Primary" color="primary" checked />
      <Switch label="Secondary" color="secondary" checked />
      <Switch label="Error" color="error" checked />
      <Switch label="Warning" color="warning" checked />
      <Switch label="Info" color="info" checked />
      <Switch label="Success" color="success" checked />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        label={checked ? '已啟用' : '已停用'}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        helperText={checked ? '功能目前為啟用狀態' : '功能目前為停用狀態'}
      />
    );
  },
};

export const WithoutLabel: Story = {
  args: {
    checked: false,
  },
};
