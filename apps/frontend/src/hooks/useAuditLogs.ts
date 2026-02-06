'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { AUDIT_LOGS_PAGINATED_QUERY } from '@/lib/audit-logs-queries';

interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  status?: string;
}

interface UseAuditLogsOptions {
  filters: AuditLogFilters;
  authReady?: boolean;
}

interface AuditLog {
  id: string;
  requestId: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  status: string;
  timestamp: string;
  [key: string]: unknown;
}

interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface AuditLogsPaginatedQueryData {
  auditLogsPaginated: {
    data: AuditLog[];
    pageInfo: PageInfo;
  };
}

export const useAuditLogs = ({
  filters,
  authReady = true,
}: UseAuditLogsOptions) => {
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } =
    useQuery<AuditLogsPaginatedQueryData>(AUDIT_LOGS_PAGINATED_QUERY, {
      variables: {
        pagination: {
          page,
          limit: 50,
        },
        ...filters,
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      skip: !authReady,
    });

  const logs = data?.auditLogsPaginated?.data || [];

  const wrappedRefetch = useCallback(() => {
    const variables = {
      pagination: {
        page,
        limit: 50,
      },
      ...filters,
    };

    console.log('[Audit Log Refetch] Fetching with variables:', variables);

    return refetch(variables).then((result) => {
      console.log('[Audit Log Refetch] Result:', {
        dataCount: result.data?.auditLogsPaginated?.data?.length || 0,
        pageInfo: result.data?.auditLogsPaginated?.pageInfo,
        firstItem: result.data?.auditLogsPaginated?.data?.[0],
      });
      return result;
    });
  }, [page, filters, refetch]);

  return {
    logs,
    pageInfo: data?.auditLogsPaginated?.pageInfo,
    page,
    setPage,
    loading,
    error,
    refetch: wrappedRefetch,
  };
};
