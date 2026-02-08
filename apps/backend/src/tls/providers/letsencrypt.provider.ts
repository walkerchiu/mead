import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as acme from 'acme-client';
import { createHash } from 'node:crypto';
import {
  CertProvider,
  CertStatusResult,
  IssueCertRequest,
  IssuedCertMetadata,
  RenewResult,
} from '../cert-provider.interface';
import { SECRET_STORE, SecretStore } from '../secret-store.interface';

/**
 * LetsEncryptCertProvider — 預設 TLS provider
 *
 * 流程（DNS-01 challenge）：
 *   1. 從 secret store 拿（或生）account key
 *   2. 建立 ACME client，向 LE directory 註冊 account
 *   3. createOrder({ identifiers: [{type:'dns', value: domain}] })
 *   4. 對每個 challenge：拿 keyAuthorization → hash → dnsOperator 寫 TXT
 *   5. LE verify；通過後 finalizeOrder 拿 cert chain
 *   6. 把 privateKey + cert chain 寫 secret store，回傳 secretRef
 *
 * 重要設定：
 * - `ACME_DIRECTORY_URL`：production / staging（預設 staging 防誤 rate-limit）
 * - `ACME_CONTACT_EMAIL`：LE account email（過期通知）
 * - `IssueCertRequest.dnsOperator` 必填（DNS-01 需要寫 TXT）
 */
@Injectable()
export class LetsEncryptCertProvider implements CertProvider {
  readonly name = 'letsencrypt' as const;
  private readonly logger = new Logger(LetsEncryptCertProvider.name);
  private readonly directoryUrl: string;
  private readonly defaultContactEmail: string;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SECRET_STORE) private readonly secrets: SecretStore,
  ) {
    this.directoryUrl = this.config.get<string>(
      'ACME_DIRECTORY_URL',
      acme.directory.letsencrypt.staging,
    );
    this.defaultContactEmail = this.config.get<string>(
      'ACME_CONTACT_EMAIL',
      '',
    );
  }

  isConfigured(): boolean {
    return !!this.defaultContactEmail;
  }

  async issue(req: IssueCertRequest): Promise<IssuedCertMetadata> {
    this.assertReady(req);
    const client = await this.makeClient();

    const [certKey, csr] = await acme.crypto.createCsr({
      commonName: req.domain,
      altNames: req.additionalDomains,
    });

    const cert: string = await client.auto({
      csr,
      email: req.contactEmail,
      termsOfServiceAgreed: true,
      challengePriority: ['dns-01'],
      challengeCreateFn: async (_authz, challenge, keyAuthorization) => {
        if (challenge.type !== 'dns-01') {
          throw new Error(`Unsupported challenge: ${challenge.type}`);
        }
        const host = `_acme-challenge.${req.domain}`;
        const value = this.dnsTxtValue(keyAuthorization);
        await req.dnsOperator.writeTxt(host, value);
        this.logger.log(`[LE] wrote TXT ${host}`);
      },
      challengeRemoveFn: async (_authz, challenge, keyAuthorization) => {
        if (challenge.type !== 'dns-01') return;
        const host = `_acme-challenge.${req.domain}`;
        const value = this.dnsTxtValue(keyAuthorization);
        await req.dnsOperator.removeTxt(host, value).catch(() => undefined);
      },
    });

    // 持久化 account URL — 下次 issue 重用同一 LE account
    try {
      const accountUrl = client.getAccountUrl();
      if (accountUrl) {
        await this.secrets.writeRaw('tls/acme/account-url', accountUrl);
      }
    } catch {
      // 未 init 時 throw；忽略
    }

    const info = acme.crypto.readCertificateInfo(cert);

    const secretRef = `${req.secretRefPrefix}/${req.domain}`;
    await this.secrets.write(secretRef, {
      privateKey: certKey.toString('utf8'),
      certificateChain: cert,
    });

    return {
      provider: this.name,
      challengeType: 'dns-01',
      issuer: info.issuer.commonName ?? "Let's Encrypt",
      notBefore: info.notBefore,
      notAfter: info.notAfter,
      fingerprintSha256: createHash('sha256').update(cert).digest('hex'),
      secretRef,
      externalId: secretRef,
    };
  }

  async renew(req: IssueCertRequest): Promise<RenewResult> {
    const next = await this.issue(req);
    return { ...next, renewedFrom: '' };
  }

  async revoke(externalId: string, reason?: string): Promise<void> {
    this.logger.warn(
      `[LE] revoke requested for ${externalId}${reason ? ` (${reason})` : ''} — 實際 ACME revoke 尚未實作`,
    );
    await this.secrets.markRevoked(externalId);
  }

  async checkStatus(externalId: string): Promise<CertStatusResult> {
    try {
      const secret = await this.secrets.read(externalId);
      if (!secret) return { externalId, status: 'unknown' };
      const info = acme.crypto.readCertificateInfo(secret.certificateChain);
      const now = Date.now();
      const thirtyDays = 30 * 24 * 3600 * 1000;
      if (info.notAfter.getTime() < now) {
        return { externalId, status: 'expired', notAfter: info.notAfter };
      }
      if (info.notAfter.getTime() - now < thirtyDays) {
        return {
          externalId,
          status: 'expiring_soon',
          notAfter: info.notAfter,
        };
      }
      return { externalId, status: 'valid', notAfter: info.notAfter };
    } catch (err) {
      this.logger.warn(
        `[LE] checkStatus ${externalId} failed: ${(err as Error).message}`,
      );
      return { externalId, status: 'unknown' };
    }
  }

  // --- internals ---

  private assertReady(req: IssueCertRequest): void {
    if (!this.isConfigured()) {
      throw new Error(
        'LetsEncryptCertProvider not configured (需要 ACME_CONTACT_EMAIL)',
      );
    }
    if (!req.dnsOperator) {
      throw new Error(
        'LE DNS-01 challenge 需要 req.dnsOperator — 請先接上 DNS provider',
      );
    }
  }

  private async makeClient(): Promise<acme.Client> {
    const accountKeyRef = 'tls/acme/account-key';
    let accountKeyPem: string;
    const existing = await this.secrets.readRaw(accountKeyRef);
    if (existing) {
      accountKeyPem = existing;
    } else {
      accountKeyPem = (await acme.crypto.createPrivateKey()).toString();
      await this.secrets.writeRaw(accountKeyRef, accountKeyPem);
    }
    return new acme.Client({
      directoryUrl: this.directoryUrl,
      accountKey: accountKeyPem,
      accountUrl:
        (await this.secrets.readRaw('tls/acme/account-url')) ?? undefined,
    });
  }

  private dnsTxtValue(keyAuthorization: string): string {
    return createHash('sha256').update(keyAuthorization).digest('base64url');
  }
}
