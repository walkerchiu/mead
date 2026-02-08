/**
 * Contract Test Harness
 *
 * 提供 service 層行為契約驗證的共用工具：
 * - `normalizeForComparison` / `expectParity`：把結果正規化後比對，自動忽略 timestamps
 * - `expectPaginationParity`：分頁結果比對（pageInfo + data 陣列）
 * - `runContract` / `ContractCase`：用同一組輸入跑兩個實作並比對輸出
 *
 * 使用情境（主要為兩類）：
 * 1. **快照式行為驗證**（主要用法）：直接跑 service 方法，比對輸出 shape 與語意
 * 2. **A/B 實作比對**（重構 / feature flag 切換 / benchmark 時）：例如重寫某 service
 *    的查詢邏輯，先用 harness 確認新舊行為等價再切換
 *
 * 設計原則：
 * - 忽略非確定性欄位：timestamps（createdAt/updatedAt）、lastLoginAt、lastUsedAt 等
 * - 可客製：每個測試可指定要比對/忽略哪些欄位、陣列是否需排序
 */

/**
 * 預設要忽略的欄位 — 這些在寫入/讀取間天然會有毫秒級差異或 regenerate
 */
export const DEFAULT_IGNORED_FIELDS = [
  'createdAt',
  'updatedAt',
  'lastLoginAt',
  'lastUsedAt',
  'accessedAt',
];

export interface NormalizeOptions {
  /** 額外要忽略的欄位（疊加在 DEFAULT_IGNORED_FIELDS 上） */
  ignoreFields?: string[];
  /** 完全取代預設 ignore 清單（不疊加） */
  ignoreFieldsExact?: string[];
  /** 若為陣列，依此 key 排序後比對（用於 order-by 不保證的查詢） */
  sortArraysByKey?: string;
  /** 最大遞迴深度（防循環 reference） */
  maxDepth?: number;
}

/**
 * 遞迴把物件正規化為「可比對形式」：
 * - 把指定 timestamp 欄位設為固定佔位值（保留「有/無」資訊）
 * - 陣列若需排序則排序
 */
export function normalizeForComparison<T>(
  data: T,
  opts: NormalizeOptions = {},
): T {
  const ignore = new Set(
    opts.ignoreFieldsExact ?? [
      ...DEFAULT_IGNORED_FIELDS,
      ...(opts.ignoreFields ?? []),
    ],
  );
  const maxDepth = opts.maxDepth ?? 20;
  return normalize(data, ignore, opts.sortArraysByKey, 0, maxDepth) as T;
}

function normalize(
  value: unknown,
  ignore: Set<string>,
  sortKey: string | undefined,
  depth: number,
  maxDepth: number,
): unknown {
  if (depth > maxDepth) return value;
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return '__DATE__'; // timestamps 在 ignore 層處理，這是保險
  if (Array.isArray(value)) {
    const mapped = value.map((v) =>
      normalize(v, ignore, sortKey, depth + 1, maxDepth),
    );
    if (sortKey) {
      return [...mapped].sort((a, b) => compareByKey(a, b, sortKey));
    }
    return mapped;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (ignore.has(k)) {
        out[k] = v === null || v === undefined ? v : '__IGNORED__';
        continue;
      }
      out[k] = normalize(v, ignore, sortKey, depth + 1, maxDepth);
    }
    return out;
  }
  return value;
}

function compareByKey(a: unknown, b: unknown, key: string): number {
  const av = (a as Record<string, unknown>)?.[key];
  const bv = (b as Record<string, unknown>)?.[key];
  if (typeof av === 'string' && typeof bv === 'string')
    return av.localeCompare(bv);
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  // fallback：用 JSON stringify 避免 '[object Object]' lint warning
  return JSON.stringify(av ?? '').localeCompare(JSON.stringify(bv ?? ''));
}

/**
 * 斷言兩個結果等價（忽略非確定性欄位）
 * 主要 API —— 絕大多數 contract test 用這個
 */
export function expectParity<A, B>(
  a: A,
  b: B,
  opts: NormalizeOptions = {},
): void {
  const na = normalizeForComparison(a, opts);
  const nb = normalizeForComparison(b, opts);
  expect(nb).toEqual(na);
}

/**
 * 比對分頁結果（pageInfo + data 陣列）
 * data 陣列預設依 `id` 排序後比對（避免不同 ORM 預設排序順序不同導致 false positive）
 */
export function expectPaginationParity<A, B>(
  a: { data: A[]; pageInfo?: unknown },
  b: { data: B[]; pageInfo?: unknown },
  opts: NormalizeOptions = {},
): void {
  expect(normalizeForComparison(b.pageInfo, opts)).toEqual(
    normalizeForComparison(a.pageInfo, opts),
  );
  expect(
    normalizeForComparison(b.data, {
      ...opts,
      sortArraysByKey: opts.sortArraysByKey ?? 'id',
    }),
  ).toEqual(
    normalizeForComparison(a.data, {
      ...opts,
      sortArraysByKey: opts.sortArraysByKey ?? 'id',
    }),
  );
}

/**
 * 用兩個實作跑同一組測試 — 主要是讀操作用
 * 範例：
 *   runContract({
 *     name: 'findById returns consistent shape',
 *     a: () => legacyUserService.findById(id),
 *     b: () => newUserService.findById(id),
 *   });
 */
export interface ContractCase<A, B = A> {
  name: string;
  a: () => Promise<A>;
  b: () => Promise<B>;
  options?: NormalizeOptions;
  customCompare?: (a: A, b: B) => void;
}

export async function runContract<A, B = A>(
  c: ContractCase<A, B>,
): Promise<void> {
  const [aResult, bResult] = await Promise.all([c.a(), c.b()]);
  if (c.customCompare) {
    c.customCompare(aResult, bResult);
  } else {
    expectParity(aResult, bResult, c.options);
  }
}
