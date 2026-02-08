import { gql } from '@apollo/client';

/**
 * SystemStatus Fragment
 */
export const SYSTEM_STATUS_FRAGMENT = gql`
  fragment SystemStatusFields on SystemStatusGQLType {
    service
    status
    message
    timestamp
    details
    responseTime
  }
`;

/**
 * Query: 取得系統整體健康狀態
 */
export const GET_SYSTEM_HEALTH = gql`
  ${SYSTEM_STATUS_FRAGMENT}
  query GetSystemHealth {
    systemHealth {
      overallStatus
      services {
        ...SystemStatusFields
      }
      checkedAt
      uptime
    }
  }
`;

/**
 * Subscription: 訂閱系統狀態變更
 */
export const ON_SYSTEM_STATUS_CHANGED = gql`
  ${SYSTEM_STATUS_FRAGMENT}
  subscription OnSystemStatusChanged($filter: ServiceFilterInput) {
    systemStatusChanged(filter: $filter) {
      ...SystemStatusFields
    }
  }
`;

/**
 * Service Type Enum
 */
export enum ServiceType {
  DATABASE = 'DATABASE',
  REDIS = 'REDIS',
  RABBITMQ = 'RABBITMQ',
  GRAPHQL = 'GRAPHQL',
}

/**
 * Service Status Enum
 */
export enum ServiceStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
}

/**
 * SystemStatus Interface
 */
export interface SystemStatus {
  service: ServiceType;
  status: ServiceStatus;
  message: string;
  timestamp: string;
  details?: string;
  responseTime?: number;
}

/**
 * SystemHealth Interface
 */
export interface SystemHealth {
  overallStatus: ServiceStatus;
  services: SystemStatus[];
  checkedAt: string;
  uptime: number;
}

/**
 * ServiceFilter Input
 */
export interface ServiceFilterInput {
  services?: ServiceType[];
  statuses?: ServiceStatus[];
}
