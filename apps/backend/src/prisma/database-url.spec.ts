import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { resolveDatabaseUrl } from './database-url';

const BASE_URL =
  'postgresql://user:pass@localhost:5432/mead_db?schema=public&connection_limit=10&pool_timeout=10';

function env(
  extra: Record<string, string | undefined> = {},
): NodeJS.ProcessEnv {
  return { DATABASE_URL: BASE_URL, ...extra } as NodeJS.ProcessEnv;
}

function writeTempCa(pem: string): string {
  const p = path.join(
    os.tmpdir(),
    `mead-ca-test-${process.hrtime.bigint()}.pem`,
  );
  fs.writeFileSync(p, pem);
  return p;
}

describe('resolveDatabaseUrl', () => {
  it('throws when DATABASE_URL is missing', () => {
    expect(() => resolveDatabaseUrl({} as NodeJS.ProcessEnv)).toThrow(
      /DATABASE_URL is required/,
    );
  });

  describe('application_name', () => {
    it('未設時不寫入 query', () => {
      const out = new URL(resolveDatabaseUrl(env()));
      expect(out.searchParams.has('application_name')).toBe(false);
    });

    it('讀取 DATABASE_APPLICATION_NAME', () => {
      const out = new URL(
        resolveDatabaseUrl(
          env({ DATABASE_APPLICATION_NAME: 'mead-backend-uat' }),
        ),
      );
      expect(out.searchParams.get('application_name')).toBe('mead-backend-uat');
    });
  });

  describe('SSL mode', () => {
    it('未設時不覆寫 sslmode', () => {
      const out = new URL(resolveDatabaseUrl(env()));
      expect(out.searchParams.has('sslmode')).toBe(false);
    });

    it('disable → sslmode=disable', () => {
      const out = new URL(
        resolveDatabaseUrl(env({ DATABASE_SSL_MODE: 'disable' })),
      );
      expect(out.searchParams.get('sslmode')).toBe('disable');
    });

    it('require → sslmode=require（不需 CA）', () => {
      const out = new URL(
        resolveDatabaseUrl(env({ DATABASE_SSL_MODE: 'require' })),
      );
      expect(out.searchParams.get('sslmode')).toBe('require');
      expect(out.searchParams.has('sslrootcert')).toBe(false);
    });

    it('verify-full 缺 CA → throw', () => {
      expect(() =>
        resolveDatabaseUrl(env({ DATABASE_SSL_MODE: 'verify-full' })),
      ).toThrow(/verify-full requires DATABASE_SSL_CA or DATABASE_SSL_CA_PATH/);
    });

    it('verify-ca 缺 CA → throw', () => {
      expect(() =>
        resolveDatabaseUrl(env({ DATABASE_SSL_MODE: 'verify-ca' })),
      ).toThrow(/verify-ca requires DATABASE_SSL_CA or DATABASE_SSL_CA_PATH/);
    });

    it('verify-full + DATABASE_SSL_CA inline → 寫入 tmpfile + sslrootcert', () => {
      const pem =
        '-----BEGIN CERTIFICATE-----\nFAKE_INLINE\n-----END CERTIFICATE-----';
      const out = new URL(
        resolveDatabaseUrl(
          env({ DATABASE_SSL_MODE: 'verify-full', DATABASE_SSL_CA: pem }),
        ),
      );
      const certPath = out.searchParams.get('sslrootcert');
      expect(certPath).toBeTruthy();
      expect(fs.readFileSync(certPath, 'utf8')).toBe(pem);
    });

    it('verify-ca + DATABASE_SSL_CA_PATH → 直接套用路徑', () => {
      const pem =
        '-----BEGIN CERTIFICATE-----\nFROM_FILE\n-----END CERTIFICATE-----';
      const caPath = writeTempCa(pem);
      try {
        const out = new URL(
          resolveDatabaseUrl(
            env({
              DATABASE_SSL_MODE: 'verify-ca',
              DATABASE_SSL_CA_PATH: caPath,
            }),
          ),
        );
        expect(out.searchParams.get('sslrootcert')).toBe(caPath);
      } finally {
        fs.unlinkSync(caPath);
      }
    });

    it('inline 與 CA_PATH 都存在 → inline 優先', () => {
      const inline = '-----INLINE_WIN-----';
      const caPath = writeTempCa('-----FILE_LOSE-----');
      try {
        const out = new URL(
          resolveDatabaseUrl(
            env({
              DATABASE_SSL_MODE: 'verify-full',
              DATABASE_SSL_CA: inline,
              DATABASE_SSL_CA_PATH: caPath,
            }),
          ),
        );
        const certPath = out.searchParams.get('sslrootcert');
        expect(fs.readFileSync(certPath, 'utf8')).toBe(inline);
      } finally {
        fs.unlinkSync(caPath);
      }
    });

    it('CA_PATH 指向不存在的檔案 → throw（清晰訊息）', () => {
      expect(() =>
        resolveDatabaseUrl(
          env({
            DATABASE_SSL_MODE: 'verify-full',
            DATABASE_SSL_CA_PATH: '/no/such/ca.pem',
          }),
        ),
      ).toThrow();
    });

    it('未知 SSL mode → throw', () => {
      expect(() =>
        resolveDatabaseUrl(env({ DATABASE_SSL_MODE: 'bogus' })),
      ).toThrow(/Unknown DATABASE_SSL_MODE "bogus"/);
    });
  });

  describe('既有 URL 參數保留', () => {
    it('schema=public / connection_limit / pool_timeout 不被覆寫', () => {
      const out = new URL(
        resolveDatabaseUrl(
          env({
            DATABASE_SSL_MODE: 'require',
            DATABASE_APPLICATION_NAME: 'mead-backend',
          }),
        ),
      );
      expect(out.searchParams.get('schema')).toBe('public');
      expect(out.searchParams.get('connection_limit')).toBe('10');
      expect(out.searchParams.get('pool_timeout')).toBe('10');
      expect(out.searchParams.get('sslmode')).toBe('require');
      expect(out.searchParams.get('application_name')).toBe('mead-backend');
    });

    it('URL 已含 sslmode → 被 env DATABASE_SSL_MODE 覆寫', () => {
      const out = new URL(
        resolveDatabaseUrl({
          DATABASE_URL: BASE_URL + '&sslmode=prefer',
          DATABASE_SSL_MODE: 'require',
        } as NodeJS.ProcessEnv),
      );
      expect(out.searchParams.get('sslmode')).toBe('require');
    });
  });
});
