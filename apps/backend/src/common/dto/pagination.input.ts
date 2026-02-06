import { InputType, Field, Int } from '@nestjs/graphql';
import { Min, Max, IsInt } from 'class-validator';

/**
 * 分頁輸入參數
 *
 * 用於 Offset-based Pagination
 *
 * @example
 * ```graphql
 * query {
 *   usersPaginated(pagination: { page: 1, limit: 20 }) {
 *     data { id name }
 *     pageInfo { currentPage totalPages }
 *   }
 * }
 * ```
 */
@InputType()
export class PaginationInput {
  @Field(() => Int, {
    defaultValue: 1,
    description: '頁碼（從 1 開始）',
  })
  @IsInt({ message: '頁碼必須是整數' })
  @Min(1, { message: '頁碼必須大於 0' })
  page: number = 1;

  @Field(() => Int, {
    defaultValue: 20,
    description: '每頁筆數（最大 100）',
  })
  @IsInt({ message: '每頁筆數必須是整數' })
  @Min(1, { message: '每頁筆數必須大於 0' })
  @Max(100, { message: '每頁筆數不可超過 100' })
  limit: number = 20;
}
