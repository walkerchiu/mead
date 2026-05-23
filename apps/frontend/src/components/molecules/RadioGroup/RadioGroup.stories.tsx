import type { Meta, StoryObj } from '@storybook/nextjs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RadioGroup } from './RadioGroup';
import { Button } from '@/components/atoms';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * RadioGroup combines radio buttons with error handling.
 *
 * ## Features
 * - Perfect integration with react-hook-form
 * - Support for horizontal or vertical layout
 * - Automatic validation error display
 * - Support for option descriptions
 *
 * ## Use Cases
 * - Single choice questions
 * - Gender selection
 * - Plan selection
 */
const meta = {
  title: 'HQ Scope/Molecules/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Radio button group component with perfect react-hook-form integration.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Common option data
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const subscriptionOptions = [
  {
    value: 'free',
    label: 'Free Plan',
    description: 'Basic features, suitable for personal use',
  },
  {
    value: 'pro',
    label: 'Professional Plan',
    description: 'NT$ 299/month, full features',
  },
  {
    value: 'enterprise',
    label: 'Enterprise Plan',
    description: 'Custom requirements, please contact us',
  },
];

const paymentOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

/**
 * Basic Usage
 * Vertically arranged radio buttons
 */
export const Default: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    helperText: 'Please select your gender',
  },
};

/**
 * With Default Value
 * Shows pre-selected option
 */
export const WithDefaultValue: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    defaultValue: 'male',
    helperText: 'Default selection is male',
  },
};

/**
 * With Error Message
 * Displays validation error
 */
export const WithError: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    error: 'This field is required',
  },
};

/**
 * Horizontal Layout
 * Options arranged horizontally
 */
export const Row: Story = {
  args: {
    label: 'Payment Cycle',
    options: paymentOptions,
    row: true,
    helperText: 'Select your payment cycle',
  },
};

/**
 * Required Field
 * Shows required indicator
 */
export const Required: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    required: true,
    helperText: 'This field is required',
  },
};

/**
 * Disabled State
 * Cannot be selected
 */
export const Disabled: Story = {
  args: {
    label: 'Gender',
    options: genderOptions,
    defaultValue: 'male',
    disabled: true,
    helperText: 'This field is disabled',
  },
};

/**
 * Partially Disabled Options
 * Some options cannot be selected
 */
export const WithDisabledOptions: Story = {
  args: {
    label: 'Subscription Plan',
    options: [
      { value: 'free', label: 'Free Plan' },
      { value: 'pro', label: 'Professional Plan' },
      {
        value: 'enterprise',
        label: 'Enterprise Plan (Coming Soon)',
        disabled: true,
      },
    ],
    helperText: 'Enterprise plan coming soon',
  },
};

/**
 * Options with Descriptions
 * Each option has explanation text
 */
export const WithDescription: Story = {
  args: {
    label: 'Choose Plan',
    options: subscriptionOptions,
    helperText: 'Please select a plan that suits you',
  },
};

/**
 * Complete Form Example
 * Using react-hook-form + Zod validation
 */
export const FormExample: Story = {
  render: function FormExampleComponent() {
    const schema = z.object({
      gender: z.string().min(1, 'Please select gender'),
      subscription: z.string().min(1, 'Please select subscription plan'),
      payment: z.string().min(1, 'Please select payment cycle'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        gender: '',
        subscription: '',
        payment: '',
      },
    });

    const onSubmit = async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Member Registration</Typography>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Gender"
                options={genderOptions}
                {...field}
                error={errors.gender}
                helperText="Please select your gender"
              />
            )}
          />

          <Controller
            name="subscription"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Subscription Plan"
                options={subscriptionOptions}
                {...field}
                error={errors.subscription}
                helperText="Select a plan that suits you"
              />
            )}
          />

          <Controller
            name="payment"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Payment Cycle"
                options={paymentOptions}
                row
                {...field}
                error={errors.payment}
                helperText="Select payment cycle"
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
          >
            Submit
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * Survey Example
 * Multiple single-choice question groups
 */
export const SurveyExample: Story = {
  render: function SurveyExampleComponent() {
    const schema = z.object({
      satisfaction: z.string().min(1, 'Please select satisfaction level'),
      recommend: z.string().min(1, 'Please select recommendation'),
      frequency: z.string().min(1, 'Please select usage frequency'),
    });

    type FormData = z.infer<typeof schema>;

    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        satisfaction: '',
        recommend: '',
        frequency: '',
      },
    });

    const allAnswered =
      watch('satisfaction') && watch('recommend') && watch('frequency');

    const onSubmit = (data: FormData) => {
      alert(
        'Thank you for completing the survey!\n\n' +
          JSON.stringify(data, null, 2),
      );
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Product Satisfaction Survey</Typography>

          <Controller
            name="satisfaction"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="1. Are you satisfied with our product?"
                options={[
                  { value: 'very-satisfied', label: 'Very Satisfied' },
                  { value: 'satisfied', label: 'Satisfied' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'dissatisfied', label: 'Dissatisfied' },
                  { value: 'very-dissatisfied', label: 'Very Dissatisfied' },
                ]}
                {...field}
                error={errors.satisfaction}
              />
            )}
          />

          <Controller
            name="recommend"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="2. Would you recommend to friends?"
                options={[
                  { value: 'definitely', label: 'Definitely' },
                  { value: 'probably', label: 'Probably' },
                  { value: 'not-sure', label: 'Not Sure' },
                  { value: 'probably-not', label: 'Probably Not' },
                  { value: 'definitely-not', label: 'Definitely Not' },
                ]}
                {...field}
                error={errors.recommend}
              />
            )}
          />

          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="3. Your usage frequency?"
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'rarely', label: 'Rarely' },
                ]}
                row
                {...field}
                error={errors.frequency}
              />
            )}
          />

          {allAnswered && (
            <Alert severity="success">
              All questions completed, please click submit
            </Alert>
          )}

          <Button type="submit" variant="contained" fullWidth>
            Submit Survey
          </Button>
        </Stack>
      </form>
    );
  },
};

/**
 * Size Comparison
 * Radio buttons in different sizes
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h6">Radio Button Sizes</Typography>

      <RadioGroup
        label="Small Size"
        options={genderOptions}
        row
        helperText="Using default small size"
      />

      <RadioGroup
        label="Medium Size (Default)"
        options={genderOptions}
        row
        helperText="Using default medium size"
      />
    </Stack>
  ),
};
