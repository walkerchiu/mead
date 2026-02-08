import { Logger } from '@nestjs/common';
import {
  DnsConnectionTest,
  DnsOperator,
  DnsProviderName,
} from './dns-operator.interface';

/**
 * ManualDnsOperator
 *
 * Fallback 實作：只記 log 要求 ops 手動加 TXT record。
 * ACME issue 流程會等 DNS 可解析 — 若沒加，LE verify 會 timeout → issue 失敗。
 *
 * 適用場景：
 * - DNS 不是支援的 provider
 * - 不想給 API token
 * - Dev 環境快速測試
 */
export class ManualDnsOperator implements DnsOperator {
  readonly provider: DnsProviderName = 'manual';
  private readonly logger = new Logger(ManualDnsOperator.name);

  writeTxt(name: string, value: string): Promise<void> {
    this.logger.warn(`[manual-dns] PLEASE add TXT: ${name} "${value}"`);
    return Promise.resolve();
  }

  removeTxt(name: string, _value: string): Promise<void> {
    void _value;
    this.logger.log(`[manual-dns] can remove TXT: ${name}`);
    return Promise.resolve();
  }

  testConnection(): Promise<DnsConnectionTest> {
    return Promise.resolve({
      ok: true,
      reason: 'manual mode — 自行設 DNS；ACME verify 會實際驗證',
    });
  }
}
