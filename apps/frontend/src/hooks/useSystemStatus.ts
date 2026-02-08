import { useQuery, useSubscription } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import {
  GET_SYSTEM_HEALTH,
  ON_SYSTEM_STATUS_CHANGED,
  SystemHealth,
  SystemStatus,
  ServiceFilterInput,
} from '@/graphql/system-status';

/**
 * useSystemStatus Hook
 *
 * 整合系統狀態查詢和訂閱功能
 *
 * @param options.autoSubscribe - 是否自動訂閱狀態變更（預設: true）
 * @param options.filter - 訂閱篩選條件
 * @returns 系統狀態資料和相關方法
 */
export function useSystemStatus(options?: {
  autoSubscribe?: boolean;
  filter?: ServiceFilterInput;
}) {
  const { autoSubscribe = true, filter } = options || {};

  // 查詢系統健康狀態
  const {
    data: healthData,
    loading,
    error,
    refetch,
  } = useQuery<{ systemHealth: SystemHealth }>(GET_SYSTEM_HEALTH, {
    // 每 30 秒輪詢一次
    pollInterval: 30000,
  });

  // 訂閱系統狀態變更
  const { data: subscriptionData } = useSubscription<{
    systemStatusChanged: SystemStatus;
  }>(ON_SYSTEM_STATUS_CHANGED, {
    variables: { filter },
    skip: !autoSubscribe,
  });

  // 本地狀態：合併查詢和訂閱的資料
  const [services, setServices] = useState<SystemStatus[]>([]);

  // 初始化服務狀態
  useEffect(() => {
    if (healthData?.systemHealth?.services) {
      setServices(healthData.systemHealth.services);
    }
  }, [healthData]);

  // 處理訂閱更新
  useEffect(() => {
    if (subscriptionData?.systemStatusChanged) {
      const updatedStatus = subscriptionData.systemStatusChanged;

      setServices((prevServices) => {
        // 找到並更新對應的服務狀態
        const index = prevServices.findIndex(
          (s) => s.service === updatedStatus.service,
        );

        if (index !== -1) {
          const newServices = [...prevServices];
          newServices[index] = updatedStatus;
          return newServices;
        }

        // 如果找不到，添加新服務
        return [...prevServices, updatedStatus];
      });
    }
  }, [subscriptionData]);

  return {
    systemHealth: healthData?.systemHealth,
    services,
    loading,
    error,
    refetch,
  };
}
