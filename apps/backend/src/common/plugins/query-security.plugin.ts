import * as depthLimit from 'graphql-depth-limit';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { GraphQLError } from 'graphql';
import { logger } from '../services/logger.service';

// 深度限制：預設最大 5 層
export const createDepthLimitRule = (maxDepth = 5) => {
  return (depthLimit as any)(maxDepth, {
    ignore: [/^__/], // 忽略內省查詢（introspection）
  });
};

// 複雜度限制插件
export const createComplexityPlugin = (maxComplexity = 100) => {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document, schema }) {
          const complexity = getComplexity({
            schema,
            operationName: request.operationName,
            query: document,
            variables: request.variables,
            estimators: [
              fieldExtensionsEstimator(),
              simpleEstimator({ defaultComplexity: 1 }),
            ],
          });

          if (complexity > maxComplexity) {
            throw new GraphQLError(
              `查詢過於複雜：${complexity}。最大允許複雜度為 ${maxComplexity}`,
              {
                extensions: {
                  code: 'QUERY_TOO_COMPLEX',
                  complexity,
                  maxComplexity,
                },
              },
            );
          }

          logger.debug(`Query Complexity: ${complexity}`);
        },
      };
    },
  };
};
