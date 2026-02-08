import { Logger } from '@nestjs/common';
import {
  DnsConnectionTest,
  DnsOperator,
  DnsProviderName,
} from './dns-operator.interface';

/**
 * CloudflareDnsOperator — 真實實作，透過 Cloudflare API v4
 *
 * API reference：https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records
 *
 * 權限需求（API Token scope）：
 * - Zone → DNS → Edit（針對要操作的 zone）
 * - Zone → Zone → Read（用來 auto-resolve zone id）
 *
 * 流程：
 *   writeTxt(name, value):
 *     1. 從 name 推出 zone → 呼叫 GET /zones?name=... 拿 zone_id（若未預設）
 *     2. POST /zones/{zone_id}/dns_records  { type:'TXT', name, content: value, ttl: 60 }
 *     3. 存下 record_id（用 in-memory map，key=`${name}|${value}`）讓 removeTxt 可刪
 *
 *   removeTxt(name, value):
 *     1. 若 memory 有 record_id → DELETE /zones/{zone_id}/dns_records/{record_id}
 *     2. 否則 fallback：列 zone 裡所有 type=TXT name=... 的 records，找到 value 相符的刪
 *
 * 注意：
 * - Cloudflare propagation 通常 1-30 秒；LE 會 poll driver（acme-client 預設 1 分鐘）
 * - 若 zone 在 CF 但 DNS 走 partial 模式（CNAME setup），這個 operator 仍能動（還是寫到 CF 權威）
 * - multi-zone tenant（例如 *.acme.com + *.acme.io）由 factory 負責挑正確 zone（或建多個 operator）
 */
export class CloudflareDnsOperator implements DnsOperator {
  readonly provider: DnsProviderName = 'cloudflare';
  private readonly logger = new Logger(CloudflareDnsOperator.name);
  private static readonly API_BASE = 'https://api.cloudflare.com/client/v4';

  /** `${name}|${value}` → record_id（用於 removeTxt） */
  private readonly recordIdCache = new Map<string, string>();

  constructor(
    private readonly apiToken: string,
    /** 可選預設 zone_id；未設則走 auto-resolve */
    private readonly defaultZoneId?: string,
  ) {
    if (!apiToken) {
      throw new Error('CloudflareDnsOperator: apiToken required');
    }
  }

  async writeTxt(name: string, value: string): Promise<void> {
    const zoneId = await this.resolveZoneId(name);
    const res = await this.api('POST', `/zones/${zoneId}/dns_records`, {
      type: 'TXT',
      name,
      content: value,
      ttl: 60,
      comment: 'npt-acme-challenge (auto)',
    });
    const recordId = (res.result as { id: string } | undefined)?.id;
    if (recordId) {
      this.recordIdCache.set(this.key(name, value), recordId);
    }
    this.logger.log(`[cf-dns] TXT ${name} written (zone=${zoneId})`);
  }

  async removeTxt(name: string, value: string): Promise<void> {
    const cacheKey = this.key(name, value);
    let recordId = this.recordIdCache.get(cacheKey);
    const zoneId = await this.resolveZoneId(name);

    if (!recordId) {
      // fallback：查 zone 找對應 TXT
      const list = await this.api<{
        result: Array<{ id: string; name: string; content: string }>;
      }>(
        'GET',
        `/zones/${zoneId}/dns_records?type=TXT&name=${encodeURIComponent(name)}`,
      );
      const match = list.result?.find((r) => r.content === value);
      recordId = match?.id;
    }

    if (!recordId) {
      this.logger.warn(`[cf-dns] removeTxt: no matching record for ${name}`);
      return;
    }
    try {
      await this.api('DELETE', `/zones/${zoneId}/dns_records/${recordId}`);
      this.recordIdCache.delete(cacheKey);
      this.logger.log(`[cf-dns] TXT ${name} removed`);
    } catch (err) {
      // best-effort — 不拋
      this.logger.warn(
        `[cf-dns] removeTxt ${name} failed: ${(err as Error).message}`,
      );
    }
  }

  async testConnection(): Promise<DnsConnectionTest> {
    try {
      // 先驗 token 本身
      const verify = await this.api<{
        result: { status: string; id: string };
      }>('GET', '/user/tokens/verify');
      if (verify.result?.status !== 'active') {
        return { ok: false, reason: `token status=${verify.result?.status}` };
      }

      // 列 token 可見的 zones（前 50；一般 tenant 不會這麼多）
      const zones = await this.api<{
        result: Array<{ name: string }>;
      }>('GET', '/zones?per_page=50');
      return {
        ok: true,
        zones: zones.result?.map((z) => z.name) ?? [],
      };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  }

  // --- internals ---

  /**
   * 從 record name（FQDN）推出 zone。例：`_acme-challenge.store.acme.com` → `acme.com` zone
   */
  private async resolveZoneId(recordName: string): Promise<string> {
    if (this.defaultZoneId) return this.defaultZoneId;

    // 從右邊往左逐層試：acme.com → store.acme.com → _acme-challenge.store.acme.com
    const parts = recordName.split('.');
    for (let i = Math.max(parts.length - 2, 2); i <= parts.length; i++) {
      const candidate = parts.slice(parts.length - i).join('.');
      const res = await this.api<{
        result: Array<{ id: string; name: string }>;
      }>('GET', `/zones?name=${encodeURIComponent(candidate)}`);
      const match = res.result?.[0];
      if (match?.id) return match.id;
    }
    throw new Error(
      `CloudflareDnsOperator: no zone found for ${recordName} (check API token scope)`,
    );
  }

  private async api<T = { result?: unknown }>(
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${CloudflareDnsOperator.API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as {
      success: boolean;
      errors?: Array<{ message: string }>;
      result?: unknown;
    };
    if (!res.ok || !json.success) {
      const msg =
        json.errors?.map((e) => e.message).join('; ') ?? `HTTP ${res.status}`;
      throw new Error(`Cloudflare API ${method} ${path}: ${msg}`);
    }
    return json as unknown as T;
  }

  private key(name: string, value: string): string {
    return `${name}|${value}`;
  }
}
