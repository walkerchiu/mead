// ==========================================
// Session Management Types & Interfaces
// ==========================================

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum RevokedMethod {
  USER_LOGOUT = 'USER_LOGOUT',
  HQ_FORCE = 'HQ_FORCE',
  BATCH_REVOKE = 'BATCH_REVOKE',
  AUTO_EXPIRE = 'AUTO_EXPIRE',
  SECURITY_MEASURE = 'SECURITY_MEASURE',
}

// ==========================================
// Session Detail Types
// ==========================================

// Session detail with included relations
export interface SessionDetail {
  id: string;
  userId: string;
  refreshTokenHash: string;
  deviceInfo: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  lastUsedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokedMethod: string | null;
  revokedReason: string | null;
  status?: SessionStatus;
  isActive?: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    accessScopes: string[];
  };
  revoker?: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

// Page info for pagination
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
  limit: number;
  totalCount: number;
}

// Session list result with pagination
export interface SessionListResult {
  data: SessionDetail[];
  pageInfo: PageInfo;
}

// ==========================================
// Filters & Options
// ==========================================

export interface SessionFilters {
  userId?: string; // 保留向後兼容
  userSearch?: string; // 統一用戶搜尋 (email、名稱或 ID)
  ipAddress?: string;
  deviceType?: string;
  deviceInfo?: string; // 支援前端的 deviceInfo 搜尋
  browser?: string;
  location?: string;
  status?: SessionStatus;
  revokedMethod?: RevokedMethod; // 撤銷方式篩選
  createdAfter?: Date;
  createdBefore?: Date;
  lastUsedAfter?: Date;
}

export interface RevokeSessionOptions {
  exceptCurrentSession?: boolean;
  exceptSessionIds?: string[];
  onlyBefore?: Date;
  sendNotification?: boolean;
  notificationMessage?: string;
}

export interface BatchRevokeCriteria {
  sessionIds?: string[];
  userIds?: string[];
  ipAddress?: string;
  deviceInfo?: string;
  createdBefore?: Date;
  inactiveSince?: Date;
}

// ==========================================
// Pagination
// ==========================================

export interface PaginationInput {
  page?: number;
  perPage?: number;
}

export interface PaginationInfo {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==========================================
// Results
// ==========================================

export interface SessionRevocationResult {
  success: boolean;
  revokedCount: number;
  notificationsSent?: number;
  message: string;
  failedSessionIds?: string[];
  affectedSessionIds?: string[];
}

export interface SessionConnection {
  nodes: unknown[];
  pageInfo: PaginationInfo;
  totalCount: number;
}

// ==========================================
// Revoke Options (for Service methods)
// ==========================================

export interface RevokeSessionParams {
  sessionId: string;
  hqId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
}

export interface RevokeUserSessionsParams {
  userId: string;
  hqId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
  options?: RevokeUserSessionsOptions;
  currentSessionId?: string; // 排除當前會話
}

export interface RevokeUserSessionsOptions {
  excludeCurrent?: boolean;
  deviceInfo?: string;
  ipAddress?: string;
  olderThan?: Date;
}

export interface RevokeBatchSessionsParams {
  hqId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
  criteria: BatchRevokeCriteria;
  currentSessionId?: string; // 排除管理員當前會話
}

export interface RevokeOtherDevicesParams {
  userId: string;
  currentSessionId: string;
  reason?: string;
}

// ==========================================
// Statistics
// ==========================================

export interface SessionStatistics {
  totalActive: number;
  totalRevoked: number;
  totalExpired: number;
  todayLogins: number;
  todayRevocations: number;
  byUser: UserSessionCount[];
  byDevice: DeviceSessionCount[];
  byLocation: LocationSessionCount[];
  byScope: ScopeSessionCount[];
  recentActivities: RecentActivity[];
  averageSessionDuration: number;
}

export interface UserSessionCount {
  userId: string;
  userName: string;
  email: string;
  count: number;
  lastActivity: Date;
}

export interface DeviceSessionCount {
  deviceType: string;
  count: number;
}

export interface LocationSessionCount {
  location: string;
  count: number;
}

export interface ScopeSessionCount {
  scope: string;
  count: number;
  activeCount: number;
}

export interface RecentActivity {
  sessionId: string;
  userId: string;
  userName: string | null;
  activityType: string;
  timestamp: Date;
  details?: any;
}

// ==========================================
// Notification
// ==========================================

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  profile?: {
    language?: string;
  } | null;
}

interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  lastUsedAt: Date;
  user: UserInfo;
}

interface HQInfo {
  id: string;
  email: string;
  name: string | null;
}

export interface SessionNotificationParams {
  session: SessionInfo;
  hq: HQInfo;
  reason: string;
  customMessage?: string;
}

export interface BatchSessionNotificationParams {
  user: UserInfo;
  hq: HQInfo;
  sessions: SessionInfo[];
  reason: string;
  customMessage?: string;
}
