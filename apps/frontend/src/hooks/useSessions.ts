'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { SESSIONS_QUERY } from '@/lib/session-management-queries';

interface SessionFilters {
  userId?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastUsedAfter?: string;
  lastUsedBefore?: string;
  revokedBy?: string;
  revokedAfter?: string;
}

export interface UseSessionsOptions {
  filters?: SessionFilters;
  authReady?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: string;
  ipAddress: string;
  deviceInfo: string;
  location: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedByName?: string;
  revokedReason?: string;
  revokedMethod?: string;
  browser?: string;
  os?: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
  limit: number;
  totalCount: number;
}

export interface SessionsQueryResponse {
  sessions?: {
    data: Session[];
    pageInfo: PageInfo;
  };
}

export const useSessions = ({
  filters = {},
  authReady = true,
}: UseSessionsOptions) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const { data, loading, error, refetch } = useQuery<SessionsQueryResponse>(
    SESSIONS_QUERY,
    {
      variables: {
        filters,
        pagination: {
          page: currentPage,
          limit: pageSize,
        },
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      skip: !authReady,
    },
  );

  const sessions = data?.sessions?.data || [];
  const pageInfo = data?.sessions?.pageInfo;

  const wrappedRefetch = useCallback(() => {
    return refetch({
      filters,
      pagination: {
        page: currentPage,
        limit: pageSize,
      },
    });
  }, [filters, refetch, pageSize, currentPage]);

  return {
    sessions,
    pageInfo,
    loading,
    error,
    page: currentPage,
    setPage: setCurrentPage,
    refetch: wrappedRefetch,
  };
};
