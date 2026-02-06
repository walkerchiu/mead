'use client';

import { useQuery } from '@apollo/client/react';
import { SESSION_STATISTICS_QUERY } from '@/lib/session-management-queries';

interface UseSessionStatisticsOptions {
  authReady?: boolean;
  pollInterval?: number; // 自動刷新間隔（毫秒）
}

interface SessionStatistics {
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
    details?: Record<string, unknown>;
  }>;
}

interface SessionStatisticsQueryResponse {
  sessionStatistics?: SessionStatistics;
}

export const useSessionStatistics = ({
  authReady = true,
  pollInterval = 30000, // 預設 30 秒刷新一次
}: UseSessionStatisticsOptions = {}) => {
  const { data, loading, error, refetch } =
    useQuery<SessionStatisticsQueryResponse>(SESSION_STATISTICS_QUERY, {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      skip: !authReady,
      pollInterval: pollInterval > 0 ? pollInterval : undefined,
    });

  return {
    statistics: data?.sessionStatistics,
    loading,
    error,
    refetch,
  };
};
