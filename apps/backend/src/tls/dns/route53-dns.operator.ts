import { Logger } from '@nestjs/common';
import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  ListHostedZonesCommand,
  ListHostedZonesByNameCommand,
  ListResourceRecordSetsCommand,
  type ChangeAction,
} from '@aws-sdk/client-route-53';
import {
  DnsConnectionTest,
  DnsOperator,
  DnsProviderName,
} from './dns-operator.interface';

/**
 * Route53DnsOperator — AWS Route53 實作
 *
 * 寫 TXT record 用 `ChangeResourceRecordSets` 的 `UPSERT` action；
 * 刪用 `DELETE`（要提供完整 ResourceRecordSet 精確匹配）。
 *
 * Zone 解析：優先用 metadata.route53HostedZoneId；否則從 record name 從右往左
 * 逐層查 `ListHostedZonesByName` 找命中。
 *
 * 注意：
 * - Route53 TXT value 必須**外層加雙引號**，例如 `"base64url-value"`。本實作自動補。
 * - 同一 TXT name 可能有多個 values（例如多個 ACME 同時驗）— 我們先讀現有 values、
 *   合併（add 或 remove）後 UPSERT 整個 set，避免踢掉別的 record。
 * - Propagation 通常 < 60 秒；ACME 會 poll 解析。
 */
export class Route53DnsOperator implements DnsOperator {
  readonly provider: DnsProviderName = 'route53';
  private readonly logger = new Logger(Route53DnsOperator.name);
  private readonly client: Route53Client;

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    private readonly hostedZoneId?: string,
    region: string = 'us-east-1',
  ) {
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'Route53DnsOperator: accessKeyId + secretAccessKey required',
      );
    }
    this.client = new Route53Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async writeTxt(name: string, value: string): Promise<void> {
    const zoneId = await this.resolveZoneId(name);
    await this.change('UPSERT', zoneId, name, value);
    this.logger.log(`[r53-dns] TXT ${name} UPSERT (zone=${zoneId})`);
  }

  async removeTxt(name: string, value: string): Promise<void> {
    try {
      const zoneId = await this.resolveZoneId(name);
      await this.change('DELETE', zoneId, name, value);
      this.logger.log(`[r53-dns] TXT ${name} deleted`);
    } catch (err) {
      // best-effort — Route53 DELETE 需精確匹配值，找不到就略過
      this.logger.warn(
        `[r53-dns] removeTxt ${name} failed: ${(err as Error).message}`,
      );
    }
  }

  async testConnection(): Promise<DnsConnectionTest> {
    try {
      const res = await this.client.send(
        new ListHostedZonesCommand({ MaxItems: 50 }),
      );
      const zones =
        res.HostedZones?.map(
          (z) =>
            // Route53 zone name 有尾 dot；拿掉給人看得懂
            z.Name?.replace(/\.$/, '') ?? '',
        ).filter((n) => !!n) ?? [];
      return { ok: true, zones };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  }

  // --- internals ---

  /**
   * 讀現有 TXT record values → 加/減 → UPSERT 整組回去；
   * 若 remove 後為空則整個 DELETE。
   */
  private async change(
    action: ChangeAction,
    zoneId: string,
    name: string,
    value: string,
  ): Promise<void> {
    const existing = await this.listExistingTxt(zoneId, name);
    const quoted = this.quoteValue(value);

    const nextValues = new Set(existing);
    if (action === 'UPSERT') {
      nextValues.add(quoted);
    } else {
      nextValues.delete(quoted);
    }

    if (nextValues.size === 0) {
      // 清空：整個 set 刪掉
      if (existing.length > 0) {
        await this.client.send(
          new ChangeResourceRecordSetsCommand({
            HostedZoneId: zoneId,
            ChangeBatch: {
              Changes: [
                {
                  Action: 'DELETE',
                  ResourceRecordSet: {
                    Name: this.ensureFqdn(name),
                    Type: 'TXT',
                    TTL: 60,
                    ResourceRecords: existing.map((v) => ({ Value: v })),
                  },
                },
              ],
            },
          }),
        );
      }
      return;
    }

    await this.client.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: zoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: this.ensureFqdn(name),
                Type: 'TXT',
                TTL: 60,
                ResourceRecords: Array.from(nextValues).map((v) => ({
                  Value: v,
                })),
              },
            },
          ],
        },
      }),
    );
  }

  private async listExistingTxt(
    zoneId: string,
    name: string,
  ): Promise<string[]> {
    try {
      const res = await this.client.send(
        new ListResourceRecordSetsCommand({
          HostedZoneId: zoneId,
          StartRecordName: this.ensureFqdn(name),
          StartRecordType: 'TXT',
          MaxItems: 1,
        }),
      );
      const set = res.ResourceRecordSets?.find(
        (r) =>
          r.Type === 'TXT' &&
          r.Name?.toLowerCase() === this.ensureFqdn(name).toLowerCase(),
      );
      return (
        set?.ResourceRecords?.map((r) => r.Value ?? '').filter(Boolean) ?? []
      );
    } catch {
      return [];
    }
  }

  private async resolveZoneId(recordName: string): Promise<string> {
    if (this.hostedZoneId) return this.hostedZoneId;

    const parts = recordName.split('.');
    for (let i = Math.max(parts.length - 2, 2); i <= parts.length; i++) {
      const candidate = parts.slice(parts.length - i).join('.');
      const res = await this.client.send(
        new ListHostedZonesByNameCommand({ DNSName: candidate, MaxItems: 1 }),
      );
      const zone = res.HostedZones?.[0];
      const zoneName = zone?.Name?.replace(/\.$/, '');
      if (zone?.Id && zoneName?.toLowerCase() === candidate.toLowerCase()) {
        // Route53 zone Id 格式 `/hostedzone/XXXXX`；ChangeResourceRecordSets 也吃這格式
        return zone.Id;
      }
    }
    throw new Error(
      `Route53DnsOperator: no hosted zone found for ${recordName}`,
    );
  }

  private ensureFqdn(name: string): string {
    return name.endsWith('.') ? name : `${name}.`;
  }

  private quoteValue(raw: string): string {
    if (raw.startsWith('"') && raw.endsWith('"')) return raw;
    return `"${raw}"`;
  }
}
