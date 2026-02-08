import { forwardRef } from 'react';
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Stepper Component - Atomic Design: Molecule
 *
 * Stepper indicator component，for displaying multi-step process progress。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Stepper
 *   activeStep={1}
 *   steps={[
 *     { label: 'Select Plan' },
 *     { label: 'Fill Information' },
 *     { label: 'Confirm payment' },
 *   ]}
 * />
 *
 * // With description
 * <Stepper
 *   activeStep={0}
 *   steps={[
 *     { label: 'Step 1', description: 'Complete basic settings' },
 *     { label: 'Step 2', description: 'upload required files' },
 *   ]}
 * />
 *
 * // Vertical stepper（With content）
 * <Stepper
 *   activeStep={1}
 *   orientation="vertical"
 *   steps={[
 *     { label: 'Step 1', content: <Form1 /> },
 *     { label: 'Step 2', content: <Form2 /> },
 *   ]}
 * />
 * ```
 */

export interface StepItem {
  /**
   * Step label
   */
  label: string;

  /**
   * StepDescription（Optional）
   */
  description?: string;

  /**
   * step content（vertical mode only）
   */
  content?: React.ReactNode;

  /**
   * whether is optional step
   */
  optional?: boolean;

  /**
   * whetherAlreadycomplete
   */
  completed?: boolean;

  /**
   * whether has error
   */
  error?: boolean;
}

export interface StepperProps {
  /**
   * StepcolumnList
   */
  steps: StepItem[];

  /**
   * current active step index
   */
  activeStep: number;

  /**
   * direction
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * non-linear mode（Allow skip step）
   */
  nonLinear?: boolean;

  /**
   * alternative label (place label below icon)
   */
  alternativeLabel?: boolean;

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

/**
 * Stepper component
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  function Stepper(
    {
      steps,
      activeStep,
      orientation = 'horizontal',
      nonLinear = false,
      alternativeLabel = false,
      sx,
      ...props
    },
    ref,
  ) {
    return (
      <MuiStepper
        ref={ref}
        activeStep={activeStep}
        orientation={orientation}
        nonLinear={nonLinear}
        alternativeLabel={alternativeLabel}
        sx={sx}
        {...props}
      >
        {steps.map((step, index) => (
          <Step key={index} completed={step.completed}>
            <StepLabel
              optional={
                step.optional ? (
                  <span style={{ fontSize: '0.75rem' }}>Optional</span>
                ) : step.description ? (
                  <span style={{ fontSize: '0.75rem' }}>
                    {step.description}
                  </span>
                ) : undefined
              }
              error={step.error}
            >
              {step.label}
            </StepLabel>
            {orientation === 'vertical' && step.content && (
              <StepContent>{step.content}</StepContent>
            )}
          </Step>
        ))}
      </MuiStepper>
    );
  },
);

export default Stepper;
