import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DnsOperator, DnsProviderName } from './dns-operator.interface';
import { ManualDnsOperator } from './manual-dns.operator';
import { CloudflareDnsOperator } from './cloudflare-dns.operator';
import { Route53DnsOperator } from './route53-dns.operator';
import { GoogleCloudDnsOperator } from './google-cloud-dns.operator';

/**
 * DnsOperatorFactory（單租戶版）
 *
 * 依 `DEFAULT_DNS_PROVIDER` env 與相對應 credential env 解析 DnsOperator：
 *   - manual：log-only，需要 ops 手動加 TXT
 *   - cloudflare：CF_API_TOKEN（可選 CF_ZONE_ID）
 *   - route53：AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY（可選 ROUTE53_HOSTED_ZONE_ID）
 *   - google-cloud-dns：GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON（可選 GOOGLE_CLOUD_MANAGED_ZONE）
 */
@Injectable()
export class DnsOperatorFactory {
  private readonly logger = new Logger(DnsOperatorFactory.name);
  private readonly providerName: DnsProviderName;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.providerName = this.parseProviderName(
      this.config.get<string>('DEFAULT_DNS_PROVIDER', 'manual'),
    );
    this.logger.log(`[DnsOperatorFactory] provider = ${this.providerName}`);
  }

  /** 取得當前 DnsOperator */
  resolve(): DnsOperator {
    switch (this.providerName) {
      case 'cloudflare':
        return this.buildCloudflare();
      case 'route53':
        return this.buildRoute53();
      case 'google-cloud-dns':
        return this.buildGoogleCloudDns();
      case 'manual':
      default:
        return new ManualDnsOperator();
    }
  }

  /** 連線測試 */
  async test(): Promise<ReturnType<DnsOperator['testConnection']>> {
    return this.resolve().testConnection();
  }

  // --- internals ---

  private buildCloudflare(): DnsOperator {
    const token = this.config.get<string>('CF_API_TOKEN');
    if (!token) {
      throw new Error(
        '[DnsOperatorFactory] DEFAULT_DNS_PROVIDER=cloudflare requires CF_API_TOKEN',
      );
    }
    const zoneId = this.config.get<string>('CF_ZONE_ID');
    return new CloudflareDnsOperator(token, zoneId);
  }

  private buildRoute53(): DnsOperator {
    const accessKey = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (!accessKey || !secretKey) {
      throw new Error(
        '[DnsOperatorFactory] DEFAULT_DNS_PROVIDER=route53 requires AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY',
      );
    }
    const hostedZoneId = this.config.get<string>('ROUTE53_HOSTED_ZONE_ID');
    return new Route53DnsOperator(accessKey, secretKey, hostedZoneId);
  }

  private buildGoogleCloudDns(): DnsOperator {
    const json = this.config.get<string>('GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON');
    if (!json) {
      throw new Error(
        '[DnsOperatorFactory] DEFAULT_DNS_PROVIDER=google-cloud-dns requires GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON',
      );
    }
    const managedZone = this.config.get<string>('GOOGLE_CLOUD_MANAGED_ZONE');
    return new GoogleCloudDnsOperator(json, managedZone);
  }

  private parseProviderName(raw: string): DnsProviderName {
    if (
      raw === 'cloudflare' ||
      raw === 'route53' ||
      raw === 'google-cloud-dns' ||
      raw === 'manual'
    ) {
      return raw;
    }
    this.logger.warn(
      `[DnsOperatorFactory] Unknown DEFAULT_DNS_PROVIDER=${raw}, fallback to manual`,
    );
    return 'manual';
  }
}
