import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { FileSecretStore } from './file-secret-store';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'npt-tls-'));
}

describe('FileSecretStore', () => {
  let dir: string;
  let store: FileSecretStore;

  beforeEach(() => {
    dir = makeTempDir();
    store = new FileSecretStore(dir);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('write + read 能往返結構化 secret', async () => {
    await store.write('tls/example.com', {
      privateKey: 'PK',
      certificateChain: 'CC',
    });
    const out = await store.read('tls/example.com');
    expect(out).toEqual({ privateKey: 'PK', certificateChain: 'CC' });
  });

  it('read 不存在的 ref 回 null', async () => {
    expect(await store.read('tls/missing.com')).toBeNull();
  });

  it('writeRaw + readRaw 保留原字串', async () => {
    await store.writeRaw('tls/acme/account-key', 'PEM_BLOB');
    expect(await store.readRaw('tls/acme/account-key')).toBe('PEM_BLOB');
  });

  it('readRaw 不存在回 null（不 throw）', async () => {
    expect(await store.readRaw('nope')).toBeNull();
  });

  it('markRevoked 在現有 secret 標 revokedAt', async () => {
    await store.write('tls/x.com', { privateKey: 'a', certificateChain: 'b' });
    await store.markRevoked('tls/x.com');
    const out = await store.read('tls/x.com');
    expect(out?.revokedAt).toBeDefined();
    expect(new Date(out.revokedAt).getTime()).not.toBeNaN();
  });

  it('markRevoked 對不存在 ref 是 no-op', async () => {
    await expect(store.markRevoked('tls/none.com')).resolves.toBeUndefined();
  });

  it('阻擋 path traversal', async () => {
    await expect(
      store.write('../escape.txt', {
        privateKey: 'a',
        certificateChain: 'b',
      }),
    ).rejects.toThrow(/Invalid secret ref/);
  });

  it('檔案以 0600 權限寫入', async () => {
    await store.write('tls/perm.com', {
      privateKey: 'a',
      certificateChain: 'b',
    });
    const stat = fs.statSync(path.join(dir, 'tls/perm.com'));
    // mode 末三位
    expect(stat.mode & 0o777).toBe(0o600);
  });
});
