import { Logger } from '@nestjs/common';
import nodeVault, { client as VaultClient } from 'node-vault';
import { SecretStore, TlsSecret } from './secret-store.interface';

export interface VaultSecretStoreOptions {
  addr: string;
  token?: string;
  roleId?: string;
  secretId?: string;
  mount?: string;
  pathPrefix?: string;
}

/**
 * VaultSecretStore — HashiCorp Vault 的 KV v2 secrets engine 實作
 *
 * 路徑組成：`/{mount}/data/{prefix}/{ref}`
 *   例如 mount=`secret`, prefix=`mead/prod`, ref=`tls/example.com`
 *   → `/secret/data/mead/prod/tls/example.com`
 *
 * 認證：
 *   - Token auth（VAULT_TOKEN，dev / staging）
 *   - AppRole（VAULT_ROLE_ID + VAULT_SECRET_ID；production 推薦）
 *
 * Vault policy（最小集）：
 *   path "secret/data/mead/prod/*"     { capabilities = ["create","read","update"] }
 *   path "secret/delete/mead/prod/*"   { capabilities = ["update"] }
 *   path "secret/metadata/mead/prod/*" { capabilities = ["read","delete"] }
 */
export class VaultSecretStore implements SecretStore {
  private readonly logger = new Logger(VaultSecretStore.name);
  private client: VaultClient;
  private readonly mount: string;
  private readonly prefix: string;
  private readonly roleId?: string;
  private readonly secretId?: string;
  /** AppRole token 會過期 — 下次讀時若快過期自動 re-login */
  private tokenExpiresAt = Number.MAX_SAFE_INTEGER;

  constructor(opts: VaultSecretStoreOptions) {
    if (!opts.addr) {
      throw new Error(
        'VaultSecretStore: addr required (e.g. https://vault.internal:8200)',
      );
    }
    this.roleId = opts.roleId;
    this.secretId = opts.secretId;
    this.mount = (opts.mount ?? 'secret').replace(/\/$/, '');
    this.prefix = (opts.pathPrefix ?? 'mead').replace(/^\/|\/$/g, '');

    this.client = nodeVault({
      apiVersion: 'v1',
      endpoint: opts.addr,
      token: opts.token,
    });

    this.logger.log(
      `[VaultSecretStore] addr=${opts.addr} mount=${this.mount} prefix=${this.prefix} auth=${this.roleId ? 'approle' : 'token'}`,
    );
  }

  async write(ref: string, secret: TlsSecret): Promise<void> {
    await this.ensureAuthed();
    await this.client.write(this.dataPath(ref), {
      data: secret as unknown as Record<string, unknown>,
    });
  }

  async read(ref: string): Promise<TlsSecret | null> {
    await this.ensureAuthed();
    try {
      const res = (await this.client.read(this.dataPath(ref))) as {
        data?: { data?: TlsSecret };
      };
      return res?.data?.data ?? null;
    } catch (err: unknown) {
      if (this.isNotFound(err)) return null;
      throw err;
    }
  }

  async markRevoked(ref: string): Promise<void> {
    const existing = await this.read(ref);
    if (!existing) return;
    existing.revokedAt = new Date().toISOString();
    await this.write(ref, existing);
  }

  async writeRaw(ref: string, value: string): Promise<void> {
    await this.ensureAuthed();
    await this.client.write(this.dataPath(ref), {
      data: { value },
    });
  }

  async readRaw(ref: string): Promise<string | null> {
    await this.ensureAuthed();
    try {
      const res = (await this.client.read(this.dataPath(ref))) as {
        data?: { data?: { value?: string } };
      };
      return res?.data?.data?.value ?? null;
    } catch (err: unknown) {
      if (this.isNotFound(err)) return null;
      throw err;
    }
  }

  async healthCheck(): Promise<{
    ok: boolean;
    sealed?: boolean;
    reason?: string;
  }> {
    try {
      const status = (await this.client.health({ standbyok: true })) as {
        sealed?: boolean;
        initialized?: boolean;
      };
      return { ok: true, sealed: status.sealed };
    } catch (err: unknown) {
      return { ok: false, reason: (err as Error).message };
    }
  }

  // --- internals ---

  private async ensureAuthed(): Promise<void> {
    if (!this.roleId || !this.secretId) return;
    const now = Date.now();
    if (now < this.tokenExpiresAt - 60_000) return;

    type ApproleResp = {
      auth?: { client_token?: string; lease_duration?: number };
    };
    const res = (await this.client.approleLogin({
      role_id: this.roleId,
      secret_id: this.secretId,
    })) as ApproleResp;
    const token = res.auth?.client_token;
    const ttl = res.auth?.lease_duration ?? 3600;
    if (!token) {
      throw new Error(
        'VaultSecretStore: approleLogin returned no client_token',
      );
    }
    (this.client as unknown as { token: string }).token = token;
    this.tokenExpiresAt = now + ttl * 1000;
    this.logger.log(`[VaultSecretStore] AppRole login ok (TTL ${ttl}s)`);
  }

  private dataPath(ref: string): string {
    return `${this.mount}/data/${this.prefix}/${ref}`;
  }

  private isNotFound(err: unknown): boolean {
    const e = err as {
      response?: { statusCode?: number };
      statusCode?: number;
    };
    const code = e?.response?.statusCode ?? e?.statusCode;
    return code === 404;
  }
}
