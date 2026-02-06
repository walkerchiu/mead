// Auto-generated file. Do not edit manually.
// Generated from messages/en.json

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
    refresh: string;
    clear: string;
    close: string;
    settings: string;
    processing: string;
    previous: string;
    next: string;
    error: {
      loadFailed: string;
      permissionDenied: string;
      permissionDeniedMessage: string;
      permissionDeniedDescription: string;
      backToHome: string;
    };
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
      alreadyUsed: string;
    };
    password: {
      required: string;
      minLength: string;
      uppercase: string;
      lowercase: string;
      number: string;
      specialChar: string;
      mismatch: string;
      currentIncorrect: string;
      mustBeDifferent: string;
    };
    name: {
      maxLength: string;
    };
    bio: {
      maxLength: string;
    };
    website: {
      invalid: string;
    };
    language: {
      invalid: string;
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
        auditLogs: {
          title: string;
          description: string;
          action: string;
        };
        sessions: {
          title: string;
          description: string;
          action: string;
        };
      };
    };
    settings: {
      navigation: {
        profile: string;
        security: string;
      };
      security: {
        title: string;
        description: string;
      };
      profile: {
        title: string;
        description: string;
        basicInfo: string;
        profileDetails: string;
        changePassword: string;
        email: string;
        emailHelper: string;
        name: string;
        nameHelper: string;
        bio: string;
        bioHelper: string;
        phone: string;
        phoneHelper: string;
        address: string;
        addressHelper: string;
        website: string;
        websiteHelper: string;
        language: string;
        languageHelper: string;
        currentPassword: string;
        currentPasswordHelper: string;
        newPassword: string;
        newPasswordHelper: string;
        confirmPassword: string;
        confirmPasswordHelper: string;
        revokeOtherDevices: string;
        revokeOtherDevicesHelper: string;
        updateSuccess: string;
        updateProfileSuccess: string;
        updateDetailsSuccess: string;
        passwordChanged: string;
        updateError: string;
      };
    };
    admin: {
      auditLogs: {
        title: string;
        description: string;
        refresh: string;
        newLogs: string;
        newLogsOnOtherPage: string;
        viewNew: string;
        loadError: string;
        noData: string;
        loading: string;
        filters: {
          title: string;
          userId: string;
          userIdPlaceholder: string;
          action: string;
          actionPlaceholder: string;
          actionHelper: string;
          entity: string;
          entityPlaceholder: string;
          entityHelper: string;
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
      sessions: {
        title: string;
        description: string;
        sessionList: string;
        batchRevoke: string;
        stats: {
          activeCount: string;
          revokedCount: string;
          expiredCount: string;
          topDevice: string;
          sessions: string;
          noData: string;
        };
        filters: {
          title: string;
          userId: string;
          userIdPlaceholder: string;
          status: string;
          ipAddress: string;
          ipAddressPlaceholder: string;
          deviceInfo: string;
          deviceInfoPlaceholder: string;
          location: string;
          locationPlaceholder: string;
          statuses: {
            active: string;
            expired: string;
            revoked: string;
          };
        };
        table: {
          user: string;
          status: string;
          device: string;
          ipAddress: string;
          location: string;
          createdAt: string;
          lastUsedAt: string;
          actions: string;
          viewDetails: string;
          revokeSession: string;
          totalCount: string;
          noSessions: string;
          noSessionsDescription: string;
          revokeSuccess: string;
          statuses: {
            active: string;
            expired: string;
            revoked: string;
          };
        };
        details: {
          title: string;
          userInfo: string;
          userName: string;
          userEmail: string;
          userId: string;
          deviceInfo: string;
          browser: string;
          os: string;
          deviceDetails: string;
          locationInfo: string;
          ipAddress: string;
          location: string;
          timeInfo: string;
          createdAt: string;
          lastUsedAt: string;
          expiresAt: string;
          revocationInfo: string;
          revokedAt: string;
          revokedBy: string;
          revokerEmail: string;
          revokedReason: string;
          revokedMethod: string;
          sessionId: string;
          revokeSession: string;
          statuses: {
            active: string;
            expired: string;
            revoked: string;
          };
        };
        revokeModal: {
          title: string;
          warning: string;
          targetUser: string;
          reason: string;
          reasonPlaceholder: string;
          sendNotification: string;
          customMessage: string;
          customMessagePlaceholder: string;
          customMessageHelp: string;
          confirm: string;
          defaultReason: string;
          error: string;
          errorMessage: string;
          errors: {
            sessionNotFound: string;
            sessionAlreadyRevoked: string;
            cannotRevokeAdmin: string;
            cannotRevokeCurrent: string;
            notAuthenticated: string;
            ownSessionsOnly: string;
            userNotFound: string;
          };
        };
        batchRevokeModal: {
          title: string;
          warning: string;
          tabs: {
            criteria: string;
            options: string;
          };
          criteriaDescription: string;
          userIds: string;
          userIdsPlaceholder: string;
          userIdsHelp: string;
          ipAddress: string;
          ipAddressPlaceholder: string;
          ipAddressHelp: string;
          deviceInfo: string;
          deviceInfoPlaceholder: string;
          deviceInfoHelp: string;
          inactiveDays: string;
          inactiveDaysHelp: string;
          createdBeforeDays: string;
          createdBeforeDaysHelp: string;
          reason: string;
          reasonPlaceholder: string;
          sendNotification: string;
          notificationInfo: string;
          customMessage: string;
          customMessagePlaceholder: string;
          customMessageHelp: string;
          confirm: string;
          defaultReason: string;
          error: string;
        };
        revokeOtherDevicesModal: {
          title: string;
          info: string;
          description: string;
          currentDevice: string;
          currentDeviceDescription: string;
          reason: string;
          reasonPlaceholder: string;
          reasonHelp: string;
          confirm: string;
          defaultReason: string;
          error: string;
        };
      };
    };
  };
}

declare global {
  interface IntlMessages extends Messages {}
}
