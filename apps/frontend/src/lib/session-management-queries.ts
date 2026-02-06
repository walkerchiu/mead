import { gql } from '@apollo/client';

// ==========================================
// Queries
// ==========================================

/**
 * 查詢所有會話（管理員）
 * 權限：sessions:read_all
 */
export const SESSIONS_QUERY = gql`
  query Sessions(
    $filters: SessionFiltersInput
    $pagination: SessionPaginationInput
  ) {
    sessions(filters: $filters, pagination: $pagination) {
      data {
        id
        userId
        userName
        userEmail
        status
        deviceInfo
        browser
        os
        ipAddress
        location
        createdAt
        lastUsedAt
        expiresAt
        revokedAt
        revokedBy
        revokedByName
        revokedReason
        revokedMethod
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
        limit
        totalCount
      }
    }
  }
`;

/**
 * 查詢特定用戶的會話
 * 權限：sessions:read_user OR sessions:read
 */
export const USER_SESSIONS_QUERY = gql`
  query UserSessions(
    $userId: String!
    $filters: SessionFiltersInput
    $pagination: SessionPaginationInput
  ) {
    userSessions(userId: $userId, filters: $filters, pagination: $pagination) {
      data {
        id
        userId
        userName
        userEmail
        status
        deviceInfo
        browser
        os
        ipAddress
        location
        createdAt
        lastUsedAt
        expiresAt
        revokedAt
        revokedBy
        revokedByName
        revokedReason
        revokedMethod
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
        limit
        totalCount
      }
    }
  }
`;

/**
 * 查詢當前用戶的會話
 * 權限：sessions:read
 */
export const MY_SESSIONS_QUERY = gql`
  query MySessions(
    $filters: SessionFiltersInput
    $pagination: SessionPaginationInput
  ) {
    mySessions(filters: $filters, pagination: $pagination) {
      data {
        id
        status
        deviceInfo
        browser
        os
        ipAddress
        location
        createdAt
        lastUsedAt
        expiresAt
        revokedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
        limit
        totalCount
      }
    }
  }
`;

/**
 * 查詢單個會話詳情
 * 權限：sessions:read_all OR sessions:read
 */
export const SESSION_DETAILS_QUERY = gql`
  query SessionDetails($sessionId: String!) {
    sessionDetails(sessionId: $sessionId) {
      id
      userId
      userName
      userEmail
      status
      deviceInfo
      browser
      os
      ipAddress
      location
      createdAt
      lastUsedAt
      expiresAt
      revokedAt
      revokedBy
      revokedByName
      revokedReason
      revokedMethod
    }
  }
`;

/**
 * 查詢會話統計資訊
 * 權限：sessions:read_all
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
 * 權限：sessions:read_all
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
 * 權限：sessions:revoke OR sessions:read
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
 * 撤銷特定用戶的所有會話
 * 權限：sessions:revoke_user
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
 * 權限：sessions:revoke_batch
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
 * 撤銷其他設備的會話（保留當前設備）
 * 權限：sessions:read
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
 * 全域撤銷所有會話（緊急功能）
 * 權限：sessions:revoke_all
 */
export const REVOKE_ALL_SESSIONS_MUTATION = gql`
  mutation RevokeAllSessions($message: String!) {
    revokeAllSessions(message: $message) {
      success
      revokedCount
      message
      affectedSessionIds
    }
  }
`;
