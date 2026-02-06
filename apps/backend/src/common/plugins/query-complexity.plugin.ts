import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { logger } from '../services/logger.service';

/**
 * GraphQL Query Complexity Plugin
 *
 * 防止過於複雜的查詢導致 DoS 攻擊或效能問題
 *
 * 複雜度計算方式：
 * - 每個欄位: 1 分
 * - 陣列欄位: 根據請求數量 × 欄位複雜度
 * - 可在 Schema 中使用 @complexity 指令自定義
 *
 * @example
 * ```graphql
 * type Query {
 *   users(limit: Int!): [User!]! @complexity(multipliers: ["limit"])
 * }
 * ```
 */
@Plugin()
export class QueryComplexityPlugin implements ApolloServerPlugin {
  private readonly maxComplexity: number;
  private readonly logThreshold: number;

  constructor() {
    // 從環境變數讀取，或使用預設值
    this.maxComplexity = parseInt(
      process.env.GRAPHQL_MAX_COMPLEXITY || '1000',
      10,
    );
    this.logThreshold = parseInt(
      process.env.GRAPHQL_COMPLEXITY_LOG_THRESHOLD || '500',
      10,
    );

    logger.info(
      `[QueryComplexityPlugin] Max complexity: ${this.maxComplexity}, Log threshold: ${this.logThreshold}`,
    );
  }

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const maxComplexity = this.maxComplexity;
    const logThreshold = this.logThreshold;

    return {
      async didResolveOperation({ request, document, schema }) {
        const complexity = getComplexity({
          schema: schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            // 優先使用 field extensions (@complexity 指令)
            fieldExtensionsEstimator(),
            // 後備使用簡單估算器（每個欄位 1 分）
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        // 記錄高複雜度查詢
        if (complexity >= logThreshold) {
          logger.warn(
            `[QueryComplexity] High complexity query detected: ${complexity}`,
            {
              operationName: request.operationName,
              complexity,
              maxComplexity,
            },
          );
        }

        // 拒絕超過限制的查詢
        if (complexity > maxComplexity) {
          logger.error(
            `[QueryComplexity] Query rejected - complexity ${complexity} exceeds max ${maxComplexity}`,
            {
              operationName: request.operationName,
              complexity,
              maxComplexity,
            },
          );

          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
            {
              extensions: {
                code: 'QUERY_TOO_COMPLEX',
                complexity,
                maxComplexity,
              },
            },
          );
        }

        // 正常情況記錄 debug 資訊
        logger.debug(
          `[QueryComplexity] Query complexity: ${complexity}/${maxComplexity}`,
          {
            operationName: request.operationName,
            complexity,
          },
        );
      },
    };
  }
}
