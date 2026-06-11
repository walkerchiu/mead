import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
/** 登入帳號格式：3-20 個英數字或底線。 */
const ACCOUNT_NAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * 驗證登入帳號（accountName）格式。
 */
export function assertValidAccountName(
  accountName: string,
  lang?: string,
  i18n?: I18nService,
): void {
  if (!accountName || !ACCOUNT_NAME_REGEX.test(accountName)) {
    const message = i18n
      ? i18n.translate('validation.account.invalid', { lang })
      : '帳號必須為 3-20 個英數字或底線';
    throw new BadRequestException(message);
  }
}

/**
 * 驗證 email 格式
 */
export function assertValidEmail(
  email: string,
  lang?: string,
  i18n?: I18nService,
): void {
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    const message = i18n
      ? i18n.translate('validation.email.invalid', { lang })
      : '無效的電子郵件格式';
    throw new BadRequestException(message);
  }
}

/**
 * 驗證名稱長度
 */
export function assertValidName(
  name?: string,
  lang?: string,
  i18n?: I18nService,
): void {
  if (name && name.length > MAX_NAME_LENGTH) {
    const message = i18n
      ? i18n.translate('validation.name.maxLength', {
          lang,
          args: { max: MAX_NAME_LENGTH },
        })
      : `名稱不可超過 ${MAX_NAME_LENGTH} 個字元`;
    throw new BadRequestException(message);
  }
}
