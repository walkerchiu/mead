import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * 分頁資訊
 *
 * 提供完整的分頁資訊，包括：
 * - 當前頁碼
 * - 總頁數
 * - 總筆數
 * - 每頁筆數
 * - 是否有上/下一頁
 */
@ObjectType()
export class PageInfo {
  @Field(() => Int, { description: '當前頁碼（從 1 開始）' })
  currentPage: number;

  @Field(() => Int, { description: '總頁數' })
  totalPages: number;

  @Field(() => Int, { description: '總筆數' })
  totalCount: number;

  @Field(() => Int, { description: '每頁筆數' })
  limit: number;

  @Field({ description: '是否有下一頁' })
  hasNextPage: boolean;

  @Field({ description: '是否有上一頁' })
  hasPreviousPage: boolean;
}
