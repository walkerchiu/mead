import { FieldAuthPlugin } from './field-auth.plugin';
import { AccessScope } from '../enums/access-scope.enum';
import { FieldMetadataCache } from '../services/field-metadata-cache.service';
import { GraphQLRequestContextWillSendResponse } from '@apollo/server';

// Test helper types
type MockContext = {
  req: {
    user: {
      userId: string;
      accessScopes: AccessScope[];
      roles: string[];
    };
  };
};

type MockResponse = {
  body: {
    kind: 'single';
    singleResult: { data: unknown };
  };
};

describe('FieldAuthPlugin', () => {
  let plugin: FieldAuthPlugin;
  let fieldMetadataCache: FieldMetadataCache;

  beforeEach(() => {
    fieldMetadataCache = new FieldMetadataCache();
    plugin = new FieldAuthPlugin(fieldMetadataCache);
  });

  describe('willSendResponse', () => {
    it('應該移除 password 和 refreshToken 欄位', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: '1',
            name: 'Test User',
            password: 'secret123',
            refreshToken: 'token123',
          },
        ],
      };

      const context = {
        req: {
          user: {
            userId: '1',
            accessScopes: [AccessScope.HQ_SCOPE],
            roles: [],
          },
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0]).not.toHaveProperty('password');
      expect(data.users[0]).not.toHaveProperty('refreshToken');
      expect(data.users[0]).toHaveProperty('id');
      expect(data.users[0]).toHaveProperty('name');
    });

    it('HQ 應該可以看到所有欄位（除了 password）', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            deletedAt: new Date(),
            password: 'secret',
          },
        ],
      };

      const context = {
        req: {
          user: {
            userId: '2',
            accessScopes: [AccessScope.HQ_SCOPE],
            roles: [],
          },
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0]).toHaveProperty('email');
      expect(data.users[0]).toHaveProperty('deletedAt');
      expect(data.users[0]).not.toHaveProperty('password');
    });

    it('Customer 可以看到自己的敏感欄位', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: 'user-123',
            name: 'My Name',
            email: 'me@example.com',
            phone: '1234567890',
          },
        ],
      };

      const context = {
        req: {
          user: {
            userId: 'user-123',
            accessScopes: [AccessScope.CUSTOMER_SCOPE],
            roles: [],
          },
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0]).toHaveProperty('email');
      expect(data.users[0]).toHaveProperty('phone');
    });

    it('Customer 不能看到別人的敏感欄位', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: 'user-123',
            name: 'Other User',
            email: 'other@example.com',
            phone: '1234567890',
          },
        ],
      };

      const context = {
        req: {
          user: {
            userId: 'user-456', // 不同的用戶
            accessScopes: [AccessScope.CUSTOMER_SCOPE],
            roles: [],
          },
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0]).not.toHaveProperty('email');
      expect(data.users[0]).not.toHaveProperty('phone');
      expect(data.users[0]).toHaveProperty('name');
    });

    it('Customer 不能看到 HQ-only 欄位', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: 'user-123',
            name: 'Test User',
            deletedAt: new Date(),
          },
        ],
      };

      const context = {
        req: {
          user: {
            userId: 'user-123',
            accessScopes: [AccessScope.CUSTOMER_SCOPE],
            roles: [],
          },
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0]).not.toHaveProperty('deletedAt');
    });

    it('Public 用戶不能看到敏感欄位', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            deletedAt: new Date(),
          },
        ],
      };

      const context = {
        req: {
          user: null, // 沒有登入
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0]).not.toHaveProperty('email');
      expect(data.users[0]).not.toHaveProperty('phone');
      expect(data.users[0]).not.toHaveProperty('deletedAt');
      expect(data.users[0]).toHaveProperty('name');
    });

    it('應該處理嵌套物件', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: 'user-123',
            name: 'Test User',
            profile: {
              userId: 'user-123',
              phone: '1234567890',
              address: '123 Main St',
              bio: 'Test bio',
            },
          },
        ],
      };

      const context = {
        req: {
          user: {
            userId: 'user-456', // 不同的用戶
            accessScopes: [AccessScope.CUSTOMER_SCOPE],
            roles: [],
          },
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0].profile).not.toHaveProperty('phone');
      expect(data.users[0].profile).not.toHaveProperty('address');
      expect(data.users[0].profile).toHaveProperty('bio'); // bio 不是敏感欄位
    });

    it('應該處理陣列中的多個物件', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        users: [
          {
            id: 'user-123',
            name: 'User 1',
            email: 'user1@example.com',
          },
          {
            id: 'user-456',
            name: 'User 2',
            email: 'user2@example.com',
          },
          {
            id: 'user-789',
            name: 'User 3',
            email: 'user3@example.com',
          },
        ],
      };

      const context = {
        req: {
          user: {
            userId: 'user-456', // 只能看到自己的 email
            accessScopes: [AccessScope.CUSTOMER_SCOPE],
            roles: [],
          },
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      expect(data.users[0]).not.toHaveProperty('email');
      expect(data.users[1]).toHaveProperty('email'); // 自己的
      expect(data.users[2]).not.toHaveProperty('email');
    });

    it('應該跳過認證響應（包含 accessToken）', async () => {
      const listener = await plugin.requestDidStart();
      const data = {
        login: {
          accessToken: 'token123',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            password: 'should-be-removed',
          },
        },
      };

      const context = {
        req: {
          user: null, // 登入時還沒有 user
        },
      } as MockContext;

      await listener.willSendResponse({
        response: {
          body: {
            kind: 'single',
            singleResult: { data },
          },
        } as MockResponse,
        contextValue: context,
        source: '',
        queryHash: '',
      } as GraphQLRequestContextWillSendResponse<MockContext>);

      // 認證響應應該被跳過，但 password 仍應被移除
      expect(data.login.user).not.toHaveProperty('password');
    });
  });
});
