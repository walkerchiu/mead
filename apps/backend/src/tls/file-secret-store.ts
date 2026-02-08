import { Logger } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { SecretStore, TlsSecret } from './secret-store.interface';

/**
 * FileSecretStore — dev / test 用的 SecretStore 實作
 *
 * 把 secret 寫到本地檔案（預設 `./.dev-secrets/`）；**production 禁用**，
 * 由 SecretStoreFactory 在組裝階段擋掉。
 */
export class FileSecretStore implements SecretStore {
  private readonly logger = new Logger(FileSecretStore.name);
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(process.cwd(), baseDir);
    this.logger.warn(
      `[FileSecretStore] writing TLS materials to ${this.baseDir} — dev only`,
    );
  }

  async write(ref: string, secret: TlsSecret): Promise<void> {
    await this.persist(ref, JSON.stringify(secret, null, 2));
  }

  async read(ref: string): Promise<TlsSecret | null> {
    const raw = await this.loadRaw(ref);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as TlsSecret;
    } catch {
      return null;
    }
  }

  async markRevoked(ref: string): Promise<void> {
    const existing = await this.read(ref);
    if (!existing) return;
    existing.revokedAt = new Date().toISOString();
    await this.write(ref, existing);
  }

  async writeRaw(ref: string, value: string): Promise<void> {
    await this.persist(ref, value);
  }

  async readRaw(ref: string): Promise<string | null> {
    return this.loadRaw(ref);
  }

  private async persist(ref: string, contents: string): Promise<void> {
    const filePath = this.resolvePath(ref);
    await fs.mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
    await fs.writeFile(filePath, contents, { mode: 0o600 });
  }

  private async loadRaw(ref: string): Promise<string | null> {
    try {
      return await fs.readFile(this.resolvePath(ref), 'utf8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
      throw err;
    }
  }

  private resolvePath(ref: string): string {
    const safe = ref.replace(/[^a-zA-Z0-9._\-/]/g, '_');
    const full = path.resolve(this.baseDir, safe);
    // 防 path traversal
    if (!full.startsWith(this.baseDir + path.sep) && full !== this.baseDir) {
      throw new Error(`Invalid secret ref: ${ref}`);
    }
    return full;
  }
}
