// Auto-generated file. Do not edit manually.
// Generated from messages/en.json

export interface Messages {
  common: {
    none: string;
    loading: string;
    submit: string;
    cancel: string;
    back: string;
    home: string;
    logout: string;
    save: string;
    saving: string;
    deleteSuccess: string;
    confirm: {};
    done: string;
    download: string;
    unknown: string;
    never: string;
    all: string;
    locale: string;
    refresh: string;
    refreshed: string;
    clear: string;
    clearAll: string;
    showingResults: string;
    totalResults: string;
    close: string;
    settings: string;
    processing: string;
    previous: string;
    next: string;
    copy: string;
    copied: string;
    yes: string;
    no: string;
    update: string;
    reset: string;
    creating: string;
    updating: string;
    resetting: string;
    rowsPerPage: string;
    error: {
      loadFailed: string;
      permissionDenied: string;
      permissionDeniedMessage: string;
      permissionDeniedDescription: string;
      backToHome: string;
      failed: string;
      createFailed: string;
      updateFailed: string;
      deleteFailed: string;
      restoreFailed: string;
      resetPasswordFailed: string;
    };
    scrollControl: {
      scrollUp: string;
      scrollDown: string;
      scrollToTop: string;
      scrollToBottom: string;
    };
    active: string;
    inactive: string;
    edit: string;
    delete: string;
    create: string;
    days: string;
    comingSoon: string;
    viewDetails: string;
    success: {};
    passwordStrength: {
      label: string;
      veryWeak: string;
      weak: string;
      medium: string;
      strong: string;
      veryStrong: string;
      requirements: string;
      minLength: string;
      uppercase: string;
      lowercase: string;
      number: string;
      specialChar: string;
    };
    columnManager: {
      title: string;
      reset: string;
    };
    breadcrumb: {
      home: string;
      dashboard: string;
      hq: string;
      auditLogs: string;
      users: string;
      sessions: string;
      cronJobs: string;
      settings: string;
      account: string;
      profile: string;
      security: string;
      tokens: string;
      notificationSettings: string;
      notifications: string;
    };
  };
  nav: {
    home: string;
    dashboard: string;
    settings: string;
    securitySettings: string;
  };
  sidebar: {
    dashboard: string;
    administration: string;
    users: string;
    auditLogs: string;
    sessions: string;
    cronJobs: string;
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
  form: {
    error: {
      default: string;
      validation: string;
    };
  };
  pages: {
    home: {
      title: string;
      subtitle: string;
      goToDashboard: string;
    };
    dashboard: {
      title: string;
      welcome: string;
      description: string;
      securitySettings: string;
      backToHome: string;
      loggedOut: string;
      greeting: {
        morning: string;
        afternoon: string;
        evening: string;
        today: string;
      };
      activityFeed: {
        title: string;
        empty: string;
        viewAll: string;
      };
      systemHealth: {
        title: string;
        subtitle: string;
        activeSessions: string;
        cronHealth: string;
        cronHealthy: string;
        cronHasFailures: string;
        viewDetails: string;
      };
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
        cronJobs: {
          title: string;
          description: string;
          action: string;
        };
        users: {
          title: string;
          description: string;
          action: string;
        };
      };
    };
    notificationCenter: {
      messages: {
        markAsReadSuccess: string;
        markAsReadError: string;
        markAllAsReadSuccess: string;
        markAllAsReadError: string;
        deleteSuccess: string;
        deleteError: string;
        deleteReadSuccess: string;
        deleteReadError: string;
      };
    };
    settings: {
      account: {
        title: string;
        description: string;
        email: string;
        emailHelper: string;
        name: string;
        nameHelper: string;
        updateSuccess: string;
        updateError: string;
      };
      profile: {
        title: string;
        description: string;
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
        updateSuccess: string;
        updateError: string;
      };
      security: {
        title: string;
        description: string;
        changePassword: string;
        currentPassword: string;
        currentPasswordHelper: string;
        newPassword: string;
        newPasswordHelper: string;
        confirmPassword: string;
        confirmPasswordHelper: string;
        passwordChanged: string;
      };
      tokens: {
        title: string;
        description: string;
        listTitle: string;
        createButton: string;
        emptyState: string;
        neverUsed: string;
        revokeButton: string;
        apiUsageHint: string;
        createSuccess: string;
        createError: string;
        revokeSuccess: string;
        revokeError: string;
        status: {
          active: string;
          expired: string;
          revoked: string;
        };
        scopes: {};
        expires: {
          '30days': string;
          '60days': string;
          '90days': string;
          '180days': string;
          '365days': string;
        };
        table: {
          name: string;
          token: string;
          scopes: string;
          lastUsed: string;
          expires: string;
          status: string;
          actions: string;
        };
        createDialog: {
          title: string;
          nameLabel: string;
          namePlaceholder: string;
          nameHelper: string;
          nameMinLength: string;
          nameMaxLength: string;
          scopesLabel: string;
          scopesHelper: string;
          scopesRequired: string;
          expiresLabel: string;
          submitButton: string;
        };
        tokenDialog: {
          title: string;
          warning: string;
          copy: string;
          copied: string;
          usageExample: string;
          closeButton: string;
        };
        revokeDialog: {
          title: string;
          message: string;
          confirmButton: string;
        };
      };
      sessions: {
        title: string;
        description: string;
        refresh: string;
        info: string;
        totalSessions: string;
        activeSessions: string;
        loadError: string;
      };
      notifications: {
        title: string;
        description: string;
        applyToAllDevices: string;
        types: {
          title: string;
          description: string;
          info: {
            label: string;
            helper: string;
          };
          success: {
            label: string;
            helper: string;
          };
          warning: {
            label: string;
            helper: string;
          };
          error: {
            label: string;
            helper: string;
          };
        };
        channels: {
          title: string;
          description: string;
          browser: {
            label: string;
            helper: string;
          };
          email: {
            label: string;
            helper: string;
          };
          push: {
            label: string;
            helper: string;
          };
        };
        advanced: {
          title: string;
          description: string;
          sound: {
            label: string;
            helper: string;
          };
          desktop: {
            label: string;
            helper: string;
          };
          mobile: {
            label: string;
            helper: string;
          };
        };
        saveSettings: string;
        warning: string;
        saveSuccess: string;
        saveErrorAbnormal: string;
        saveErrorBackend: string;
        noChanges: string;
        changesCancelled: string;
        unauthorized: string;
        loadError: string;
      };
      notificationCenter: {
        title: string;
        description: string;
        notificationList: string;
        loading: string;
        error: string;
        retry: string;
        endOfList: string;
        totalRecords: string;
        loadedOfTotal: string;
        empty: {
          title: string;
          description: string;
        };
        actions: {
          markAsRead: string;
          markAllAsRead: string;
          clearAll: string;
          viewAll: string;
          refresh: string;
        };
        filters: {
          title: string;
          search: string;
          searchPlaceholder: string;
          type: string;
          dateRange: string;
          all: string;
          read: string;
          unread: string;
        };
        types: {
          info: string;
          success: string;
          warning: string;
          error: string;
        };
        messages: {
          markAsReadSuccess: string;
          markAsReadError: string;
          markAllAsReadSuccess: string;
          markAllAsReadError: string;
          deleteSuccess: string;
          deleteError: string;
          deleteReadSuccess: string;
          deleteReadError: string;
        };
      };
    };
    hq: {
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
          userSearch: string;
          userSearchPlaceholder: string;
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
          logsTable: string;
          timestamp: string;
          user: string;
          action: string;
          entity: string;
          status: string;
          method: string;
          path: string;
          ip: string;
          ipAddress: string;
          duration: string;
          success: string;
          failure: string;
          unknown: string;
          noData: string;
          page: string;
          firstPage: string;
          lastPage: string;
          totalRecords: string;
          showingRecordsWithPage: string;
          actions: string;
          viewDetails: string;
        };
        details: {
          title: string;
          loadError: string;
          basicInfoTab: string;
          requestTab: string;
          responseTab: string;
          basicInfo: string;
          techInfo: string;
          errorInfo: string;
          timestamp: string;
          user: string;
          userId: string;
          unknown: string;
          action: string;
          entity: string;
          entityId: string;
          status: string;
          success: string;
          failure: string;
          requestId: string;
          method: string;
          path: string;
          ipAddress: string;
          userAgent: string;
          duration: string;
          copy: string;
          copied: string;
          requestData: string;
          responseData: string;
          errorResponse: string;
          errorDetails: string;
          noRequestData: string;
          noResponseData: string;
          exportJSON: string;
          exportCSV: string;
        };
      };
      sessions: {
        title: string;
        description: string;
        sessionList: string;
        batchRevoke: string;
        batchRevokeSuccess: string;
        batchRevokeNoMatch: string;
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
          userSearch: string;
          userSearchPlaceholder: string;
          status: string;
          ipAddress: string;
          ipAddressPlaceholder: string;
          deviceInfo: string;
          deviceInfoPlaceholder: string;
          location: string;
          locationPlaceholder: string;
          revokedMethod: string;
          revokedMethodHint: string;
          revokedMethods: {
            user_logout: string;
            hq_force: string;
            batch_revoke: string;
            auto_expire: string;
            security_measure: string;
          };
          statuses: {
            active: string;
            expired: string;
            revoked: string;
          };
        };
        table: {
          sessionsTable: string;
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
          totalRecords: string;
          showingRecordsWithPage: string;
          noSessions: string;
          noSessionsDescription: string;
          revokeSuccess: string;
          statuses: {
            active: string;
            expired: string;
            revoked: string;
          };
          revokedMethod: string;
          revokedMethods: {
            user_logout: string;
            hq_force: string;
            hq_force_with_name: string;
            batch_revoke: string;
            batch_revoke_with_name: string;
            auto_expire: string;
            security_measure: string;
          };
        };
        details: {
          title: string;
          currentSession: string;
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
          systemAutomatic: string;
          exportJSON: string;
          exportCSV: string;
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
            cannotRevokeHQ: string;
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
      cronJobs: {
        title: string;
        description: string;
        refresh: string;
        viewNewExecutions: string;
        newExecutionsAlert: string;
        loadError: string;
        triggerSuccess: string;
        triggerError: string;
        toggleSuccess: string;
        toggleError: string;
        stats: {
          totalExecutions: string;
          successRate: string;
          failedExecutions: string;
          averageDuration: string;
        };
        listFilters: {
          title: string;
          category: string;
          type: string;
          all: string;
        };
        executionFilters: {
          title: string;
          job: string;
          status: string;
          all: string;
          statuses: {
            success: string;
            failed: string;
            timeout: string;
            running: string;
            skipped: string;
          };
        };
        table: {
          title: string;
          jobName: string;
          category: string;
          type: string;
          schedule: string;
          lastExecution: string;
          status: string;
          successRate: string;
          consecutiveFailures: string;
          enabled: string;
          actions: string;
          trigger: string;
          viewDetails: string;
          noJobs: string;
          triggerDialog: {
            title: string;
            jobName: string;
            description: string;
            jobDisabledWarning: string;
            normalMode: {
              title: string;
              description: string;
              check1: string;
              check2: string;
            };
            forceMode: {
              title: string;
              description: string;
              skip1: string;
              skip2: string;
              warning: string;
            };
            auditLogNote: string;
            cancel: string;
            normalExecute: string;
            forceExecute: string;
          };
          statuses: {
            success: string;
            failed: string;
            timeout: string;
            running: string;
            skipped: string;
            enabled: string;
            disabled: string;
          };
        };
        executionHistory: {
          title: string;
          job: string;
          startTime: string;
          endTime: string;
          duration: string;
          status: string;
          processedSuccessFailed: string;
          instance: string;
          actions: string;
          viewDetails: string;
          noExecutions: string;
          totalRecords: string;
          showingRecordsWithPage: string;
          showingRecords: string;
        };
        executionDetails: {
          title: string;
          basicInfoTab: string;
          errorDetailsTab: string;
          executionDetailsTab: string;
          basicInfo: string;
          jobName: string;
          jobType: string;
          duration: string;
          instanceId: string;
          lockId: string;
          executionData: string;
          processedCount: string;
          successCount: string;
          errorCount: string;
          timeline: string;
          startedAt: string;
          completedAt: string;
          nextRunAt: string;
          errorDetails: string;
          errorStack: string;
          executionDetails: string;
          exportJSON: string;
          exportCSV: string;
        };
        configDetails: {
          basicInfoTab: string;
          configImpactTab: string;
          statisticsTab: string;
          basicInfo: string;
          jobName: string;
          type: string;
          category: string;
          description: string;
          schedule: string;
          cronExpression: string;
          timeZone: string;
          nextRun: string;
          lastExecution: string;
          configuration: string;
          status: string;
          enabled: string;
          disabled: string;
          timeout: string;
          alertOnFailure: string;
          failureThreshold: string;
          times: string;
          statistics: string;
          totalExecutions: string;
          successRate: string;
          consecutiveFailures: string;
          lastStatus: string;
          lastDuration: string;
          dataRetention: string;
          deletionType: string;
          exportJSON: string;
          exportCSV: string;
          impacts: {
            title: string;
            softDelete: string;
            hardDelete: string;
            session: {
              title: string;
              description: string;
              impact1: string;
              impact2: string;
              impact3: string;
              retention: string;
            };
            auditLog: {
              title: string;
              description: string;
              impact1: string;
              impact2: string;
              impact3: string;
              retention: string;
            };
            notification: {
              title: string;
              description: string;
              impact1: string;
              impact2: string;
              impact3: string;
              retention: string;
            };
            default: {
              title: string;
              description: string;
            };
          };
        };
      };
      users: {
        title: string;
        description: string;
        createUser: string;
        editUser: string;
        resetPassword: string;
        createSuccess: string;
        updateSuccess: string;
        deleteSuccess: string;
        restoreSuccess: string;
        resetPasswordSuccess: string;
        noUsers: string;
        noChanges: string;
        active: string;
        locked: string;
        permanentLock: string;
        deleted: string;
        lockSuccess: string;
        unlockSuccess: string;
        createUserHint: string;
        editUserHint: string;
        resetPasswordWarning: string;
        resetPasswordFor: string;
        table: {
          name: string;
          email: string;
          accessScopes: string;
          lastLoginAt: string;
          roles: string;
          status: string;
          actions: string;
        };
        menu: {
          edit: string;
          resetPassword: string;
          manageRoles: string;
          lock: string;
          unlock: string;
          delete: string;
          restore: string;
        };
        form: {
          email: string;
          name: string;
          password: string;
          newPassword: string;
          confirmPassword: string;
          passwordHint: string;
          revokeAllSessions: string;
          revokeAllSessionsHint: string;
        };
        filters: {
          title: string;
          search: string;
          searchPlaceholder: string;
          accessScope: string;
          status: string;
          role: string;
          accessScopes: {
            hq_scope: string;
            customer_scope: string;
            public_scope: string;
          };
          statuses: {
            active: string;
            locked: string;
            deleted: string;
          };
        };
        validation: {
          emailRequired: string;
          emailInvalid: string;
          nameRequired: string;
          nameTooLong: string;
          passwordRequired: string;
          passwordTooShort: string;
          confirmPasswordRequired: string;
          passwordMismatch: string;
        };
        deleteUserTitle: string;
        deleteWarning: string;
        targetUser: string;
        unnamed: string;
        deleteInfo: string;
        deleteConfirm: string;
        deleteError: string;
        deleteReason: string;
        deleteReasonPlaceholder: string;
        deleteReasonHelp: string;
        manageRoles: string;
        currentRoles: string;
        noRoles: string;
        assignRole: string;
        selectRole: string;
        assignSuccess: string;
        revokeSuccess: string;
        confirmRevoke: string;
        manageRolesFor: string;
      };
    };
  };
  components: {
    activityDiffModal: {
      title: string;
      before: string;
      after: string;
      empty: string;
      fields: {
        title: string;
        description: string;
        content: string;
        code: string;
        status: string;
        type: string;
        score: string;
        name: string;
        note: string;
      };
    };
    statusTransition: {
      confirmTitle: string;
      feedbackLabel: string;
      cancel: string;
      confirm: string;
    };
    fileUploader: {
      dragDrop: string;
      dropHere: string;
      browse: string;
      maxSize: string;
      uploaded: string;
      filesCount: string;
      maxFilesError: string;
      fileTooLargeError: string;
      fileTypeError: string;
    };
    notification: {
      new: string;
      justNow: string;
      clickToView: string;
      markAsRead: string;
      markedAsRead: string;
      delete: string;
      clearAll: string;
      confirmDeleteTitle: string;
      confirmDelete: string;
      deleteSuccess: string;
      deleteFailed: string;
      confirmMarkAllReadTitle: string;
      confirmMarkAllRead: string;
      confirmClearReadTitle: string;
      confirmClearRead: string;
      clearReadSuccess: string;
      clearReadFailed: string;
    };
    notificationMenu: {
      title: string;
      markAllAsRead: string;
      viewAll: string;
      clearAll: string;
      noNotifications: string;
      settings: string;
    };
    userMenu: {
      tooltip: string;
      account: string;
      profile: string;
      security: string;
      tokens: string;
      logout: string;
    };
    languageSwitcher: {
      tooltip: string;
    };
    settingsMenu: {
      title: string;
      appearance: string;
      theme: {
        light: string;
        dark: string;
        system: string;
      };
      help: string;
      about: string;
    };
    helpModal: {
      title: string;
      quickStart: string;
      quickStartDescription: string;
      faq: string;
      commonFeatures: string;
      needMoreHelp: string;
      needMoreHelpDescription: string;
      email: string;
      documentation: string;
    };
    aboutModal: {
      title: string;
      projectName: string;
      version: string;
      buildDate: string;
      projectDescription: string;
      description1: string;
      description2: string;
      mainFeatures: string;
      techStack: string;
      license: string;
      licenseText: string;
      copyright: string;
      contact: string;
      author: string;
    };
  };
}

declare global {
  interface IntlMessages extends Messages {}
}
