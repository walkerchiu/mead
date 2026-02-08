import { ConfigService } from '@nestjs/config';
import { DnsOperatorFactory } from './dns-operator.factory';
import { ManualDnsOperator } from './manual-dns.operator';
import { CloudflareDnsOperator } from './cloudflare-dns.operator';

function makeConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: <T>(key: string, defaultValue?: T) =>
      (values[key] ?? defaultValue) as T,
  } as ConfigService;
}

describe('DnsOperatorFactory', () => {
  it('預設 manual provider', () => {
    const f = new DnsOperatorFactory(makeConfig({}));
    expect(f.resolve()).toBeInstanceOf(ManualDnsOperator);
  });

  it('未知 provider fallback 到 manual', () => {
    const f = new DnsOperatorFactory(
      makeConfig({ DEFAULT_DNS_PROVIDER: 'wat' }),
    );
    expect(f.resolve()).toBeInstanceOf(ManualDnsOperator);
  });

  it('cloudflare 缺 CF_API_TOKEN 會 throw', () => {
    const f = new DnsOperatorFactory(
      makeConfig({ DEFAULT_DNS_PROVIDER: 'cloudflare' }),
    );
    expect(() => f.resolve()).toThrow(/CF_API_TOKEN/);
  });

  it('cloudflare 帶 token 回 CloudflareDnsOperator', () => {
    const f = new DnsOperatorFactory(
      makeConfig({
        DEFAULT_DNS_PROVIDER: 'cloudflare',
        CF_API_TOKEN: 'token',
      }),
    );
    expect(f.resolve()).toBeInstanceOf(CloudflareDnsOperator);
  });

  it('route53 缺 AWS credential 會 throw', () => {
    const f = new DnsOperatorFactory(
      makeConfig({ DEFAULT_DNS_PROVIDER: 'route53' }),
    );
    expect(() => f.resolve()).toThrow(
      /AWS_ACCESS_KEY_ID \+ AWS_SECRET_ACCESS_KEY/,
    );
  });

  it('google-cloud-dns 缺 SA JSON 會 throw', () => {
    const f = new DnsOperatorFactory(
      makeConfig({ DEFAULT_DNS_PROVIDER: 'google-cloud-dns' }),
    );
    expect(() => f.resolve()).toThrow(/GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON/);
  });
});
