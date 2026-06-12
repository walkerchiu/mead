import type { Meta, StoryObj } from '@storybook/nextjs';
import { Slider } from './Slider';
import { useState } from 'react';

const meta = {
  title: 'Shared/Atoms/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Slider label',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether to disable',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Slider size',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Slider color',
    },
    valueLabelDisplay: {
      control: 'select',
      options: ['auto', 'on', 'off'],
      description: 'Value label display mode',
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Volume',
    defaultValue: 50,
    min: 0,
    max: 100,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Brightness',
    defaultValue: 75,
    helperText: 'Adjust screen brightness',
  },
};

export const WithError: Story = {
  args: {
    label: 'Age',
    defaultValue: 15,
    error: { type: 'min', message: 'Age must be greater than 18' },
  },
};

export const WithMarks: Story = {
  args: {
    label: 'Priority',
    defaultValue: 50,
    marks: [
      { value: 0, label: 'Low' },
      { value: 25, label: 'MediumLow' },
      { value: 50, label: 'Medium' },
      { value: 75, label: 'MediumHigh' },
      { value: 100, label: 'High' },
    ],
    step: 25,
  },
};

export const WithAllMarks: Story = {
  args: {
    label: 'Rating',
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
    label: 'Price Range',
    defaultValue: [20, 80],
    min: 0,
    max: 100,
    valueLabelDisplay: 'on',
    valueLabelFormat: (value: number) => `$${value}`,
  },
};

export const Small: Story = {
  args: {
    label: 'Small slider',
    defaultValue: 30,
    size: 'small',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    defaultValue: 60,
    disabled: true,
    helperText: 'This setting cannot be modified currently',
  },
};

export const Temperature: Story = {
  args: {
    label: 'Temperature (°C)',
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
          label="Volume Control"
          value={value}
          onChange={(_, newValue) => setValue(newValue as number)}
          valueLabelDisplay="on"
          helperText={`Current volume: ${value}%`}
        />
      </div>
    );
  },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
      <Slider
        label="Vertical Slider"
        defaultValue={60}
        orientation="vertical"
        valueLabelDisplay="on"
      />
    </div>
  ),
};
