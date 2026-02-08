import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
  split,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { GraphQLError } from 'graphql';
import {
  getAccessToken,
  clearAuthTokens,
  getLoginPath,
  refreshAccessToken,
  setApolloClientRef,
} from './auth';
import { apolloLoadingLink } from './apollo-loading-link';
import { createRetryLink } from './apollo-retry-link';
import { createTimeoutLink } from './apollo-timeout-link';
import { apolloConfig } from './apollo.config';

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  credentials: 'include',
});

// 認證 Link：從記憶體讀取 token 並加入到 headers
const authLink = setContext((operation, { headers }) => {
  if (typeof window === 'undefined') {
    return { headers };
  }

  const token = getAccessToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 語言 Link：從 URL 路徑提取當前語言並加入到 headers
const langLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') {
    return { headers };
  }

  // 從 URL 路徑提取語言（例如：/zh-TW/dashboard → zh-TW）
  const pathParts = window.location.pathname.split('/');
  const locale = pathParts[1]; // 第一個路徑段是語言代碼

  // 驗證是否為有效的語言代碼
  const validLocales = ['en', 'zh-TW'];
  const currentLocale = validLocales.includes(locale) ? locale : 'en';

  return {
    headers: {
      ...headers,
      'x-lang': currentLocale, // 👈 發送當前語言給後端
    },
  };
});

// 避免重複 refresh
let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

// Timeout Link: 請求超時處理
// 從環境變數讀取配置，支援 per-operation 覆蓋
const timeoutLink = createTimeoutLink({
  timeout: apolloConfig.timeout.default,
});

// Retry Link: 自動重試失敗的請求
// 從環境變數讀取配置，支援 per-operation 覆蓋
const retryLink = createRetryLink({
  maxRetries: apolloConfig.retry.maxRetries,
  initialDelay: apolloConfig.retry.initialDelay,
  maxDelay: apolloConfig.retry.maxDelay,
});

// 錯誤轉換 Link：將技術性錯誤訊息轉換為友善訊息
const errorTransformLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (response) => {
        if (response.errors) {
          response.errors = response.errors.map((error) => {
            const errorMessage = error.message;
            const operationName = operation.operationName;

            // 檢查是否為登入相關操作
            const isLoginOperation =
              operationName === 'Login' ||
              operationName === 'VerifyTwoFactorLogin';

            // 檢查是否為 GraphQL schema 驗證錯誤
            const isSchemaError =
              errorMessage.includes(
                'Cannot return null for non-nullable field',
              ) ||
              (errorMessage.includes('Field') &&
                errorMessage.includes('of required type') &&
                errorMessage.includes('was not provided'));

            if (isSchemaError) {
              // 根據當前語言和操作類型返回友善訊息
              const pathParts = window.location.pathname.split('/');
              const locale = pathParts[1];

              let friendlyMessage = '';

              if (isLoginOperation) {
                // 登入錯誤
                friendlyMessage =
                  locale === 'zh-TW'
                    ? '登入失敗，請檢查您的電子郵件和密碼'
                    : 'Login failed, please check your email and password';
              } else {
                // 其他 schema 錯誤
                friendlyMessage =
                  locale === 'zh-TW'
                    ? '載入資料失敗，請稍後再試'
                    : 'Failed to load data, please try again later';
              }

              console.log(
                '[Apollo] 攔截到 GraphQL schema 錯誤，轉換為:',
                friendlyMessage,
              );

              // 創建新的 GraphQL 錯誤
              return new GraphQLError(friendlyMessage, {
                extensions: {
                  ...error.extensions,
                  code: 'NOT_FOUND', // 設定自定義錯誤代碼
                },
              });
            }

            return error;
          });
        }
        observer.next(response);
      },
      error: (error) => observer.error(error),
      complete: () => observer.complete(),
    });

    return () => subscription.unsubscribe();
  });
});

// 錯誤處理 Link：401 時自動嘗試 refresh
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorLink = onError((errorResponse: any) => {
  const { graphQLErrors, networkError, operation, forward } = errorResponse;

  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // 過濾掉 GraphQL schema 驗證錯誤的日誌
      if (
        !err.message.includes('Cannot return null for non-nullable field') &&
        !err.message.includes('登入失敗') &&
        !err.message.includes('Login failed') &&
        !(
          err.message.includes('Field') &&
          err.message.includes('of required type') &&
          err.message.includes('was not provided')
        )
      ) {
        console.error(`[GraphQL error]: ${err.message}`, err.extensions);
      }

      if (
        err.extensions?.code === 'UNAUTHENTICATED' &&
        typeof window !== 'undefined'
      ) {
        // 跳過 RefreshToken mutation 本身，避免循環死鎖：
        // refreshAccessToken() → mutate(RefreshToken) → errorLink → refreshAccessToken() → 死鎖
        if (operation.operationName === 'RefreshToken') {
          return;
        }

        // 嘗試使用 refresh token 重新整理 access token
        if (!isRefreshing) {
          isRefreshing = true;

          return new Observable((observer) => {
            refreshAccessToken('apollo-error-handler')
              .then((success) => {
                if (success) {
                  resolvePendingRequests();
                  // 重試原始請求
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  };
                  forward(operation).subscribe(subscriber);
                } else {
                  pendingRequests = [];
                  clearAuthTokens();
                  const loginPath = getLoginPath();
                  if (!window.location.pathname.endsWith('/login')) {
                    window.location.href = loginPath;
                  }
                  observer.error(err);
                }
              })
              .catch((refreshError) => {
                pendingRequests = [];
                clearAuthTokens();

                // 只在不是認證錯誤時導向登入頁
                // 如果用戶已在設定頁面，讓他們看到錯誤訊息
                const loginPath = getLoginPath();
                const isOnSettingsPage =
                  window.location.pathname.includes('/settings');

                if (
                  !window.location.pathname.endsWith('/login') &&
                  !isOnSettingsPage
                ) {
                  window.location.href = loginPath;
                }

                observer.error(refreshError);
              })
              .finally(() => {
                isRefreshing = false;
              });
          });
        }

        // 其他請求等待 refresh 完成後重試
        return new Observable((observer) => {
          pendingRequests.push(() => {
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            };
            forward(operation).subscribe(subscriber);
          });
        });
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]:`, networkError);
  }
});

// WebSocket Link for subscriptions（延遲初始化：僅在已認證時建立連線，避免未登入用戶觸發無意義的重連）
let wsLink: GraphQLWsLink | null = null;

function getOrCreateWsLink(): GraphQLWsLink {
  if (!wsLink) {
    wsLink = new GraphQLWsLink(
      createClient({
        url:
          process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT ||
          'ws://localhost:4000/graphql',
        connectionParams: () => {
          const token = getAccessToken();
          // 🔒 安全：不在日誌中記錄 token 資訊
          return {
            authorization: token ? `Bearer ${token}` : '',
          };
        },
        // 重連策略
        retryAttempts: 5,
        shouldRetry: () => true,
        // 連接事件處理
        on: {
          connected: () => {
            console.log('[WebSocket] ✅ Connected successfully');
          },
          error: (error) => {
            console.error('[WebSocket] ❌ Connection error:', error);
            console.error(
              '[WebSocket] Error details:',
              JSON.stringify(error, null, 2),
            );
          },
          closed: (event) => {
            console.log('[WebSocket] Connection closed:', event);
            const closeEvent = event as { code?: number; reason?: string };
            console.log('[WebSocket] Close code:', closeEvent?.code);
            console.log('[WebSocket] Close reason:', closeEvent?.reason);

            // 如果是認證錯誤（4401），嘗試重新整理 token
            if (
              event &&
              typeof event === 'object' &&
              'code' in event &&
              closeEvent.code === 4401
            ) {
              console.log(
                '[WebSocket] Auth error detected, refreshing token...',
              );
              refreshAccessToken('websocket-closed-4401').then((success) => {
                if (success) {
                  console.log(
                    '[WebSocket] Token refreshed, will reconnect automatically',
                  );
                } else {
                  console.error('[WebSocket] Token refresh failed');
                }
              });
            }
          },
          connecting: () => {
            console.log('[WebSocket] 🔄 Connecting...');
          },
          opened: (socket) => {
            console.log('[WebSocket] 🔓 Socket opened:', socket);
          },
          ping: (received) => {
            console.log('[WebSocket] 📡 Ping:', received ? 'received' : 'sent');
          },
          pong: (received) => {
            console.log('[WebSocket] 📡 Pong:', received ? 'received' : 'sent');
          },
        },
      }),
    );
  }
  return wsLink;
}

// Split link: subscriptions 用 WS，其他用 HTTP
// Link chain order: timeout → retry → errorTransform → error → lang → auth → http
const httpLinkChain = from([
  apolloLoadingLink,
  timeoutLink,
  retryLink,
  errorTransformLink,
  errorLink,
  langLink,
  authLink,
  httpLink,
]);

const splitLink =
  typeof window !== 'undefined'
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        // 延遲建立 WebSocket：僅在有 subscription 操作時才初始化連線
        new ApolloLink((operation) => {
          return getOrCreateWsLink().request(operation);
        }),
        httpLinkChain,
      )
    : httpLinkChain;

// 建立 Apollo Client
export const createApolloClient = () => {
  const client = new ApolloClient({
    link: splitLink, // 👈 使用 split link
    cache: new InMemoryCache({
      typePolicies: {
        AuthResponse: {
          // refreshToken mutation 回傳 AuthResponse (只有 accessToken 和 user)
          keyFields: false, // 不需要 cache key，每次都是新資料
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });

  // 設定引用供 auth.ts 的 refreshAccessToken 使用
  setApolloClientRef(client);

  return client;
};
