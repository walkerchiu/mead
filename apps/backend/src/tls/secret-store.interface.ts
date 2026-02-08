/**
 * SecretStore — TLS material 不落 DB 的抽象
 *
 * 目的：
 * - Private key 和 cert chain 永遠不進 Postgres
 * - Production 預期走 HashiCorp Vault / AWS Secrets Manager
 * - Dev / 測試可用 file-based 實作（`FileSecretStore`，預設 `./.dev-secrets/`）
 *
 * DI：由 SecretStoreFactory 依環境（TLS_SECRET_STORE）選具體實作。
 */

export interface TlsSecret {
  privateKey: string;
  certificateChain: string;
  revokedAt?: string;
}

export interface SecretStore {
  /** 結構化 TLS secret（含 key + chain） */
  write(ref: string, secret: TlsSecret): Promise<void>;
  read(ref: string): Promise<TlsSecret | null>;
  markRevoked(ref: string): Promise<void>;

  /** 單一字串 — ACME account key / URL 等小 metadata */
  writeRaw(ref: string, value: string): Promise<void>;
  readRaw(ref: string): Promise<string | null>;
}

export const SECRET_STORE = Symbol('SecretStore');
