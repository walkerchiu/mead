import { Logger } from '@nestjs/common';
import { DNS } from '@google-cloud/dns';
import {
  DnsConnectionTest,
  DnsOperator,
  DnsProviderName,
} from './dns-operator.interface';

/**
 * GoogleCloudDnsOperator — 真實實作，透過 @google-cloud/dns
 *
 * 認證：
 *   - service account JSON（存 SecretStore、由 factory 解出後塞進 constructor）
 *   - 或由 `GOOGLE_APPLICATION_CREDENTIALS` env（fallback，不建議給 per-tenant）
 *
 * Zone 解析：
 *   - 優先用 metadata.googleCloudManagedZone（建議預設）
 *   - 否則列所有 managed zones → 從 record name 從右往左找 DNS name 匹配
 *
 * 注意：
 *   - Cloud DNS TXT record RRDATA 必須用雙引號包裹：`"value"`
 *   - 同 `$zone` 的 TXT record 操作需讀再寫（Cloud DNS Change 是 additions + deletions）
 *   - Propagation 通常 < 60 秒
 *
 * 最小 IAM：
 *   roles/dns.admin on project（或更嚴格的 roles/dns.reader + 自訂含 changes.create 的角色）
 */
export class GoogleCloudDnsOperator implements DnsOperator {
  readonly provider: DnsProviderName = 'google-cloud-dns';
  private readonly logger = new Logger(GoogleCloudDnsOperator.name);
  private readonly dns: DNS;

  constructor(
    serviceAccountJson: string,
    private readonly managedZoneName?: string,
  ) {
    if (!serviceAccountJson) {
      throw new Error('GoogleCloudDnsOperator: serviceAccountJson required');
    }
    let credentials: { project_id?: string };
    try {
      credentials = JSON.parse(serviceAccountJson) as { project_id?: string };
    } catch (err) {
      throw new Error(
        `GoogleCloudDnsOperator: invalid service account JSON — ${(err as Error).message}`,
      );
    }
    if (!credentials.project_id) {
      throw new Error(
        'GoogleCloudDnsOperator: service account JSON missing project_id',
      );
    }
    this.dns = new DNS({
      projectId: credentials.project_id,
      credentials: credentials as Record<string, unknown>,
    } as ConstructorParameters<typeof DNS>[0]);
  }

  async writeTxt(name: string, value: string): Promise<void> {
    const zone = await this.resolveZone(name);
    await this.changeTxt(zone, name, value, 'add');
    this.logger.log(`[gcp-dns] TXT ${name} added (zone=${zone.name})`);
  }

  async removeTxt(name: string, value: string): Promise<void> {
    try {
      const zone = await this.resolveZone(name);
      await this.changeTxt(zone, name, value, 'remove');
      this.logger.log(`[gcp-dns] TXT ${name} removed`);
    } catch (err) {
      this.logger.warn(
        `[gcp-dns] removeTxt ${name} failed: ${(err as Error).message}`,
      );
    }
  }

  async testConnection(): Promise<DnsConnectionTest> {
    try {
      const [zones] = await this.dns.getZones();
      return {
        ok: true,
        zones: (zones as Array<{ metadata?: { dnsName?: string } }>).map(
          (z) => z.metadata?.dnsName?.replace(/\.$/, '') ?? '',
        ),
      };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  }

  // --- internals ---

  /**
   * 依 record name 找到對應 managed zone。
   * 例：`_acme-challenge.store.acme.com` → zone dnsName = `acme.com.`
   */
  private async resolveZone(recordName: string) {
    if (this.managedZoneName) {
      return this.dns.zone(this.managedZoneName);
    }
    const [zones] = await this.dns.getZones();
    const parts = recordName.endsWith('.')
      ? recordName.split('.')
      : `${recordName}.`.split('.');
    // 從右邊最後一個 `.` 往左逐層組合，找 dnsName 相同的 zone
    for (let i = 2; i <= parts.length; i++) {
      const candidate = parts.slice(parts.length - i).join('.');
      const matched = zones.find((z) => {
        const dnsName = (z as { metadata?: { dnsName?: string } }).metadata
          ?.dnsName;
        return dnsName === candidate || dnsName === `${candidate}.`;
      });
      if (matched) return matched;
    }
    throw new Error(
      `GoogleCloudDnsOperator: no managed zone matches ${recordName}`,
    );
  }

  /**
   * Cloud DNS 的 Change：同時用 deletions + additions 把「現有整條 RRSet + 目標 value 的 set 差集」寫回。
   */
  private async changeTxt(
    zone: ReturnType<DNS['zone']>,
    name: string,
    value: string,
    op: 'add' | 'remove',
  ): Promise<void> {
    const fqdn = name.endsWith('.') ? name : `${name}.`;
    const quoted = this.quoteValue(value);

    // 1. 讀現有 TXT record
    const [existingRecords] = await zone.getRecords({
      name: fqdn,
      type: 'TXT',
    });
    const existing = existingRecords[0];
    const currentValues = new Set<string>(existing?.metadata?.rrdatas ?? []);

    const next = new Set(currentValues);
    if (op === 'add') next.add(quoted);
    else next.delete(quoted);

    // 無變化
    if (
      next.size === currentValues.size &&
      Array.from(next).every((v) => currentValues.has(v))
    ) {
      return;
    }

    const deletions = existing ? [existing] : [];
    const additions =
      next.size > 0
        ? [
            zone.record('txt', {
              name: fqdn,
              ttl: 60,
              data: Array.from(next),
            }),
          ]
        : [];

    await zone.createChange({ add: additions, delete: deletions });
  }

  private quoteValue(raw: string): string {
    if (raw.startsWith('"') && raw.endsWith('"')) return raw;
    return `"${raw}"`;
  }
}
