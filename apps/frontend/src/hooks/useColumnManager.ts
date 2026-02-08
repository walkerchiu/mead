'use client';

import { useState, useCallback, useEffect } from 'react';

interface ColumnConfig {
  id: string;
  visible: boolean;
}

/**
 * 管理 DataTable 欄位的顯示/隱藏和順序，持久化到 localStorage。
 * @param storageKey localStorage 的 key
 * @param defaultColumns 預設欄位 ID 列表（按預設順序）
 * @param hiddenByDefault 預設隱藏的欄位 ID 列表
 */
export function useColumnManager(
  storageKey: string,
  defaultColumns: string[],
  hiddenByDefault: string[] = [],
) {
  const hiddenSet = new Set(hiddenByDefault);
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    if (typeof window === 'undefined') {
      return defaultColumns.map((id) => ({
        id,
        visible: !hiddenSet.has(id),
      }));
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ColumnConfig[] = JSON.parse(saved);
        const defaultSet = new Set(defaultColumns);
        // 移除已不存在的欄位，保留仍有效的欄位
        const validSaved = parsed.filter((c) => defaultSet.has(c.id));
        // 確保新增的欄位也會出現（append 到尾部）
        const savedIds = new Set(validSaved.map((c) => c.id));
        const merged = [
          ...validSaved,
          ...defaultColumns
            .filter((id) => !savedIds.has(id))
            .map((id) => ({ id, visible: !hiddenSet.has(id) })),
        ];
        return merged;
      }
    } catch {
      /* ignore parse error */
    }
    return defaultColumns.map((id) => ({
      id,
      visible: !hiddenSet.has(id),
    }));
  });

  // 持久化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(columns));
    }
  }, [columns, storageKey]);

  const toggleColumn = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, visible: !c.visible } : c)),
    );
  }, []);

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setColumns((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  const resetColumns = useCallback(() => {
    setColumns(
      defaultColumns.map((id) => ({ id, visible: !hiddenSet.has(id) })),
    );
  }, [defaultColumns, hiddenByDefault]);

  const visibleColumnIds = columns.filter((c) => c.visible).map((c) => c.id);

  return {
    columns,
    visibleColumnIds,
    toggleColumn,
    moveColumn,
    resetColumns,
  };
}
