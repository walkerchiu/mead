import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

const meta = {
  title: 'Atoms/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['linear', 'circular'],
      description: 'Progress type',
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      description: 'Color',
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show label',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LinearDefault: Story = {
  args: {
    type: 'linear',
    value: 60,
  },
};

export const LinearIndeterminate: Story = {
  args: {
    type: 'linear',
  },
};

export const LinearWithLabel: Story = {
  args: {
    type: 'linear',
    value: 75,
    showLabel: true,
  },
};

export const CircularDefault: Story = {
  args: {
    type: 'circular',
    value: 60,
  },
};

export const CircularIndeterminate: Story = {
  args: {
    type: 'circular',
  },
};

export const CircularWithLabel: Story = {
  args: {
    type: 'circular',
    value: 75,
    showLabel: true,
  },
};

export const CircularSizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Progress type="circular" value={60} size={30} />
      <Progress type="circular" value={60} size={50} />
      <Progress type="circular" value={60} size={70} />
      <Progress type="circular" value={60} size={90} />
    </Box>
  ),
};

export const CircularWithLabelSizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <Progress type="circular" value={60} showLabel size={40} />
      <Progress type="circular" value={75} showLabel size={60} />
      <Progress type="circular" value={90} showLabel size={80} />
    </Box>
  ),
};

export const LinearColors: Story = {
  render: () => (
    <Box
      sx={{ width: '400px', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Progress type="linear" value={60} color="primary" />
      <Progress type="linear" value={60} color="secondary" />
      <Progress type="linear" value={60} color="error" />
      <Progress type="linear" value={60} color="warning" />
      <Progress type="linear" value={60} color="info" />
      <Progress type="linear" value={60} color="success" />
    </Box>
  ),
};

export const CircularColors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Progress type="circular" value={60} color="primary" />
      <Progress type="circular" value={60} color="secondary" />
      <Progress type="circular" value={60} color="error" />
      <Progress type="circular" value={60} color="warning" />
      <Progress type="circular" value={60} color="info" />
      <Progress type="circular" value={60} color="success" />
    </Box>
  ),
};

export const LinearAnimated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            return 0;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 500);

      return () => {
        clearInterval(timer);
      };
    }, []);

    return (
      <Box sx={{ width: '400px' }}>
        <Progress type="linear" value={progress} showLabel />
      </Box>
    );
  },
};

export const CircularAnimated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress >= 100 ? 0 : prevProgress + 10,
        );
      }, 800);

      return () => {
        clearInterval(timer);
      };
    }, []);

    return <Progress type="circular" value={progress} showLabel size={80} />;
  },
};

export const CustomLabel: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Progress
        type="circular"
        value={60}
        showLabel
        labelFormatter={(v) => `${v}items`}
        size={60}
      />
      <Progress
        type="circular"
        value={75}
        showLabel
        labelFormatter={(v) => `${v}/100`}
        size={60}
      />
      <Progress
        type="circular"
        value={90}
        showLabel
        labelFormatter={(v) => `Progress\n${v}%`}
        size={80}
      />
    </Box>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '400px' }}>
        <Progress type="linear" />
      </Box>
      <Progress type="circular" />
    </Box>
  ),
};
