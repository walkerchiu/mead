import { gql } from '@apollo/client';

// ==========================================
// Fragments
// ==========================================

export const SESSION_FRAGMENT = gql`
  fragment SessionFields on SessionType {
    id
    userId
    userName
    userEmail
    deviceInfo
    browser
    os
    ipAddress
    location
    isActive
    isCurrent
    status
    lastUsedAt
    expiresAt
    createdAt
    revokedBy
    revokedByName
    revokedReason
    revokedMethod
    revokedAt
  }
`;

export const PAGE_INFO_FRAGMENT = gql`
  fragment PageInfoFields on PageInfo {
    hasNextPage
    hasPreviousPage
    currentPage
    totalPages
    limit
    totalCount
  }
`;

// ==========================================
// Queries
// ==========================================

// 註：AllSessions / UserSessions / MySessions / SessionDetails 等查詢請使用
// @/lib/session-management-queries 中的對應定義。

/**
 * 查詢會話統計資訊
 */
export const SESSION_STATISTICS_QUERY = gql`
  query SessionStatistics {
    sessionStatistics {
      totalSessions
      activeSessions
      totalRevoked
      totalExpired
      todayLogins
      todayRevocations
      byScope {
        scope
        count
        activeCount
      }
      topActiveUsers {
        userId
        userName
        userEmail
        sessionCount
        lastActivity
      }
      topDevices {
        deviceInfo
        count
      }
      recentActivities {
        sessionId
        userId
        userName
        activityType
        timestamp
        details
      }
    }
  }
`;

/**
 * 查詢活躍會話數量
 */
export const ACTIVE_SESSION_COUNT_QUERY = gql`
  query ActiveSessionCount {
    activeSessionCount
  }
`;

// ==========================================
// Mutations
// ==========================================

/**
 * 撤銷單個會話
 */
export const REVOKE_SESSION_MUTATION = gql`
  mutation RevokeSession($input: RevokeSessionInput!) {
    revokeSession(input: $input) {
      success
      revokedCount
      message
      affectedSessionIds
    }
  }
`;

/**
 * 撤銷用戶所有會話
 */
export const REVOKE_USER_SESSIONS_MUTATION = gql`
  mutation RevokeUserSessions($input: RevokeUserSessionsInput!) {
    revokeUserSessions(input: $input) {
      success
      revokedCount
      message
      affectedSessionIds
    }
  }
`;

/**
 * 批量撤銷會話
 */
export const REVOKE_BATCH_SESSIONS_MUTATION = gql`
  mutation RevokeBatchSessions($input: BatchRevokeInput!) {
    revokeBatchSessions(input: $input) {
      success
      revokedCount
      message
      affectedSessionIds
    }
  }
`;

/**
 * 撤銷其他設備會話
 */
export const REVOKE_OTHER_DEVICES_MUTATION = gql`
  mutation RevokeOtherDevices($input: RevokeOtherDevicesInput!) {
    revokeOtherDevices(input: $input) {
      success
      revokedCount
      message
      affectedSessionIds
    }
  }
`;

/**
 * 全域緊急撤銷
 */
export const REVOKE_ALL_SESSIONS_MUTATION = gql`
  mutation RevokeAllSessions($reason: String!, $notificationMessage: String!) {
    revokeAllSessions(
      reason: $reason
      notificationMessage: $notificationMessage
    ) {
      success
      revokedCount
      message
    }
  }
`;

// ==========================================
// TypeScript Types
// ==========================================

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export enum RevokedMethod {
  USER_LOGOUT = 'USER_LOGOUT',
  HQ_FORCE = 'HQ_FORCE',
  BATCH_REVOKE = 'BATCH_REVOKE',
  SECURITY_MEASURE = 'SECURITY_MEASURE',
  AUTO_EXPIRE = 'AUTO_EXPIRE',
}

export interface Session {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  deviceInfo?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  isActive: boolean;
  isCurrent?: boolean;
  status: SessionStatus;
  lastUsedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  revokedBy?: string;
  revokedByName?: string;
  revokedReason?: string;
  revokedMethod?: RevokedMethod;
  revokedAt?: Date;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
  limit: number;
  totalCount: number;
}

export interface PaginatedSessions {
  data: Session[];
  pageInfo: PageInfo;
}

export interface SessionFiltersInput {
  userId?: string;
  email?: string;
  status?: SessionStatus;
  revokedMethod?: RevokedMethod;
  ipAddress?: string;
  deviceType?: string;
  deviceInfo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  fromDate?: Date;
  toDate?: Date;
  lastUsedAfter?: Date;
  lastUsedBefore?: Date;
  expiredOnly?: boolean;
  revokedOnly?: boolean;
  revokedBy?: string;
}

export interface SessionPaginationInput {
  page?: number;
  limit?: number;
}

export interface RevokeSessionInput {
  sessionId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
}

export interface RevokeUserSessionsOptionsInput {
  excludeCurrent?: boolean;
  deviceInfo?: string;
  ipAddress?: string;
  olderThan?: Date;
}

export interface RevokeUserSessionsInput {
  userId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
  options?: RevokeUserSessionsOptionsInput;
}

export interface BatchRevokeCriteriaInput {
  sessionIds?: string[];
  userIds?: string[];
  ipAddress?: string;
  deviceInfo?: string;
  inactiveSince?: Date;
  createdBefore?: Date;
}

export interface BatchRevokeInput {
  criteria: BatchRevokeCriteriaInput;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
}

export interface RevokeOtherDevicesInput {
  currentSessionId: string;
  reason?: string;
}

export interface RevokeResult {
  success: boolean;
  revokedCount: number;
  message: string;
  affectedSessionIds?: string[];
}

export interface SessionStatistics {
  totalSessions: number;
  activeSessions: number;
  totalRevoked: number;
  totalExpired: number;
  todayLogins: number;
  todayRevocations: number;
  byScope: Array<{
    scope: string;
    count: number;
    activeCount: number;
  }>;
  topActiveUsers: Array<{
    userId: string;
    userName?: string;
    userEmail: string;
    sessionCount: number;
    lastActivity: Date;
  }>;
  topDevices: Array<{
    deviceInfo: string;
    count: number;
  }>;
  recentActivities: Array<{
    sessionId: string;
    userId: string;
    userName?: string;
    activityType: string;
    timestamp: Date;
    details?: any;
  }>;
}
