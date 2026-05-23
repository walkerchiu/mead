import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * 把 env 中的 SSL / application_name 設定合併進 DATABASE_URL，
 * 回傳 Prisma 可用的最終連線字串。
 *
 * 為何不直接讀 env 在 PrismaService？Prisma 走 Rust engine，所有連線參數
 * 必須從 DATABASE_URL 解析；node-postgres 風格的 `ssl` option 對 Prisma 無效。
 *
 * 支援 env：
 * - `DATABASE_URL`（必填）
 * - `DATABASE_SSL_MODE`：disable / prefer / require / verify-ca / verify-full
 * - `DATABASE_SSL_CA`：CA bundle PEM 內容（K8s Secret / Vault 注入）
 * - `DATABASE_SSL_CA_PATH`：CA bundle 檔案路徑（VM / Docker volume）
 * - `DATABASE_APPLICATION_NAME`：顯示在 pg_stat_activity / RDS Performance Insights
 *
 * 規則：
 * - 未設 `DATABASE_SSL_MODE` 時不覆寫 URL 內的 `sslmode`
 * - 設 `disable` 會強制移除 URL 的 sslmode（並設 sslmode=disable）
 * - 設 `verify-ca` / `verify-full` 必須提供 `DATABASE_SSL_CA` 或 `DATABASE_SSL_CA_PATH`，
 *   否則啟動時 throw（避免靜默退化為不驗證）
 * - inline CA 字串會被寫入 OS tempdir，再由 URL `sslrootcert=` 指向（Prisma 規範）
 * - inline 與檔案路徑同時存在時，inline 優先
 *
 * 詳細 provider 對照見 `docs/infrastructure/DATABASE_PROVIDERS.md`。
 */
export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const raw = env.DATABASE_URL;
  if (!raw) {
    throw new Error('[database-url] DATABASE_URL is required');
  }

  const url = new URL(raw);

  // application_name
  const appName = env.DATABASE_APPLICATION_NAME?.trim();
  if (appName) {
    url.searchParams.set('application_name', appName);
  }

  // SSL
  const sslMode = env.DATABASE_SSL_MODE?.trim();
  if (sslMode) {
    assertSslMode(sslMode);
    url.searchParams.set('sslmode', sslMode);

    if (sslMode === 'verify-ca' || sslMode === 'verify-full') {
      const caPath = ensureCaPath(env);
      if (!caPath) {
        throw new Error(
          `[database-url] DATABASE_SSL_MODE=${sslMode} requires DATABASE_SSL_CA or DATABASE_SSL_CA_PATH`,
        );
      }
      url.searchParams.set('sslrootcert', caPath);
    }
  }

  return url.toString();
}

function assertSslMode(mode: string): void {
  const allowed = ['disable', 'prefer', 'require', 'verify-ca', 'verify-full'];
  if (!allowed.includes(mode)) {
    throw new Error(
      `[database-url] Unknown DATABASE_SSL_MODE "${mode}". Expected: ${allowed.join(' | ')}`,
    );
  }
}

/**
 * 統一回傳「磁碟上的 CA 檔案路徑」給 Prisma 的 sslrootcert 用：
 * - inline（DATABASE_SSL_CA）→ 寫到 tmpdir，回傳該路徑
 * - 檔案路徑（DATABASE_SSL_CA_PATH）→ 直接回傳路徑（並驗證檔案存在）
 * - 兩者皆無 → null
 */
function ensureCaPath(env: NodeJS.ProcessEnv): string | null {
  const inline = env.DATABASE_SSL_CA;
  if (inline && inline.trim().length > 0) {
    const dir = join(tmpdir(), 'mead-ca');
    mkdirSync(dir, { recursive: true });
    const path = join(dir, 'database-ssl-ca.pem');
    writeFileSync(path, inline, { mode: 0o600 });
    return path;
  }

  const path = env.DATABASE_SSL_CA_PATH;
  if (path && path.trim().length > 0) {
    // 檔案不存在會在 readFileSync throw，比 Prisma 連線錯誤訊息更清楚
    readFileSync(path, 'utf8');
    return path;
  }

  return null;
}
