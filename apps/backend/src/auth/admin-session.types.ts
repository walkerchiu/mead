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
  ADMIN_FORCE = 'ADMIN_FORCE',
  BATCH_REVOKE = 'BATCH_REVOKE',
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
  userId?: string;
  ipAddress?: string;
  deviceType?: string;
  deviceInfo?: string; // 支援前端的 deviceInfo 搜尋
  browser?: string;
  location?: string;
  status?: SessionStatus;
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
  adminId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
}

export interface RevokeUserSessionsParams {
  userId: string;
  adminId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
  options?: RevokeUserSessionsOptions;
}

export interface RevokeUserSessionsOptions {
  excludeCurrent?: boolean;
  deviceInfo?: string;
  ipAddress?: string;
  olderThan?: Date;
}

export interface RevokeBatchSessionsParams {
  adminId: string;
  reason: string;
  sendNotification?: boolean;
  notificationMessage?: string;
  criteria: BatchRevokeCriteria;
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
  byUser: UserSessionCount[];
  byDevice: DeviceSessionCount[];
  byLocation: LocationSessionCount[];
  averageSessionDuration: number;
}

export interface UserSessionCount {
  userId: string;
  userName: string;
  email: string;
  count: number;
}

export interface DeviceSessionCount {
  deviceType: string;
  count: number;
}

export interface LocationSessionCount {
  location: string;
  count: number;
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

interface AdminInfo {
  id: string;
  email: string;
  name: string | null;
}

export interface SessionNotificationParams {
  session: SessionInfo;
  admin: AdminInfo;
  reason: string;
  customMessage?: string;
}

export interface BatchSessionNotificationParams {
  user: UserInfo;
  admin: AdminInfo;
  sessions: SessionInfo[];
  reason: string;
  customMessage?: string;
}
