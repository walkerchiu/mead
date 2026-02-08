import { PageInfo } from '../types/pagination.types';

/**
 * 分頁結果介面
 */
export interface PaginationResult<T> {
  data: T[];
  pageInfo: PageInfo;
}

/**
 * 計算分頁資訊
 *
 * @param data 當前頁資料
 * @param totalCount 總筆數
 * @param page 當前頁碼
 * @param limit 每頁筆數
 * @returns 完整的分頁結果
 */
export function createPaginationResult<T>(
  data: T[],
  totalCount: number,
  page: number,
  limit: number,
): PaginationResult<T> {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: data,
    pageInfo: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * 計算 SKIP 值（用於 Prisma）
 *
 * @param page 頁碼
 * @param limit 每頁筆數
 * @returns skip 值
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
