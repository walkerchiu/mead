import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';
import { useState } from 'react';

const meta = {
  title: 'Atoms/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '滑桿標籤',
    },
    min: {
      control: 'number',
      description: '最小值',
    },
    max: {
      control: 'number',
      description: '最大值',
    },
    step: {
      control: 'number',
      description: '步長',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: '滑桿大小',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: '滑桿顏色',
    },
    valueLabelDisplay: {
      control: 'select',
      options: ['auto', 'on', 'off'],
      description: '值標籤顯示方式',
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '音量',
    defaultValue: 50,
    min: 0,
    max: 100,
  },
};

export const WithHelperText: Story = {
  args: {
    label: '亮度',
    defaultValue: 75,
    helperText: '調整螢幕亮度',
  },
};

export const WithError: Story = {
  args: {
    label: '年齡',
    defaultValue: 15,
    error: { type: 'min', message: '年齡必須大於 18 歲' },
  },
};

export const WithMarks: Story = {
  args: {
    label: '優先級',
    defaultValue: 50,
    marks: [
      { value: 0, label: '低' },
      { value: 25, label: '中低' },
      { value: 50, label: '中' },
      { value: 75, label: '中高' },
      { value: 100, label: '高' },
    ],
    step: 25,
  },
};

export const WithAllMarks: Story = {
  args: {
    label: '評分',
    defaultValue: 5,
    min: 0,
    max: 10,
    step: 1,
    marks: true,
    valueLabelDisplay: 'on',
  },
};

export const Range: Story = {
  args: {
    label: '價格範圍',
    defaultValue: [20, 80],
    min: 0,
    max: 100,
    valueLabelDisplay: 'on',
    valueLabelFormat: (value: number) => `$${value}`,
  },
};

export const Small: Story = {
  args: {
    label: '小尺寸滑桿',
    defaultValue: 30,
    size: 'small',
  },
};

export const Disabled: Story = {
  args: {
    label: '已禁用',
    defaultValue: 60,
    disabled: true,
    helperText: '此設定目前無法修改',
  },
};

export const Temperature: Story = {
  args: {
    label: '溫度（°C）',
    defaultValue: 22,
    min: 10,
    max: 35,
    step: 0.5,
    valueLabelDisplay: 'on',
    valueLabelFormat: (value: number) => `${value}°C`,
    marks: [
      { value: 10, label: '10°C' },
      { value: 20, label: '20°C' },
      { value: 30, label: '30°C' },
    ],
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return (
      <div style={{ width: '300px' }}>
        <Slider
          label="音量控制"
          value={value}
          onChange={(_, newValue) => setValue(newValue as number)}
          valueLabelDisplay="on"
          helperText={`當前音量: ${value}%`}
        />
      </div>
    );
  },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
      <Slider
        label="垂直滑桿"
        defaultValue={60}
        orientation="vertical"
        valueLabelDisplay="on"
      />
    </div>
  ),
};
