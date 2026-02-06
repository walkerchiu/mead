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
 * CodeInput 組件 - Atomic Design: Atom
 *
 * 專為驗證碼輸入設計的組件，支援：
 * - 自動聚焦到下一個輸入框
 * - 貼上完整驗證碼（自動分配到各個框）
 * - 退格鍵回到上一個輸入框
 * - 只允許數字輸入
 *
 * @example
 * ```tsx
 * <CodeInput
 *   length={6}
 *   value={code}
 *   onChange={setCode}
 *   onComplete={(code) => console.log('完成:', code)}
 * />
 * ```
 */

export interface CodeInputProps {
  /**
   * 驗證碼長度
   * @default 6
   */
  length?: number;

  /**
   * 當前驗證碼值
   */
  value?: string;

  /**
   * 驗證碼變更時的回調
   */
  onChange?: (value: string) => void;

  /**
   * 輸入完成時的回調
   * 當所有位數都填滿時觸發
   */
  onComplete?: (value: string) => void;

  /**
   * 是否顯示錯誤狀態
   */
  error?: boolean;

  /**
   * 是否停用輸入
   */
  disabled?: boolean;
}

/**
 * CodeInput 組件
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

  // 同步外部 value 到內部 state
  useEffect(() => {
    const newDigits = value.padEnd(length, '').split('').slice(0, length);
    setDigits(newDigits);
  }, [value, length]);

  // 處理單個輸入框的變更
  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.value;

    // 只允許數字
    if (newValue && !/^\d$/.test(newValue)) {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = newValue;
    setDigits(newDigits);

    const code = newDigits.join('');
    onChange?.(code);

    // 如果輸入了值，自動跳到下一個輸入框
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // 如果所有位數都填滿，觸發 onComplete
    if (code.length === length && !code.includes('')) {
      onComplete?.(code);
    }
  };

  // 處理按鍵事件
  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    // 退格鍵：清除當前框並回到上一個框
    if (event.key === 'Backspace') {
      event.preventDefault();
      const newDigits = [...digits];

      if (digits[index]) {
        // 如果當前框有值，清除它
        newDigits[index] = '';
        setDigits(newDigits);
        onChange?.(newDigits.join(''));
      } else if (index > 0) {
        // 如果當前框沒有值，回到上一個框並清除
        newDigits[index - 1] = '';
        setDigits(newDigits);
        onChange?.(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // 左箭頭：移到上一個框
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // 右箭頭：移到下一個框
    if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 處理貼上事件
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text/plain');

    // 只保留數字
    const numbers = pastedData.replace(/\D/g, '').slice(0, length);

    if (numbers) {
      const newDigits = numbers.padEnd(length, '').split('').slice(0, length);
      setDigits(newDigits);
      const code = newDigits.join('');
      onChange?.(code);

      // 聚焦到最後一個填入的框
      const lastFilledIndex = Math.min(numbers.length, length) - 1;
      inputRefs.current[lastFilledIndex]?.focus();

      // 如果貼上的是完整的驗證碼，觸發 onComplete
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
            'aria-label': `驗證碼第 ${index + 1} 位`,
          }}
        />
      ))}
    </Box>
  );
}

export default CodeInput;
