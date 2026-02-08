/**
 * 密碼強度驗證工具
 * 符合 NIST 最低標準和系統要求
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirement {
  test: (password: string) => boolean;
  message: string;
}

/**
 * 密碼要求規則（與後端保持一致）
 */
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    test: (password) => password.length >= 8,
    message: '至少 8 個字符',
  },
  {
    test: (password) => /[A-Z]/.test(password),
    message: '至少一個大寫字母 (A-Z)',
  },
  {
    test: (password) => /[a-z]/.test(password),
    message: '至少一個小寫字母 (a-z)',
  },
  {
    test: (password) => /[0-9]/.test(password),
    message: '至少一個數字 (0-9)',
  },
  {
    test: (password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    message: '至少一個特殊符號 (!@#$%^&* 等)',
  },
];

/**
 * 驗證密碼強度
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  for (const requirement of PASSWORD_REQUIREMENTS) {
    if (!requirement.test(password)) {
      errors.push(requirement.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 取得密碼要求的說明文字
 */
export function getPasswordRequirementsText(): string {
  return PASSWORD_REQUIREMENTS.map((req) => `• ${req.message}`).join('\n');
}

/**
 * 取得密碼強度（0-5）
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  for (const requirement of PASSWORD_REQUIREMENTS) {
    if (requirement.test(password)) {
      strength++;
    }
  }

  return strength;
}

/**
 * 取得密碼強度等級（返回翻譯 key）
 */
export function getPasswordStrengthLabel(strength: number): {
  labelKey: string;
  color: 'error' | 'warning' | 'info' | 'success';
} {
  if (strength <= 1) {
    return { labelKey: 'veryWeak', color: 'error' };
  }
  if (strength <= 2) {
    return { labelKey: 'weak', color: 'error' };
  }
  if (strength <= 3) {
    return { labelKey: 'medium', color: 'warning' };
  }
  if (strength <= 4) {
    return { labelKey: 'strong', color: 'info' };
  }
  return { labelKey: 'veryStrong', color: 'success' };
}
