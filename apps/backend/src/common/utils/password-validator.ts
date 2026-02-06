import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordSimilarityCheck {
  email?: string;
  name?: string;
  username?: string;
}

/**
 * 常見密碼黑名單（Top 100 worst passwords）
 * 來源：https://nordpass.com/most-common-passwords-list/
 */
const COMMON_PASSWORDS = new Set([
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  '111111',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
  'welcome',
  'jesus',
  'ninja',
  'mustang',
  'password1',
  '123456789',
  'admin',
  'root',
  'user',
  'test',
  'guest',
  'default',
]);

/**
 * 驗證密碼強度（增強版 - 符合 NIST 最低標準）
 * 規則：
 * - 至少 8 個字元（NIST 最低要求）
 * - 至少一個大寫英文字母
 * - 至少一個小寫英文字母
 * - 至少一個數字
 * - 至少一個特殊符號
 * - 不在常見密碼黑名單中（NIST 建議）
 * - 與用戶資訊不相似（防止社交工程攻擊）
 */
export function validatePasswordStrength(
  password: string,
  lang?: string,
  i18n?: I18nService,
  similarityCheck?: PasswordSimilarityCheck,
): PasswordValidationResult {
  const errors: string[] = [];

  const t = (key: string): string =>
    i18n ? String(i18n.translate(key, { lang })) : key;

  // 檢查長度（NIST 最低要求：8 字符）
  if (password.length < 8) {
    errors.push(t('validation.password.minLength'));
  }

  // 檢查是否包含大寫字母
  if (!/[A-Z]/.test(password)) {
    errors.push(t('validation.password.uppercase'));
  }

  // 檢查是否包含小寫字母
  if (!/[a-z]/.test(password)) {
    errors.push(t('validation.password.lowercase'));
  }

  // 檢查是否包含數字
  if (!/[0-9]/.test(password)) {
    errors.push(t('validation.password.number'));
  }

  // 檢查是否包含特殊符號
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push(t('validation.password.specialChar'));
  }

  // 檢查是否為常見密碼
  const passwordLower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(passwordLower)) {
    errors.push(t('validation.password.tooCommon'));
  }

  // 檢查與用戶資訊的相似度
  if (similarityCheck) {
    const { email, name, username } = similarityCheck;

    // 檢查是否包含 email 的 username 部分
    if (email) {
      const emailUsername = email.split('@')[0].toLowerCase();
      if (emailUsername.length >= 4 && passwordLower.includes(emailUsername)) {
        errors.push(t('validation.password.similarToEmail'));
      }
    }

    // 檢查是否包含名字
    if (name && name.length >= 3) {
      const nameLower = name.toLowerCase();
      if (passwordLower.includes(nameLower)) {
        errors.push(t('validation.password.similarToName'));
      }
    }

    // 檢查是否包含用戶名
    if (username && username.length >= 3) {
      const usernameLower = username.toLowerCase();
      if (passwordLower.includes(usernameLower)) {
        errors.push(t('validation.password.similarToUsername'));
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 驗證密碼並在不符合時拋出錯誤
 */
export function assertPasswordStrength(
  password: string,
  lang?: string,
  i18n?: I18nService,
  similarityCheck?: PasswordSimilarityCheck,
): void {
  const result = validatePasswordStrength(
    password,
    lang,
    i18n,
    similarityCheck,
  );

  if (!result.isValid) {
    const message = i18n
      ? i18n.translate('validation.password.strengthFailed', { lang })
      : '密碼強度不符合要求';

    throw new BadRequestException({
      message,
      errors: result.errors,
    });
  }
}
