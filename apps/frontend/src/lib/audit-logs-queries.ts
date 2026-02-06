import { gql } from '@apollo/client';

// 分頁查詢稽核日誌
export const AUDIT_LOGS_PAGINATED_QUERY = gql`
  query AuditLogsPaginated(
    $pagination: PaginationInput!
    $userId: String
    $action: String
    $entity: String
    $status: String
  ) {
    auditLogsPaginated(
      pagination: $pagination
      userId: $userId
      action: $action
      entity: $entity
      status: $status
    ) {
      data {
        id
        requestId
        userId
        action
        entity
        entityId
        status
        method
        path
        ipAddress
        userAgent
        timestamp
        duration
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        limit
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// 訂閱新稽核日誌
export const AUDIT_LOG_CREATED_SUBSCRIPTION = gql`
  subscription AuditLogCreated {
    auditLogCreated {
      id
      requestId
      userId
      action
      entity
      entityId
      status
      method
      path
      ipAddress
      timestamp
      duration
    }
  }
`;

// 查詢統計資料
export const AUDIT_LOG_STATISTICS_QUERY = gql`
  query AuditLogStatistics {
    auditLogStatistics {
      total
      successCount
      failureCount
      successRate
      byAction {
        action
        count
      }
      byEntity {
        entity
        count
      }
    }
  }
`;
