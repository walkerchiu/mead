import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import {
  CertProvider,
  CertStatusResult,
  IssueCertRequest,
  IssuedCertMetadata,
  RenewResult,
} from '../cert-provider.interface';
import { SECRET_STORE, SecretStore } from '../secret-store.interface';

interface CfOriginCaResponse {
  result?: {
    id?: string;
    certificate?: string;
    csr?: string;
    hostnames?: string[];
    expires_on?: string;
    request_type?: string;
    requested_validity?: number;
  };
}

/**
 * CloudflareCertProvider — 真實實作
 *
 * 支援兩種模式（`CF_CERT_MODE` 切換，預設 origin-ca）：
 *
 * 1. **origin-ca**（預設）
 *    - 呼叫 `POST /certificates` 取得 CF 自簽的 Origin CA cert
 *    - 15 年有效；只在「CF 邊緣 ↔ origin server」這段 TLS 有效
 *    - 需要 `CF_API_TOKEN`（`User:User Details:Read` + `User:API Tokens:Edit` 其實就夠 — Origin CA Key 是 user-scope）
 *    - 備註：Origin CA API 老版本要用 `X-Auth-User-Service-Key` 做認證；新版 Bearer token 也支援，建議用 Bearer。
 *
 * 2. **universal-ssl**（CF 邊緣簽好 public cert）
 *    - 我們**不**主動 issue — CF 在 zone 掛進 account 時就自動簽
 *    - 這個 provider 只查 `GET /zones/{zone_id}/ssl/verification` 回 active/expiring
 *    - 需要 `CF_API_TOKEN` + `CF_ZONE_ID`
 *
 * 注意：
 * - CF 不提供 CSR 以外的 private key（origin-ca 走 CF 產生 CSR+key 並一起回）
 * - private key 存 SecretStore；externalId 存 CF cert id（`universal-ssl` 模式存 zone_id）
 */
@Injectable()
export class CloudflareCertProvider implements CertProvider {
  readonly name = 'cloudflare' as const;
  private readonly logger = new Logger(CloudflareCertProvider.name);
  private static readonly API_BASE = 'https://api.cloudflare.com/client/v4';

  private readonly apiToken: string;
  private readonly mode: 'origin-ca' | 'universal-ssl';
  private readonly zoneId?: string;
  /** Origin CA 請求 validity（天）— 最大 5475 (15 年) */
  private readonly validityDays: number;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SECRET_STORE) private readonly secrets: SecretStore,
  ) {
    this.apiToken = this.config.get<string>('CF_API_TOKEN', '');
    this.mode =
      (this.config.get<string>('CF_CERT_MODE') as
        | 'origin-ca'
        | 'universal-ssl') ?? 'origin-ca';
    this.zoneId = this.config.get<string>('CF_ZONE_ID');
    this.validityDays = parseInt(
      this.config.get<string>('CF_CERT_VALIDITY_DAYS', '5475'),
      10,
    );
  }

  isConfigured(): boolean {
    if (!this.apiToken) return false;
    if (this.mode === 'universal-ssl' && !this.zoneId) return false;
    return true;
  }

  async issue(req: IssueCertRequest): Promise<IssuedCertMetadata> {
    this.assertReady();
    if (this.mode === 'universal-ssl') {
      return this.queryUniversalSsl(req);
    }
    return this.issueOriginCa(req);
  }

  async renew(req: IssueCertRequest): Promise<RenewResult> {
    // origin-ca：revoke 舊 + 簽新（15 年 cert 通常不需要 renew，除非要換 key）
    // universal-ssl：CF 自動 renew；我們只要再跑一次狀態查即可
    const next = await this.issue(req);
    return { ...next, renewedFrom: '' };
  }

  async revoke(externalId: string): Promise<void> {
    this.assertReady();
    if (this.mode === 'universal-ssl') {
      this.logger.warn(
        `[cf-cert] universal-ssl 模式不支援 revoke（CF 邊緣自管）— 略過`,
      );
      return;
    }
    const res = await this.api<{ success: boolean }>(
      'DELETE',
      `/certificates/${externalId}`,
    );
    if (!res.success) {
      throw new Error(`Cloudflare revoke failed for ${externalId}`);
    }
    this.logger.log(`[cf-cert] origin-ca ${externalId} revoked`);
  }

  async checkStatus(externalId: string): Promise<CertStatusResult> {
    this.assertReady();
    try {
      if (this.mode === 'universal-ssl') {
        const res = await this.api<{
          result?: Array<{
            certificate_status: string;
            hostname: string;
            validation_method: string;
            certificates?: Array<{ expires_on?: string }>;
          }>;
        }>('GET', `/zones/${externalId}/ssl/verification`);
        const status = res.result?.[0]?.certificate_status;
        const notAfterStr = res.result?.[0]?.certificates?.[0]?.expires_on;
        const notAfter = notAfterStr ? new Date(notAfterStr) : undefined;
        return {
          externalId,
          status: this.mapUniversalStatus(status, notAfter),
          notAfter,
        };
      }
      // origin-ca：GET /certificates/{id}
      const res = await this.api<{
        result?: {
          id: string;
          expires_on?: string;
          revoked_at?: string;
        };
      }>('GET', `/certificates/${externalId}`);
      if (!res.result) return { externalId, status: 'unknown' };
      if (res.result.revoked_at) {
        return { externalId, status: 'revoked' };
      }
      const notAfter = res.result.expires_on
        ? new Date(res.result.expires_on)
        : undefined;
      return this.statusFromNotAfter(externalId, notAfter);
    } catch (err) {
      this.logger.warn(
        `[cf-cert] checkStatus ${externalId} failed: ${(err as Error).message}`,
      );
      return { externalId, status: 'unknown' };
    }
  }

  // --- mode: origin-ca ---

  private async issueOriginCa(
    req: IssueCertRequest,
  ): Promise<IssuedCertMetadata> {
    // CF API：POST /certificates 接受 user 提供的 CSR；若不給 CF 幫你生 key
    // 這裡讓 CF 生（簡化流程）— 回傳含 certificate + 透過另一個 POST 拿 key 是複雜路徑
    // 因為 CF 不回 private key（安全設計），實務通常要求 user 自帶 CSR
    //
    // TODO（production 使用）：
    //   1. 本地用 node crypto 生 key + CSR（domain + altNames）
    //   2. POST /certificates { csr, hostnames, request_type: 'origin-rsa', requested_validity: 5475 }
    //   3. 回 response 含 certificate（key 自己留著）
    //   4. 把 key + cert 一起寫 SecretStore
    //
    // 此處提供 CSR-based 流程的最簡實作：
    const { privateKeyPem, csrPem } = await this.createCsr(
      req.domain,
      req.additionalDomains ?? [],
    );

    const res = await this.api<CfOriginCaResponse>('POST', '/certificates', {
      hostnames: [req.domain, ...(req.additionalDomains ?? [])],
      requested_validity: this.validityDays,
      request_type: 'origin-rsa',
      csr: csrPem,
    });

    if (!res.result?.id || !res.result?.certificate) {
      throw new Error('CloudflareCertProvider: origin-ca issue incomplete');
    }

    const chain = res.result.certificate;
    const notAfter = res.result.expires_on
      ? new Date(res.result.expires_on)
      : new Date(Date.now() + this.validityDays * 86400_000);

    const secretRef = `${req.secretRefPrefix}/${req.domain}`;
    await this.secrets.write(secretRef, {
      privateKey: privateKeyPem,
      certificateChain: chain,
    });

    return {
      provider: this.name,
      challengeType: 'none', // Origin CA 不做 ACME challenge
      issuer: 'Cloudflare Origin CA',
      notBefore: new Date(),
      notAfter,
      fingerprintSha256: createHash('sha256').update(chain).digest('hex'),
      secretRef,
      externalId: res.result.id,
    };
  }

  // --- mode: universal-ssl ---

  private async queryUniversalSsl(
    req: IssueCertRequest,
  ): Promise<IssuedCertMetadata> {
    if (!this.zoneId) {
      throw new Error('CF_ZONE_ID required for universal-ssl mode');
    }
    const res = await this.api<{
      result?: Array<{
        certificate_status: string;
        certificates?: Array<{ expires_on?: string }>;
      }>;
    }>('GET', `/zones/${this.zoneId}/ssl/verification`);
    const first = res.result?.[0];
    if (!first) {
      throw new Error(
        `CloudflareCertProvider: no SSL verification info for zone ${this.zoneId}`,
      );
    }
    const notAfterStr = first.certificates?.[0]?.expires_on;
    const notAfter = notAfterStr
      ? new Date(notAfterStr)
      : new Date(Date.now() + 90 * 86400_000);

    // universal-ssl 沒 private key（CF 邊緣持有）；SecretStore 寫個 placeholder 記錄 cert state
    const secretRef = `${req.secretRefPrefix}/${req.domain}`;
    await this.secrets.write(secretRef, {
      privateKey: '',
      certificateChain:
        '# Cloudflare Universal SSL — key/chain managed by CF edge, no export',
    });

    return {
      provider: this.name,
      challengeType: 'none',
      issuer: 'Cloudflare Universal SSL',
      notBefore: new Date(),
      notAfter,
      secretRef,
      externalId: this.zoneId, // universal-ssl 用 zone_id 當識別
    };
  }

  // --- helpers ---

  private assertReady(): void {
    if (!this.isConfigured()) {
      throw new Error(
        `CloudflareCertProvider not configured (needs CF_API_TOKEN${this.mode === 'universal-ssl' ? ' + CF_ZONE_ID' : ''})`,
      );
    }
  }

  private async api<T = { result?: unknown; success?: boolean }>(
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${CloudflareCertProvider.API_BASE}${path}`, {
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

  private async createCsr(
    commonName: string,
    altNames: string[],
  ): Promise<{ privateKeyPem: string; csrPem: string }> {
    // 用 acme-client.crypto 生 CSR（避免另裝 csr-generator）
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const acme = require('acme-client') as typeof import('acme-client');
    const [keyBuf, csrBuf] = await acme.crypto.createCsr({
      commonName,
      altNames,
    });
    return {
      privateKeyPem: keyBuf.toString('utf8'),
      csrPem: csrBuf.toString('utf8'),
    };
  }

  private statusFromNotAfter(
    externalId: string,
    notAfter?: Date,
  ): CertStatusResult {
    if (!notAfter) return { externalId, status: 'unknown' };
    const now = Date.now();
    if (notAfter.getTime() < now) {
      return { externalId, status: 'expired', notAfter };
    }
    if (notAfter.getTime() - now < 30 * 86400_000) {
      return { externalId, status: 'expiring_soon', notAfter };
    }
    return { externalId, status: 'valid', notAfter };
  }

  private mapUniversalStatus(
    raw: string | undefined,
    notAfter: Date | undefined,
  ): CertStatusResult['status'] {
    // CF 文件：active / pending_validation / initializing / expired / ...
    if (!raw) return 'unknown';
    if (raw === 'active') {
      if (notAfter && notAfter.getTime() - Date.now() < 30 * 86400_000)
        return 'expiring_soon';
      return 'valid';
    }
    if (raw === 'expired') return 'expired';
    return 'unknown';
  }
}
