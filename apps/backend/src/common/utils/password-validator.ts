import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  extractEmailTokens,
  extractNameTokens,
  extractTokens,
  containsAnyToken,
} from './password-similarity';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordSimilarityCheck {
  email?: string;
  name?: string;
  username?: string;
  /**
   * 是否檢查 email 網域部分
   * @default false
   *
   * @remarks
   * 預設為 false，因為大多數情況下網域是通用的（gmail.com, outlook.com）
   * 僅在以下情況建議設為 true：
   * - 企業內部系統，統一使用公司網域
   * - 公司名稱獨特且有意義
   */
  checkEmailDomain?: boolean;
}

export interface PasswordHistoryCheck {
  passwordHashes: string[];
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
  'hq',
  'root',
  'user',
  'test',
  'guest',
  'default',
]);

/**
 * 驗證密碼強度（增強版 - 符合 NIST 最低標準）
 * 規則：
 * - 長度至少 8 個字元
 * - 至少包含 1 個大寫字母
 * - 至少包含 1 個小寫字母
 * - 至少包含 1 個數字
 * - 至少包含 1 個特殊符號
 * - 不在常見密碼黑名單中（NIST 建議）
 * - 不得包含使用者名稱或 Email 的任何部分（防止社交工程攻擊）
 *
 * 注意：密碼歷史檢查需使用 validatePasswordStrengthAsync
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

  // 檢查與用戶資訊的相似度（基於 Token-based 方法）
  if (similarityCheck) {
    const { email, name, username, checkEmailDomain = false } = similarityCheck;

    // 檢查是否包含 email 的任何有意義的部分
    // 例如：john.smith@example.com → 檢查 "john" 和 "smith"
    // 如果 checkEmailDomain=true，也會檢查 "example"
    // 會檢測到：Smith123, J0hn@2024, htimS!99（反轉）等變體
    if (email) {
      const emailTokens = extractEmailTokens(email, checkEmailDomain);
      if (emailTokens.length > 0 && containsAnyToken(password, emailTokens)) {
        errors.push(t('validation.password.similarToEmail'));
      }
    }

    // 檢查是否包含姓名的任何有意義的部分
    // 例如：John Smith → 檢查 "john" 和 "smith"
    // 會檢測到：John123, Sm1th!99, nhoJ@2024（反轉）等變體
    if (name) {
      const nameTokens = extractNameTokens(name);
      if (nameTokens.length > 0 && containsAnyToken(password, nameTokens)) {
        errors.push(t('validation.password.similarToName'));
      }
    }

    // 檢查是否包含用戶名的任何有意義的部分
    // 例如：alice_wonder → 檢查 "alice" 和 "wonder"
    if (username) {
      const usernameTokens = extractTokens(username);
      if (
        usernameTokens.length > 0 &&
        containsAnyToken(password, usernameTokens)
      ) {
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

/**
 * 異步驗證密碼強度（包含密碼歷史檢查）
 * 規則：
 * - 所有 validatePasswordStrength 的規則
 * - 不得為最近使用過的 3 組密碼
 */
export async function validatePasswordStrengthAsync(
  password: string,
  lang?: string,
  i18n?: I18nService,
  similarityCheck?: PasswordSimilarityCheck,
  historyCheck?: PasswordHistoryCheck,
): Promise<PasswordValidationResult> {
  const errors: string[] = [];

  // 執行同步驗證
  const syncResult = validatePasswordStrength(
    password,
    lang,
    i18n,
    similarityCheck,
  );
  errors.push(...syncResult.errors);

  // 檢查密碼歷史（需要 bcrypt 異步比對）
  if (historyCheck && historyCheck.passwordHashes.length > 0) {
    const bcrypt = await import('bcrypt');
    const t = (key: string): string =>
      i18n ? String(i18n.translate(key, { lang })) : key;

    for (const hash of historyCheck.passwordHashes) {
      const isMatch = await bcrypt.compare(password, hash);
      if (isMatch) {
        errors.push(t('validation.password.recentlyUsed'));
        break; // 只需要報告一次錯誤
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 異步驗證密碼並在不符合時拋出錯誤
 */
export async function assertPasswordStrengthAsync(
  password: string,
  lang?: string,
  i18n?: I18nService,
  similarityCheck?: PasswordSimilarityCheck,
  historyCheck?: PasswordHistoryCheck,
): Promise<void> {
  const result = await validatePasswordStrengthAsync(
    password,
    lang,
    i18n,
    similarityCheck,
    historyCheck,
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
