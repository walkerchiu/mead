import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const meta = {
  title: 'Molecules/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicSteps = [
  { label: '選擇方案' },
  { label: '填寫資料' },
  { label: '確認付款' },
  { label: '完成' },
];

export const Default: Story = {
  args: {
    activeStep: 1,
    steps: basicSteps,
  },
};

export const FirstStep: Story = {
  args: {
    activeStep: 0,
    steps: basicSteps,
  },
};

export const LastStep: Story = {
  args: {
    activeStep: 3,
    steps: basicSteps,
  },
};

export const WithDescription: Story = {
  args: {
    activeStep: 1,
    steps: [
      { label: '帳號設定', description: '建立您的帳號' },
      { label: '個人資料', description: '填寫基本資訊' },
      { label: '驗證', description: '驗證您的電子郵件' },
      { label: '完成', description: '開始使用' },
    ],
  },
};

export const WithOptional: Story = {
  args: {
    activeStep: 1,
    steps: [
      { label: '基本資料' },
      { label: '聯絡資訊', optional: true },
      { label: '公司資訊', optional: true },
      { label: '確認送出' },
    ],
  },
};

export const WithError: Story = {
  args: {
    activeStep: 1,
    steps: [
      { label: '步驟一', completed: true },
      { label: '步驟二', error: true },
      { label: '步驟三' },
    ],
  },
};

export const AlternativeLabel: Story = {
  args: {
    activeStep: 1,
    steps: basicSteps,
    alternativeLabel: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
      { label: '選擇產品' },
      { label: '輸入配送資訊' },
      { label: '選擇付款方式' },
      { label: '確認訂單' },
    ];

    const handleNext = () => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
      setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleReset = () => {
      setActiveStep(0);
    };

    return (
      <Box sx={{ width: '600px' }}>
        <Stepper activeStep={activeStep} steps={steps} />
        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            上一步
          </Button>
          <Button
            variant="contained"
            disabled={activeStep === steps.length - 1}
            onClick={handleNext}
          >
            下一步
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Box>
      </Box>
    );
  },
};

export const Vertical: Story = {
  args: {
    activeStep: 1,
    orientation: 'vertical',
    steps: [
      {
        label: '選擇活動類型',
        description: '選擇您要建立的活動類型',
      },
      {
        label: '填寫活動詳情',
        description: '提供活動的基本資訊',
      },
      {
        label: '設定時間和地點',
        description: '選擇活動的日期、時間和地點',
      },
      {
        label: '審核並發布',
        description: '檢查所有資訊並發布活動',
      },
    ],
  },
};

export const VerticalWithContent: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
      {
        label: '選擇設定',
        content: (
          <Box>
            <Typography>請選擇您的偏好設定。</Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => setActiveStep(1)}>
                繼續
              </Button>
            </Box>
          </Box>
        ),
      },
      {
        label: '建立帳號',
        content: (
          <Box>
            <Typography>請填寫您的帳號資訊。</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button onClick={() => setActiveStep(0)}>返回</Button>
              <Button variant="contained" onClick={() => setActiveStep(2)}>
                繼續
              </Button>
            </Box>
          </Box>
        ),
      },
      {
        label: '完成',
        content: (
          <Box>
            <Typography>設定已完成！</Typography>
            <Box sx={{ mt: 2 }}>
              <Button onClick={() => setActiveStep(0)}>重新開始</Button>
            </Box>
          </Box>
        ),
      },
    ];

    return (
      <Box sx={{ width: '600px' }}>
        <Stepper activeStep={activeStep} orientation="vertical" steps={steps} />
      </Box>
    );
  },
};

export const NonLinear: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});

    const steps = [
      { label: '基本資訊' },
      { label: '聯絡方式' },
      { label: '偏好設定' },
    ];

    const handleComplete = () => {
      setCompleted({ ...completed, [activeStep]: true });
      const newActiveStep =
        activeStep === steps.length - 1
          ? steps.findIndex((_, i) => !(i in completed))
          : activeStep + 1;
      setActiveStep(newActiveStep);
    };

    return (
      <Box sx={{ width: '600px' }}>
        <Stepper
          activeStep={activeStep}
          nonLinear
          steps={steps.map((step, index) => ({
            ...step,
            completed: completed[index],
          }))}
        />
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleComplete}>
            {activeStep === steps.length - 1 ? '完成' : '完成此步驟'}
          </Button>
        </Box>
      </Box>
    );
  },
};

export const RegistrationFlow: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
      { label: '建立帳號', description: '輸入電子郵件和密碼' },
      { label: '個人資料', description: '提供基本資訊' },
      { label: '驗證', description: '驗證您的電子郵件' },
      { label: '完成', description: '開始使用服務' },
    ];

    return (
      <Box sx={{ width: '700px' }}>
        <Stepper activeStep={activeStep} steps={steps} alternativeLabel />
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {steps[activeStep].label}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {steps[activeStep].description}
          </Typography>
          <Box
            sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              返回
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                setActiveStep(Math.min(activeStep + 1, steps.length - 1))
              }
            >
              {activeStep === steps.length - 1 ? '完成' : '下一步'}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  },
};
