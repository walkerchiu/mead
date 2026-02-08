/**
 * 框架自我測試 — 驗證 normalize 與 expectParity 行為正確
 * 不依賴 DB / NestJS，純邏輯單測（所以放在 contract 資料夾但用 src 的 jest config）
 */

import {
  normalizeForComparison,
  expectParity,
  expectPaginationParity,
  runContract,
  DEFAULT_IGNORED_FIELDS,
} from './contract-harness';

describe('Contract Harness', () => {
  describe('normalizeForComparison', () => {
    it('strips default ignored fields (timestamps)', () => {
      const input = {
        id: 'abc',
        name: 'alice',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        lastLoginAt: new Date('2026-04-10'),
      };
      const out = normalizeForComparison(input) as Record<string, unknown>;
      expect(out.id).toBe('abc');
      expect(out.name).toBe('alice');
      expect(out.createdAt).toBe('__IGNORED__');
      expect(out.updatedAt).toBe('__IGNORED__');
      expect(out.lastLoginAt).toBe('__IGNORED__');
    });

    it('preserves null/undefined in ignored fields (meaningful signal)', () => {
      const out = normalizeForComparison({
        id: 'x',
        lastLoginAt: null,
      }) as Record<string, unknown>;
      expect(out.lastLoginAt).toBeNull();
    });

    it('recursively strips nested objects', () => {
      const input = {
        user: {
          id: 'u1',
          profile: { bio: 'hi', createdAt: new Date() },
        },
      };
      const out = normalizeForComparison(input);
      expect(out.user.profile.bio).toBe('hi');

      expect((out.user.profile as any).createdAt).toBe('__IGNORED__');
    });

    it('accepts custom ignoreFields (additive)', () => {
      const out = normalizeForComparison(
        { id: 'x', secret: 's', createdAt: new Date() },
        { ignoreFields: ['secret'] },
      ) as Record<string, unknown>;
      expect(out.secret).toBe('__IGNORED__');
      expect(out.createdAt).toBe('__IGNORED__');
    });

    it('ignoreFieldsExact replaces defaults entirely', () => {
      const out = normalizeForComparison(
        { id: 'x', createdAt: new Date(), secret: 's' },
        { ignoreFieldsExact: ['secret'] },
      ) as Record<string, unknown>;
      expect(out.secret).toBe('__IGNORED__');
      // createdAt NOT ignored now — remains as Date sentinel
      expect(out.createdAt).toBe('__DATE__');
    });

    it('sorts arrays by key when requested', () => {
      const out = normalizeForComparison(
        [{ id: 'b' }, { id: 'a' }, { id: 'c' }],
        { sortArraysByKey: 'id' },
      );
      expect(out).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    });

    it('handles deep nesting without infinite loop', () => {
      const deep = { l1: { l2: { l3: { l4: { id: 'x' } } } } };
      expect(() => normalizeForComparison(deep)).not.toThrow();
    });

    it('respects maxDepth to handle circular refs gracefully', () => {
      const a: any = { id: 'a' };
      a.self = a;
      // Should not explode
      expect(() => normalizeForComparison(a, { maxDepth: 3 })).not.toThrow();
    });
  });

  describe('expectParity', () => {
    it('passes when two objects differ only in timestamps', () => {
      const a = { id: 'x', createdAt: new Date('2026-01-01') };
      const b = { id: 'x', createdAt: new Date('2026-04-18') };
      expect(() => expectParity(a, b)).not.toThrow();
    });

    it('fails on meaningful difference', () => {
      const a = { id: 'x', name: 'alice' };
      const b = { id: 'x', name: 'bob' };
      expect(() => expectParity(a, b)).toThrow();
    });
  });

  describe('expectPaginationParity', () => {
    it('passes when data differs only in order (with default id sort)', () => {
      const a = {
        data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        pageInfo: { totalCount: 3 },
      };
      const b = {
        data: [{ id: 'c' }, { id: 'a' }, { id: 'b' }],
        pageInfo: { totalCount: 3 },
      };
      expect(() => expectPaginationParity(a, b)).not.toThrow();
    });

    it('fails when pageInfo differs', () => {
      const a = { data: [], pageInfo: { totalCount: 3 } };
      const b = { data: [], pageInfo: { totalCount: 5 } };
      expect(() => expectPaginationParity(a, b)).toThrow();
    });
  });

  describe('runContract', () => {
    it('runs both impls and compares', async () => {
      await runContract({
        name: 'trivial',
        a: () =>
          Promise.resolve({ id: 'x', createdAt: new Date('2026-01-01') }),
        b: () =>
          Promise.resolve({ id: 'x', createdAt: new Date('2026-04-18') }),
      });
    });

    it('customCompare takes over when provided', async () => {
      let called = false;
      await runContract({
        name: 'custom',
        a: () => Promise.resolve(1),
        b: () => Promise.resolve(2),
        customCompare: (a, b) => {
          called = true;
          expect(Math.abs(a - b)).toBeLessThanOrEqual(2);
        },
      });
      expect(called).toBe(true);
    });
  });

  it('DEFAULT_IGNORED_FIELDS includes expected timestamps', () => {
    expect(DEFAULT_IGNORED_FIELDS).toEqual(
      expect.arrayContaining(['createdAt', 'updatedAt', 'lastLoginAt']),
    );
  });
});
