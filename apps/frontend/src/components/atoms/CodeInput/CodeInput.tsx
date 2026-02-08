import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  ClipboardEvent,
} from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

/**
 * CodeInput Component - Atomic Design: Atom
 *
 * Component specifically designed for verification code input, supports:
 * - Auto-focus to next input box
 * - Paste complete verification code（Automatically distribute to each field）
 * - Backspace to previous input field
 * - Only allow numeric input
 *
 * @example
 * ```tsx
 * <CodeInput
 *   length={6}
 *   value={code}
 *   onChange={setCode}
 *   onComplete={(code) => console.log('complete:', code)}
 * />
 * ```
 */

export interface CodeInputProps {
  /**
   * verification code length
   * @default 6
   */
  length?: number;

  /**
   * current verification code value
   */
  value?: string;

  /**
   * callback on verification code change
   */
  onChange?: (value: string) => void;

  /**
   * Inputcomplete callback
   * triggered when all positions are filled
   */
  onComplete?: (value: string) => void;

  /**
   * whether to show error state
   */
  error?: boolean;

  /**
   * whether to disable input
   */
  disabled?: boolean;
}

/**
 * CodeInput component
 */
export function CodeInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  error = false,
  disabled = false,
}: CodeInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // sync external value to internal state
  useEffect(() => {
    const newDigits = value.padEnd(length, '').split('').slice(0, length);
    setDigits(newDigits);
  }, [value, length]);

  // handle singleInputfieldchange
  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.value;

    // only allowcountcharacters
    if (newValue && !/^\d$/.test(newValue)) {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = newValue;
    setDigits(newDigits);

    const code = newDigits.join('');
    onChange?.(code);

    // if value is entered, auto jump to next input field
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // if all positionscountare filled，trigger onComplete
    if (code.length === length && !code.includes('')) {
      onComplete?.(code);
    }
  };

  // handle keyboard events
  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    // backspace: clear current field and return to previous field
    if (event.key === 'Backspace') {
      event.preventDefault();
      const newDigits = [...digits];

      if (digits[index]) {
        // if current field has value, clear it
        newDigits[index] = '';
        setDigits(newDigits);
        onChange?.(newDigits.join(''));
      } else if (index > 0) {
        // if current fieldnoValue，return to previousfieldandclear
        newDigits[index - 1] = '';
        setDigits(newDigits);
        onChange?.(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // left arrow：Move to previous field
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // right arrow：move to next field
    if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // handlePaste event
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text/plain');

    // only keepcountcharacters
    const numbers = pastedData.replace(/\D/g, '').slice(0, length);

    if (numbers) {
      const newDigits = numbers.padEnd(length, '').split('').slice(0, length);
      setDigits(newDigits);
      const code = newDigits.join('');
      onChange?.(code);

      // focus to last filledfield
      const lastFilledIndex = Math.min(numbers.length, length) - 1;
      inputRefs.current[lastFilledIndex]?.focus();

      // if pastedYescomplete verification code，trigger onComplete
      if (numbers.length === length) {
        onComplete?.(code);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {Array.from({ length }, (_, index) => (
        <TextField
          key={index}
          inputRef={(el) => (inputRefs.current[index] = el)}
          value={digits[index] || ''}
          onChange={(e) =>
            handleChange(index, e as ChangeEvent<HTMLInputElement>)
          }
          onKeyDown={(e) =>
            handleKeyDown(index, e as KeyboardEvent<HTMLInputElement>)
          }
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          error={error}
          disabled={disabled}
          variant="outlined"
          sx={{
            width: '48px',
            '& .MuiOutlinedInput-root': {
              height: '56px',
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              padding: '16px',
            },
          }}
          inputProps={{
            maxLength: 1,
            inputMode: 'numeric',
            pattern: '[0-9]*',
            'aria-label': `verification code position ${index + 1} position`,
          }}
        />
      ))}
    </Box>
  );
}

export default CodeInput;
