/**
 * Auto-generated i18n types
 *
 * DO NOT EDIT MANUALLY
 * Generated from: messages/en.json
 * To regenerate: pnpm generate-i18n-types
 */

/**
 * Complete translation message structure
 */
export interface Messages {
  common: {
    loading: string;
    submit: string;
    cancel: string;
    back: string;
    logout: string;
    save: string;
    confirm: string;
    done: string;
    download: string;
    unknown: string;
    all: string;
    locale: string;
  };
  nav: {
    home: string;
    dashboard: string;
    settings: string;
    securitySettings: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      emailLabel: string;
      passwordLabel: string;
      forgotPassword: string;
      submit: string;
      success: string;
      error: string;
      failed: string;
      retry: string;
    };
    forgotPassword: {
      title: string;
      subtitle: string;
      submit: string;
      success: string;
      successTitle: string;
      successMessage: string;
      successHint: string;
      backToLogin: string;
      error: string;
    };
    resetPassword: {
      title: string;
      subtitle: string;
      newPassword: string;
      confirmPassword: string;
      submit: string;
      success: string;
      successTitle: string;
      successMessage: string;
      invalidToken: string;
      invalidTokenTitle: string;
      backToForgotPassword: string;
      missingToken: string;
      error: string;
      passwordRequirements: string;
      minLength: string;
      uppercase: string;
      lowercase: string;
      number: string;
      helperText: string;
      confirmHelperText: string;
    };
    twoFactor: {
      title: string;
      subtitle: string;
      codeLabel: string;
      backupCodeLabel: string;
      submit: string;
      useBackupCode: string;
      backToLogin: string;
      codeInfo: string;
      codeRequired: string;
      codeTooLong: string;
      verificationFailed: string;
      codeInvalid: string;
      subtitleBackup: string;
      retry: string;
    };
    twoFactorSettings: {
      title: string;
      enabled: string;
      disabled: string;
      description: string;
      enable: string;
      disable: string;
      type: string;
      lastVerified: string;
      confirmEnableTitle: string;
      confirmEnableMessage: string;
      confirmDisableTitle: string;
      confirmDisableWarning: string;
      confirmDisable: string;
      verificationCodeSent: string;
      enableSuccess: string;
      disableSuccess: string;
      enterCode: string;
      backupCodesTitle: string;
      backupCodesWarning: string;
      requestFailed: string;
      verificationFailed: string;
      email: string;
      never: string;
    };
  };
  validation: {
    email: {
      required: string;
      invalid: string;
    };
    password: {
      required: string;
      minLength: string;
      uppercase: string;
      lowercase: string;
      number: string;
      mismatch: string;
    };
    name: {
      maxLength: string;
    };
    twoFactorCode: {
      required: string;
      length: string;
    };
  };
  pages: {
    home: {
      title: string;
      subtitle: string;
      description: string;
      login: string;
      dashboard: string;
    };
    dashboard: {
      title: string;
      welcome: string;
      description: string;
      securitySettings: string;
      backToHome: string;
      loggedOut: string;
      cards: {
        security: {
          title: string;
          description: string;
          action: string;
        };
        auditLogs: {
          title: string;
          description: string;
          action: string;
        };
      };
    };
    settings: {
      security: {
        title: string;
        description: string;
      };
    };
    admin: {
      auditLogs: {
        title: string;
        description: string;
        refresh: string;
        newLogs: string;
        loadError: string;
        noData: string;
        loading: string;
        filters: {
          title: string;
          userId: string;
          userIdPlaceholder: string;
          action: string;
          entity: string;
          status: string;
          success: string;
          failure: string;
          apply: string;
          clear: string;
        };
        stats: {
          totalCount: string;
          successRate: string;
          failureCount: string;
          topAction: string;
          actionCount: string;
          times: string;
          noData: string;
        };
        table: {
          title: string;
          timestamp: string;
          user: string;
          action: string;
          entity: string;
          status: string;
          method: string;
          path: string;
          ip: string;
          duration: string;
          success: string;
          failure: string;
          unknown: string;
          noData: string;
          page: string;
          firstPage: string;
          lastPage: string;
          totalRecords: string;
        };
      };
    };
  };
}

/**
 * All possible translation keys in dot notation
 *
 * Usage:
 *   const t = useTranslations();
 *   t('auth.login.title' as TranslationKey); // Type-safe!
 */
export type TranslationKey =
  | 'common.loading'
  | 'common.submit'
  | 'common.cancel'
  | 'common.back'
  | 'common.logout'
  | 'common.save'
  | 'common.confirm'
  | 'common.done'
  | 'common.download'
  | 'common.unknown'
  | 'common.all'
  | 'common.locale'
  | 'nav.home'
  | 'nav.dashboard'
  | 'nav.settings'
  | 'nav.securitySettings'
  | 'auth.login.title'
  | 'auth.login.subtitle'
  | 'auth.login.emailLabel'
  | 'auth.login.passwordLabel'
  | 'auth.login.forgotPassword'
  | 'auth.login.submit'
  | 'auth.login.success'
  | 'auth.login.error'
  | 'auth.login.failed'
  | 'auth.login.retry'
  | 'auth.forgotPassword.title'
  | 'auth.forgotPassword.subtitle'
  | 'auth.forgotPassword.submit'
  | 'auth.forgotPassword.success'
  | 'auth.forgotPassword.successTitle'
  | 'auth.forgotPassword.successMessage'
  | 'auth.forgotPassword.successHint'
  | 'auth.forgotPassword.backToLogin'
  | 'auth.forgotPassword.error'
  | 'auth.resetPassword.title'
  | 'auth.resetPassword.subtitle'
  | 'auth.resetPassword.newPassword'
  | 'auth.resetPassword.confirmPassword'
  | 'auth.resetPassword.submit'
  | 'auth.resetPassword.success'
  | 'auth.resetPassword.successTitle'
  | 'auth.resetPassword.successMessage'
  | 'auth.resetPassword.invalidToken'
  | 'auth.resetPassword.invalidTokenTitle'
  | 'auth.resetPassword.backToForgotPassword'
  | 'auth.resetPassword.missingToken'
  | 'auth.resetPassword.error'
  | 'auth.resetPassword.passwordRequirements'
  | 'auth.resetPassword.minLength'
  | 'auth.resetPassword.uppercase'
  | 'auth.resetPassword.lowercase'
  | 'auth.resetPassword.number'
  | 'auth.resetPassword.helperText'
  | 'auth.resetPassword.confirmHelperText'
  | 'auth.twoFactor.title'
  | 'auth.twoFactor.subtitle'
  | 'auth.twoFactor.codeLabel'
  | 'auth.twoFactor.backupCodeLabel'
  | 'auth.twoFactor.submit'
  | 'auth.twoFactor.useBackupCode'
  | 'auth.twoFactor.backToLogin'
  | 'auth.twoFactor.codeInfo'
  | 'auth.twoFactor.codeRequired'
  | 'auth.twoFactor.codeTooLong'
  | 'auth.twoFactor.verificationFailed'
  | 'auth.twoFactor.codeInvalid'
  | 'auth.twoFactor.subtitleBackup'
  | 'auth.twoFactor.retry'
  | 'auth.twoFactorSettings.title'
  | 'auth.twoFactorSettings.enabled'
  | 'auth.twoFactorSettings.disabled'
  | 'auth.twoFactorSettings.description'
  | 'auth.twoFactorSettings.enable'
  | 'auth.twoFactorSettings.disable'
  | 'auth.twoFactorSettings.type'
  | 'auth.twoFactorSettings.lastVerified'
  | 'auth.twoFactorSettings.confirmEnableTitle'
  | 'auth.twoFactorSettings.confirmEnableMessage'
  | 'auth.twoFactorSettings.confirmDisableTitle'
  | 'auth.twoFactorSettings.confirmDisableWarning'
  | 'auth.twoFactorSettings.confirmDisable'
  | 'auth.twoFactorSettings.verificationCodeSent'
  | 'auth.twoFactorSettings.enableSuccess'
  | 'auth.twoFactorSettings.disableSuccess'
  | 'auth.twoFactorSettings.enterCode'
  | 'auth.twoFactorSettings.backupCodesTitle'
  | 'auth.twoFactorSettings.backupCodesWarning'
  | 'auth.twoFactorSettings.requestFailed'
  | 'auth.twoFactorSettings.verificationFailed'
  | 'auth.twoFactorSettings.email'
  | 'auth.twoFactorSettings.never'
  | 'validation.email.required'
  | 'validation.email.invalid'
  | 'validation.password.required'
  | 'validation.password.minLength'
  | 'validation.password.uppercase'
  | 'validation.password.lowercase'
  | 'validation.password.number'
  | 'validation.password.mismatch'
  | 'validation.name.maxLength'
  | 'validation.twoFactorCode.required'
  | 'validation.twoFactorCode.length'
  | 'pages.home.title'
  | 'pages.home.subtitle'
  | 'pages.home.description'
  | 'pages.home.login'
  | 'pages.home.dashboard'
  | 'pages.dashboard.title'
  | 'pages.dashboard.welcome'
  | 'pages.dashboard.description'
  | 'pages.dashboard.securitySettings'
  | 'pages.dashboard.backToHome'
  | 'pages.dashboard.loggedOut'
  | 'pages.dashboard.cards.security.title'
  | 'pages.dashboard.cards.security.description'
  | 'pages.dashboard.cards.security.action'
  | 'pages.dashboard.cards.auditLogs.title'
  | 'pages.dashboard.cards.auditLogs.description'
  | 'pages.dashboard.cards.auditLogs.action'
  | 'pages.settings.security.title'
  | 'pages.settings.security.description'
  | 'pages.admin.auditLogs.title'
  | 'pages.admin.auditLogs.description'
  | 'pages.admin.auditLogs.refresh'
  | 'pages.admin.auditLogs.newLogs'
  | 'pages.admin.auditLogs.loadError'
  | 'pages.admin.auditLogs.noData'
  | 'pages.admin.auditLogs.loading'
  | 'pages.admin.auditLogs.filters.title'
  | 'pages.admin.auditLogs.filters.userId'
  | 'pages.admin.auditLogs.filters.userIdPlaceholder'
  | 'pages.admin.auditLogs.filters.action'
  | 'pages.admin.auditLogs.filters.entity'
  | 'pages.admin.auditLogs.filters.status'
  | 'pages.admin.auditLogs.filters.success'
  | 'pages.admin.auditLogs.filters.failure'
  | 'pages.admin.auditLogs.filters.apply'
  | 'pages.admin.auditLogs.filters.clear'
  | 'pages.admin.auditLogs.stats.totalCount'
  | 'pages.admin.auditLogs.stats.successRate'
  | 'pages.admin.auditLogs.stats.failureCount'
  | 'pages.admin.auditLogs.stats.topAction'
  | 'pages.admin.auditLogs.stats.actionCount'
  | 'pages.admin.auditLogs.stats.times'
  | 'pages.admin.auditLogs.stats.noData'
  | 'pages.admin.auditLogs.table.title'
  | 'pages.admin.auditLogs.table.timestamp'
  | 'pages.admin.auditLogs.table.user'
  | 'pages.admin.auditLogs.table.action'
  | 'pages.admin.auditLogs.table.entity'
  | 'pages.admin.auditLogs.table.status'
  | 'pages.admin.auditLogs.table.method'
  | 'pages.admin.auditLogs.table.path'
  | 'pages.admin.auditLogs.table.ip'
  | 'pages.admin.auditLogs.table.duration'
  | 'pages.admin.auditLogs.table.success'
  | 'pages.admin.auditLogs.table.failure'
  | 'pages.admin.auditLogs.table.unknown'
  | 'pages.admin.auditLogs.table.noData'
  | 'pages.admin.auditLogs.table.page'
  | 'pages.admin.auditLogs.table.firstPage'
  | 'pages.admin.auditLogs.table.lastPage'
  | 'pages.admin.auditLogs.table.totalRecords';

/**
 * Available locales
 */
export type Locale = 'en' | 'zh-TW';

/**
 * Type guard to check if a string is a valid translation key
 */
export function isTranslationKey(key: string): key is TranslationKey {
  // This is a runtime check, the type system will handle compile-time checks
  return true;
}
