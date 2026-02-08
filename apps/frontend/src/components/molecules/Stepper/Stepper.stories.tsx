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
  { label: 'Select Plan' },
  { label: 'Fill Information' },
  { label: 'Confirm Payment' },
  { label: 'Complete' },
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
      { label: 'Account Setup', description: 'Create your account' },
      { label: 'Personal Info', description: 'Fill in basic information' },
      { label: 'Verification', description: 'Verify your email' },
      { label: 'Complete', description: 'Start using' },
    ],
  },
};

export const WithOptional: Story = {
  args: {
    activeStep: 1,
    steps: [
      { label: 'Basic Information' },
      { label: 'Contact Information', optional: true },
      { label: 'Company Information', optional: true },
      { label: 'Confirm Submission' },
    ],
  },
};

export const WithError: Story = {
  args: {
    activeStep: 1,
    steps: [
      { label: 'Step One', completed: true },
      { label: 'Step Two', error: true },
      { label: 'Step Three' },
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
      { label: 'Select Product' },
      { label: 'Enter Shipping Info' },
      { label: 'Choose Payment Method' },
      { label: 'Confirm Order' },
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
            Previous
          </Button>
          <Button
            variant="contained"
            disabled={activeStep === steps.length - 1}
            onClick={handleNext}
          >
            Next
          </Button>
          <Button onClick={handleReset}>Reset</Button>
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
        label: 'Choose Event Type',
        description: 'Select the type of event you want to create',
      },
      {
        label: 'Fill Event Details',
        description: 'Provide basic information about the event',
      },
      {
        label: 'Set Time and Location',
        description: 'Choose the date, time, and location of the event',
      },
      {
        label: 'Review and Publish',
        description: 'Check all information and publish the event',
      },
    ],
  },
};

export const VerticalWithContent: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
      {
        label: 'Choose Settings',
        content: (
          <Box>
            <Typography>Please choose your preference settings.</Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => setActiveStep(1)}>
                Continue
              </Button>
            </Box>
          </Box>
        ),
      },
      {
        label: 'Create Account',
        content: (
          <Box>
            <Typography>Please fill in your account information.</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
              <Button variant="contained" onClick={() => setActiveStep(2)}>
                Continue
              </Button>
            </Box>
          </Box>
        ),
      },
      {
        label: 'Complete',
        content: (
          <Box>
            <Typography>Setup complete!</Typography>
            <Box sx={{ mt: 2 }}>
              <Button onClick={() => setActiveStep(0)}>Start Over</Button>
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
      { label: 'Basic Information' },
      { label: 'Contact Details' },
      { label: 'Preferences' },
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
            {activeStep === steps.length - 1 ? 'Finish' : 'Complete Step'}
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
      { label: 'Create Account', description: 'Enter email and password' },
      { label: 'Personal Info', description: 'Provide basic information' },
      { label: 'Verification', description: 'Verify your email' },
      { label: 'Complete', description: 'Start using the service' },
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
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                setActiveStep(Math.min(activeStep + 1, steps.length - 1))
              }
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  },
};
