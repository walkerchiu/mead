'use client';

import { useMutation } from '@apollo/client/react';
import {
  REVOKE_SESSION_MUTATION,
  REVOKE_USER_SESSIONS_MUTATION,
  REVOKE_BATCH_SESSIONS_MUTATION,
  REVOKE_OTHER_DEVICES_MUTATION,
  REVOKE_ALL_SESSIONS_MUTATION,
} from '@/lib/session-management-queries';

// Type definitions for mutation responses
interface RevokeSessionResponse {
  revokeSession?: {
    success: boolean;
    message: string;
    sessionId: string;
  };
}

interface RevokeUserSessionsResponse {
  revokeUserSessions?: {
    success: boolean;
    revokedCount: number;
    message: string;
  };
}

interface RevokeBatchSessionsResponse {
  revokeBatchSessions?: {
    success: boolean;
    revokedCount: number;
    message: string;
    affectedSessionIds: string[];
  };
}

interface RevokeOtherDevicesResponse {
  revokeOtherDevices?: {
    success: boolean;
    revokedCount: number;
    message: string;
    affectedSessionIds: string[];
  };
}

interface RevokeAllSessionsResponse {
  revokeAllSessions?: {
    success: boolean;
    revokedCount: number;
    message: string;
  };
}

/**
 * 撤銷單個會話
 */
export const useRevokeSession = () => {
  const [revokeSession, { loading, error }] =
    useMutation<RevokeSessionResponse>(REVOKE_SESSION_MUTATION, {
      refetchQueries: ['Sessions', 'SessionStatistics'],
    });

  return {
    revokeSession,
    loading,
    error,
  };
};

/**
 * 撤銷特定用戶的所有會話
 */
export const useRevokeUserSessions = () => {
  const [revokeUserSessions, { loading, error }] =
    useMutation<RevokeUserSessionsResponse>(REVOKE_USER_SESSIONS_MUTATION, {
      refetchQueries: ['Sessions', 'UserSessions', 'SessionStatistics'],
    });

  return {
    revokeUserSessions,
    loading,
    error,
  };
};

/**
 * 批量撤銷會話
 */
export const useRevokeBatchSessions = () => {
  const [revokeBatchSessions, { loading, error }] =
    useMutation<RevokeBatchSessionsResponse>(REVOKE_BATCH_SESSIONS_MUTATION, {
      refetchQueries: ['Sessions', 'SessionStatistics'],
    });

  return {
    revokeBatchSessions,
    loading,
    error,
  };
};

/**
 * 撤銷其他設備的會話
 */
export const useRevokeOtherDevices = () => {
  const [revokeOtherDevices, { loading, error }] =
    useMutation<RevokeOtherDevicesResponse>(REVOKE_OTHER_DEVICES_MUTATION, {
      refetchQueries: ['MySessions', 'SessionStatistics'],
    });

  return {
    revokeOtherDevices,
    loading,
    error,
  };
};

/**
 * 全域撤銷所有會話（緊急功能）
 */
export const useRevokeAllSessions = () => {
  const [revokeAllSessions, { loading, error }] =
    useMutation<RevokeAllSessionsResponse>(REVOKE_ALL_SESSIONS_MUTATION, {
      refetchQueries: ['Sessions', 'SessionStatistics'],
    });

  return {
    revokeAllSessions,
    loading,
    error,
  };
};
