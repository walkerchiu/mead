import {
  sanitizeLog,
  sanitizeRequest,
  sanitizeResponse,
  sanitizeGraphQLContext,
  mightContainSensitiveData,
} from './log-sanitizer';

describe('Log Sanitizer', () => {
  describe('sanitizeLog', () => {
    it('should redact password fields', () => {
      const data = {
        email: 'user@example.com',
        password: 'secret123',
      };

      const result = sanitizeLog(data);

      expect(result.email).toBe('user@example.com');
      expect(result.password).toContain('[REDACTED]');
    });

    it('should redact token fields', () => {
      const data = {
        userId: '123',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh_token_value',
      };

      const result = sanitizeLog(data);

      expect(result.userId).toBe('123');
      expect(result.accessToken).toContain('[REDACTED]');
      expect(result.refreshToken).toContain('[REDACTED]');
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          email: 'user@example.com',
          profile: {
            name: 'John Doe',
            credentials: {
              password: 'secret',
              apiKey: 'api_key_value',
            },
          },
        },
      };

      const result = sanitizeLog(data);

      expect(result.user.email).toBe('user@example.com');
      expect(result.user.profile.name).toBe('John Doe');
      expect(result.user.profile.credentials.password).toContain('[REDACTED]');
      expect(result.user.profile.credentials.apiKey).toContain('[REDACTED]');
    });

    it('should handle arrays', () => {
      const data = {
        users: [
          { email: 'user1@example.com', password: 'pass1' },
          { email: 'user2@example.com', password: 'pass2' },
        ],
      };

      const result = sanitizeLog(data);

      expect(result.users[0].email).toBe('user1@example.com');
      expect(result.users[0].password).toContain('[REDACTED]');
      expect(result.users[1].email).toBe('user2@example.com');
      expect(result.users[1].password).toContain('[REDACTED]');
    });

    it('should handle null and undefined', () => {
      const data = {
        value1: null,
        value2: undefined,
        value3: 'normal',
      };

      const result = sanitizeLog(data);

      expect(result.value1).toBeNull();
      expect(result.value2).toBeUndefined();
      expect(result.value3).toBe('normal');
    });

    it('should handle circular references', () => {
      const data: any = {
        name: 'test',
      };
      data.self = data;

      const result = sanitizeLog(data);

      expect(result.name).toBe('test');
      expect(result.self).toBe('[CIRCULAR_REFERENCE]');
    });

    it('should respect max depth', () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'too deep',
              },
            },
          },
        },
      };

      const result = sanitizeLog(deepData, { maxDepth: 3 });

      expect(result.level1.level2.level3).toBe('[MAX_DEPTH_EXCEEDED]');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const data = {
        createdAt: date,
      };

      const result = sanitizeLog(data);

      expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const data = {
        error,
      };

      const result = sanitizeLog(data);

      expect(result.error.name).toBe('Error');
      expect(result.error.message).toBe('Test error');
    });

    it('should redact case-insensitive keys', () => {
      const data = {
        Password: 'secret',
        PASSWORD: 'secret',
        PaSsWoRd: 'secret',
        API_KEY: 'key123',
        ApiKey: 'key456',
      };

      const result = sanitizeLog(data);

      expect(result.Password).toContain('[REDACTED]');
      expect(result.PASSWORD).toContain('[REDACTED]');
      expect(result.PaSsWoRd).toContain('[REDACTED]');
      expect(result.API_KEY).toContain('[REDACTED]');
      expect(result.ApiKey).toContain('[REDACTED]');
    });

    it('should show type information when enabled', () => {
      const data = {
        password: 'secret123',
        token: 12345,
        key: true,
      };

      const result = sanitizeLog(data, { showType: true });

      expect(result.password).toContain('(string)');
      expect(result.token).toContain('(number)');
      expect(result.key).toContain('(boolean)');
    });

    it('should show length information when enabled', () => {
      const data = {
        password: 'secret123',
      };

      const result = sanitizeLog(data, { showLength: true });

      expect(result.password).toContain('[length: 9]');
    });
  });

  describe('sanitizeRequest', () => {
    it('should sanitize HTTP request object', () => {
      const req = {
        method: 'POST',
        url: '/api/login',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer token123',
        },
        body: {
          email: 'user@example.com',
          password: 'secret',
        },
        query: {
          redirect: '/dashboard',
        },
        params: {
          id: '123',
        },
        ip: '127.0.0.1',
        user: {
          id: 'user-123',
          email: 'user@example.com',
          password: 'should-not-appear',
        },
      };

      const result = sanitizeRequest(req);

      expect(result.method).toBe('POST');
      expect(result.url).toBe('/api/login');
      expect(result.headers.authorization).toContain('[REDACTED]');
      expect(result.body.email).toBe('user@example.com');
      expect(result.body.password).toContain('[REDACTED]');
      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('user@example.com');
      expect(result.user.password).toBeUndefined();
    });
  });

  describe('sanitizeResponse', () => {
    it('should sanitize HTTP response object', () => {
      const res = {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
          'set-cookie': 'session=abc123',
        },
      };

      const result = sanitizeResponse(res);

      expect(result.statusCode).toBe(200);
      expect(result.headers['set-cookie']).toContain('[REDACTED]');
    });
  });

  describe('sanitizeGraphQLContext', () => {
    it('should sanitize GraphQL context', () => {
      const context = {
        req: {
          headers: {
            authorization: 'Bearer token123',
          },
          body: {
            query: '{ users { id } }',
          },
        },
        user: {
          id: 'user-123',
          email: 'user@example.com',
          accessScopes: ['USER_SCOPE'],
          password: 'should-not-appear',
        },
      };

      const result = sanitizeGraphQLContext(context);

      expect(result.req.headers.authorization).toContain('[REDACTED]');
      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('user@example.com');
      expect(result.user.accessScopes).toEqual(['USER_SCOPE']);
      expect(result.user.password).toBeUndefined();
    });
  });

  describe('mightContainSensitiveData', () => {
    it('should detect potential sensitive data', () => {
      expect(mightContainSensitiveData('user password: secret')).toBe(true);
      expect(mightContainSensitiveData('Bearer token123')).toBe(true);
      expect(mightContainSensitiveData('api_key=abc123')).toBe(true);
      expect(mightContainSensitiveData('normal log message')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(mightContainSensitiveData('PASSWORD: secret')).toBe(true);
      expect(mightContainSensitiveData('Token: abc')).toBe(true);
    });
  });
});
