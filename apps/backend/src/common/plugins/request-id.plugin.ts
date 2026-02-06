import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext,
} from '@apollo/server';
import { uuidv7 } from 'uuidv7';

/**
 * Request ID Plugin for GraphQL
 *
 * 為每個 GraphQL 請求生成或提取 Request ID
 * 並在響應 header 中返回
 */
@Plugin()
export class RequestIdPlugin implements ApolloServerPlugin {
  async requestDidStart(
    requestContext: GraphQLRequestContext<any>,
  ): Promise<GraphQLRequestListener<any>> {
    const { contextValue } = requestContext;

    // 從 header 中提取或生成新的 Request ID
    const requestId =
      contextValue.req?.headers['x-request-id'] ||
      contextValue.req?.requestId ||
      uuidv7();

    // 設定到 context 和 request 中
    if (contextValue.req) {
      contextValue.req.requestId = requestId;
    }
    contextValue.requestId = requestId;

    // 設定響應 header
    if (contextValue.res && contextValue.res.setHeader) {
      contextValue.res.setHeader('X-Request-ID', requestId);
    }

    return {
      async willSendResponse() {
        // 確保響應中包含 requestId（透過 formatError 處理）
        // 這裡只需要確保 header 已設定
        return;
      },
    };
  }
}
