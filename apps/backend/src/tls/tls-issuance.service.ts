import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CertProviderFactory } from './cert-provider.factory';
import {
  CertProviderName,
  CertStatusResult,
  IssuedCertMetadata,
  RenewResult,
} from './cert-provider.interface';
import { DnsOperatorFactory } from './dns/dns-operator.factory';
import { SECRET_STORE, SecretStore } from './secret-store.interface';

export interface IssueRequest {
  domain: string;
  additionalDomains?: string[];
  contactEmail?: string;
  /** 強制使用某個 provider；未填走 default */
  providerOverride?: CertProviderName;
  /** SecretStore key 前綴；未填用 'tls' */
  secretRefPrefix?: string;
}

/**
 * TlsIssuanceService（單租戶版）
 *
 * Orchestrator：整合 CertProviderFactory + DnsOperatorFactory + SecretStore。
 *
 * 與 tenant 版差異：
 * - 不寫 DB（沒有 TenantCertificate entity）
 * - 不做 customDomain 狀態機聯動
 * - 沒有 BullMQ queue / worker — 同步呼叫
 * - cron expiry-scan 由 ops 自行視需求另外排
 *
 * 使用方式：
 *   await tlsIssuance.issue({ domain: 'app.example.com' });
 *   await tlsIssuance.renew({ externalId, domain: 'app.example.com' });
 *   await tlsIssuance.checkStatus(externalId, providerName);
 */
@Injectable()
export class TlsIssuanceService {
  private readonly logger = new Logger(TlsIssuanceService.name);

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(CertProviderFactory)
    private readonly providers: CertProviderFactory,
    @Inject(DnsOperatorFactory)
    private readonly dnsOperators: DnsOperatorFactory,
    @Inject(SECRET_STORE) private readonly secrets: SecretStore,
  ) {}

  async issue(input: IssueRequest): Promise<IssuedCertMetadata> {
    const provider = input.providerOverride
      ? this.providers.byName(input.providerOverride)
      : this.providers.default();
    if (!provider.isConfigured()) {
      throw new Error(
        `Cert provider ${provider.name} not configured — 請補 env 變數`,
      );
    }

    const meta = await provider.issue({
      domain: input.domain,
      additionalDomains: input.additionalDomains,
      contactEmail: input.contactEmail ?? this.defaultContactEmail(),
      dnsOperator: this.dnsOperators.resolve(),
      secretRefPrefix: input.secretRefPrefix ?? 'tls',
    });

    this.logger.log(
      `[TLS] ${input.domain} ISSUED (provider=${provider.name}, notAfter=${meta.notAfter.toISOString()})`,
    );
    return meta;
  }

  async renew(input: {
    externalId: string;
    domain: string;
    additionalDomains?: string[];
    contactEmail?: string;
    providerName?: CertProviderName;
    secretRefPrefix?: string;
  }): Promise<RenewResult> {
    const provider = input.providerName
      ? this.providers.byName(input.providerName)
      : this.providers.default();

    const meta = await provider.renew({
      domain: input.domain,
      additionalDomains: input.additionalDomains,
      contactEmail: input.contactEmail ?? this.defaultContactEmail(),
      dnsOperator: this.dnsOperators.resolve(),
      secretRefPrefix: input.secretRefPrefix ?? 'tls',
    });

    this.logger.log(
      `[TLS] ${input.domain} RENEWED (provider=${provider.name}, notAfter=${meta.notAfter.toISOString()})`,
    );
    return { ...meta, renewedFrom: input.externalId };
  }

  async revoke(
    externalId: string,
    providerName?: CertProviderName,
    reason?: string,
  ): Promise<void> {
    const provider = providerName
      ? this.providers.byName(providerName)
      : this.providers.default();
    await provider.revoke(externalId, reason);
    this.logger.log(
      `[TLS] ${externalId} REVOKED${reason ? ` (${reason})` : ''}`,
    );
  }

  async checkStatus(
    externalId: string,
    providerName?: CertProviderName,
  ): Promise<CertStatusResult> {
    const provider = providerName
      ? this.providers.byName(providerName)
      : this.providers.default();
    return provider.checkStatus(externalId);
  }

  /** 暴露 SecretStore 給呼叫者讀 cert / key（部署 nginx / 反代用） */
  async readSecret(secretRef: string) {
    return this.secrets.read(secretRef);
  }

  // --- internals ---

  private defaultContactEmail(): string {
    return this.config.get<string>('ACME_CONTACT_EMAIL') ?? 'ops@example.com';
  }
}
