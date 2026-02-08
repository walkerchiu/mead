import { ConfigService } from '@nestjs/config';
import { CertProviderFactory } from './cert-provider.factory';
import { LetsEncryptCertProvider } from './providers/letsencrypt.provider';
import { CloudflareCertProvider } from './providers/cloudflare.provider';
import { AwsAcmCertProvider } from './providers/aws-acm.provider';

function makeConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: <T>(key: string, defaultValue?: T) =>
      (values[key] ?? defaultValue) as T,
  } as ConfigService;
}

const le = { name: 'letsencrypt' } as unknown as LetsEncryptCertProvider;
const cf = { name: 'cloudflare' } as unknown as CloudflareCertProvider;
const acm = { name: 'aws-acm' } as unknown as AwsAcmCertProvider;

describe('CertProviderFactory', () => {
  it('預設 letsencrypt', () => {
    const f = new CertProviderFactory(makeConfig({}), le, cf, acm);
    expect(f.default()).toBe(le);
  });

  it('TLS_PROVIDER=cloudflare', () => {
    const f = new CertProviderFactory(
      makeConfig({ TLS_PROVIDER: 'cloudflare' }),
      le,
      cf,
      acm,
    );
    expect(f.default()).toBe(cf);
  });

  it('TLS_PROVIDER=aws-acm', () => {
    const f = new CertProviderFactory(
      makeConfig({ TLS_PROVIDER: 'aws-acm' }),
      le,
      cf,
      acm,
    );
    expect(f.default()).toBe(acm);
  });

  it('未知 TLS_PROVIDER fallback 到 letsencrypt', () => {
    const f = new CertProviderFactory(
      makeConfig({ TLS_PROVIDER: 'unknown' }),
      le,
      cf,
      acm,
    );
    expect(f.default()).toBe(le);
  });

  it('byName 對未知 provider throw', () => {
    const f = new CertProviderFactory(makeConfig({}), le, cf, acm);
    expect(() => f.byName('bogus')).toThrow(/Unknown cert provider/);
  });
});
