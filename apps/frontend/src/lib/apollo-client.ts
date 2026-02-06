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

// 錯誤轉換 Link：將技術性錯誤訊息轉換為友善訊息（僅限登入操作）
const errorTransformLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (response) => {
        if (response.errors) {
          response.errors = response.errors.map((error) => {
            const errorMessage = error.message;
            const operationName = operation.operationName;

            // 只在登入相關操作中轉換 schema 錯誤
            const isLoginOperation =
              operationName === 'Login' ||
              operationName === 'VerifyTwoFactorLogin';

            // 檢查是否為 GraphQL schema 驗證錯誤
            if (
              isLoginOperation &&
              (errorMessage.includes(
                'Cannot return null for non-nullable field',
              ) ||
                (errorMessage.includes('Field') &&
                  errorMessage.includes('of required type') &&
                  errorMessage.includes('was not provided')))
            ) {
              // 根據當前語言返回友善訊息
              const pathParts = window.location.pathname.split('/');
              const locale = pathParts[1];
              const friendlyMessage =
                locale === 'zh-TW'
                  ? '登入失敗，請檢查您的電子郵件和密碼'
                  : 'Login failed, please check your email and password';

              console.log(
                '[Apollo] 攔截到 login schema 錯誤，轉換為:',
                friendlyMessage,
              );

              // 創建新的 GraphQL 錯誤
              return new GraphQLError(friendlyMessage, {
                extensions: error.extensions,
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
        // 嘗試使用 refresh token 刷新 access token
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

// WebSocket Link for subscriptions (僅在瀏覽器環境，支持自動重連和 token 刷新)
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
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

              // 如果是認證錯誤（4401），嘗試刷新 token
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
              console.log(
                '[WebSocket] 📡 Ping:',
                received ? 'received' : 'sent',
              );
            },
            pong: (received) => {
              console.log(
                '[WebSocket] 📡 Pong:',
                received ? 'received' : 'sent',
              );
            },
          },
        }),
      )
    : null;

// Split link: subscriptions 用 WS，其他用 HTTP
const splitLink =
  typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        from([errorTransformLink, errorLink, langLink, authLink, httpLink]),
      )
    : from([errorTransformLink, errorLink, langLink, authLink, httpLink]);

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
