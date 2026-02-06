import { forwardRef } from 'react';
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Stepper 組件 - Atomic Design: Molecule
 *
 * 步驟指示器組件，用於顯示多步驟流程的進度。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Stepper
 *   activeStep={1}
 *   steps={[
 *     { label: '選擇方案' },
 *     { label: '填寫資料' },
 *     { label: '確認付款' },
 *   ]}
 * />
 *
 * // 帶描述
 * <Stepper
 *   activeStep={0}
 *   steps={[
 *     { label: '步驟一', description: '完成基本設定' },
 *     { label: '步驟二', description: '上傳必要文件' },
 *   ]}
 * />
 *
 * // 垂直步驟條（帶內容）
 * <Stepper
 *   activeStep={1}
 *   orientation="vertical"
 *   steps={[
 *     { label: '步驟一', content: <Form1 /> },
 *     { label: '步驟二', content: <Form2 /> },
 *   ]}
 * />
 * ```
 */

export interface StepItem {
  /**
   * 步驟標籤
   */
  label: string;

  /**
   * 步驟描述（可選）
   */
  description?: string;

  /**
   * 步驟內容（僅垂直模式）
   */
  content?: React.ReactNode;

  /**
   * 是否為可選步驟
   */
  optional?: boolean;

  /**
   * 是否已完成
   */
  completed?: boolean;

  /**
   * 是否有錯誤
   */
  error?: boolean;
}

export interface StepperProps {
  /**
   * 步驟列表
   */
  steps: StepItem[];

  /**
   * 當前啟用的步驟索引
   */
  activeStep: number;

  /**
   * 方向
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * 非線性模式（允許跳過步驟）
   */
  nonLinear?: boolean;

  /**
   * 替代標籤（將標籤置於圖示下方）
   */
  alternativeLabel?: boolean;

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

/**
 * Stepper 組件
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
                  <span style={{ fontSize: '0.75rem' }}>選填</span>
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
