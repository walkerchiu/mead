import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ACMClient,
  RequestCertificateCommand,
  DescribeCertificateCommand,
  DeleteCertificateCommand,
} from '@aws-sdk/client-acm';
import {
  CertProvider,
  CertStatusResult,
  IssueCertRequest,
  IssuedCertMetadata,
  RenewResult,
} from '../cert-provider.interface';

/**
 * AwsAcmCertProvider — AWS Certificate Manager（ACM）
 *
 * ACM 特性：
 * - 免費，**只能**配合 AWS 邊緣使用（ALB、CloudFront、API Gateway、AppSync）
 * - 不提供 private key export（自管 nginx / origin 要走 ACM Private CA 另計）
 * - 走 DNS validation：RequestCertificate 後 ACM 生成 validation CNAME；
 *   用戶需要把 CNAME 加到自己 DNS → ACM poll 驗證
 * - managed renewal：cert 快到期前 ACM 自動續，只要 validation CNAME 還在
 *
 * 流程：
 *   issue():
 *     1. RequestCertificate(DNS validation) → 拿 arn（幾秒內 pending validation）
 *     2. DescribeCertificate poll 直到 DomainValidationOptions 齊備（通常 < 30 秒）
 *     3. 記 WARN log 提示 HQ admin 加 validation CNAME（ACM 是 CNAME；標準 DnsOperator 是 TXT；
 *        不自動跨 record-type 寫 — 未來擴 DnsOperator.writeCname 即可自動化）
 *     4. 回 metadata（arn 當 externalId；secretRef 空因為 ACM 不 export key）
 *   checkStatus(): DescribeCertificate 看 Status + NotAfter
 *   revoke(): DeleteCertificate（ACM 不支援真正 revoke，只能 delete）
 *
 * 注意：
 * - CloudFront 用的 cert 必須放 us-east-1；ALB 放對應 region
 * - issue() 回的 notAfter 是預估值（395 天）；實際要 checkStatus 拿精確
 */
@Injectable()
export class AwsAcmCertProvider implements CertProvider {
  readonly name = 'aws-acm' as const;
  private readonly logger = new Logger(AwsAcmCertProvider.name);
  /** DescribeCertificate poll 用 — 等 ACM 把 validation options 填進來 */
  private static readonly POLL_INTERVAL_MS = 3000;
  private static readonly POLL_TIMEOUT_MS = 30_000;

  // 註：顯式 @Inject 是為了讓 tsx/esbuild 正確 emit constructor param 的
  // `design:paramtypes` 元資料。single-param constructor 沒有任何 param decorator
  // 時，esbuild 會跳過這段 metadata，導致 NestJS 注入不到 ConfigService（this.config 變 undefined）。
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  /** 每次讀 env 時 lazy 取，避免 constructor 階段 this.config 未注入（ts-node/tsx emitDecoratorMetadata 邊界情境）時整個 Nest boot 失敗。 */
  private get region(): string {
    return (
      this.config?.get<string>('AWS_ACM_REGION', 'us-east-1') ?? 'us-east-1'
    );
  }
  private get accessKey(): string | undefined {
    return this.config?.get<string>('AWS_ACCESS_KEY_ID');
  }
  private get secretKey(): string | undefined {
    return this.config?.get<string>('AWS_SECRET_ACCESS_KEY');
  }

  /**
   * SDK 會自動從 env / instance profile 解析 credential；region 有就算 ready。
   * 真正認證失敗會在呼叫 API 時報。
   */
  isConfigured(): boolean {
    return !!this.region;
  }

  async issue(req: IssueCertRequest): Promise<IssuedCertMetadata> {
    this.assertReady();
    const client = this.makeClient();

    const idempotencyToken = this.makeIdempotencyToken(req.domain);

    const req1 = await client.send(
      new RequestCertificateCommand({
        DomainName: req.domain,
        SubjectAlternativeNames: req.additionalDomains?.length
          ? req.additionalDomains
          : undefined,
        ValidationMethod: 'DNS',
        IdempotencyToken: idempotencyToken,
        Tags: [{ Key: 'npt-domain', Value: req.domain }],
      }),
    );
    const arn = req1.CertificateArn;
    if (!arn) throw new Error('ACM: RequestCertificate 回傳 arn 為空');
    this.logger.log(`[acm] requested arn=${arn}`);

    const described = await this.pollForValidation(client, arn);

    // ACM 要 CNAME；本 DnsOperator 介面只 writeTxt — log WARN 讓 ops 手動加
    for (const v of described.DomainValidationOptions ?? []) {
      if (v.ResourceRecord?.Type === 'CNAME') {
        this.logger.warn(
          `[acm][manual-cname] PLEASE add CNAME: ${v.ResourceRecord.Name} → ${v.ResourceRecord.Value}`,
        );
      }
    }

    return {
      provider: this.name,
      challengeType: 'dns-01',
      issuer: 'Amazon',
      notBefore: new Date(),
      // ACM 預設 13 個月；實際 notAfter 要 DescribeCertificate 後才知
      notAfter: new Date(Date.now() + 395 * 86400_000),
      secretRef: '', // ACM 不 export key；SecretStore 無可寫
      externalId: arn,
    };
  }

  async renew(req: IssueCertRequest): Promise<RenewResult> {
    // ACM managed renewal — 若 validation CNAME 還在，cert 自動續；
    // 失效（CNAME 被刪）就 re-request
    const next = await this.issue(req);
    return { ...next, renewedFrom: '' };
  }

  async revoke(externalId: string): Promise<void> {
    this.assertReady();
    const client = this.makeClient();
    await client.send(
      new DeleteCertificateCommand({ CertificateArn: externalId }),
    );
    this.logger.log(`[acm] deleted arn=${externalId}`);
  }

  async checkStatus(externalId: string): Promise<CertStatusResult> {
    this.assertReady();
    try {
      const client = this.makeClient();
      const res = await client.send(
        new DescribeCertificateCommand({ CertificateArn: externalId }),
      );
      const cert = res.Certificate;
      if (!cert) return { externalId, status: 'unknown' };

      const notAfter = cert.NotAfter;
      const status = cert.Status;
      if (status === 'REVOKED')
        return { externalId, status: 'revoked', notAfter };
      if (status === 'EXPIRED')
        return { externalId, status: 'expired', notAfter };
      if (status === 'ISSUED') {
        if (notAfter && notAfter.getTime() - Date.now() < 30 * 86400_000) {
          return { externalId, status: 'expiring_soon', notAfter };
        }
        return { externalId, status: 'valid', notAfter };
      }
      return { externalId, status: 'unknown', notAfter };
    } catch (err) {
      this.logger.warn(
        `[acm] checkStatus ${externalId} failed: ${(err as Error).message}`,
      );
      return { externalId, status: 'unknown' };
    }
  }

  // --- internals ---

  private assertReady(): void {
    if (!this.isConfigured()) {
      throw new Error(
        'AwsAcmCertProvider not configured (需要 AWS_ACM_REGION)',
      );
    }
  }

  private makeClient(): ACMClient {
    return new ACMClient({
      region: this.region,
      credentials:
        this.accessKey && this.secretKey
          ? {
              accessKeyId: this.accessKey,
              secretAccessKey: this.secretKey,
            }
          : undefined, // 讓 SDK 從 instance profile / shared credentials 解析
    });
  }

  private async pollForValidation(
    client: ACMClient,
    arn: string,
  ): Promise<{
    DomainValidationOptions?: Array<{
      DomainName?: string;
      ValidationStatus?: string;
      ResourceRecord?: { Name?: string; Type?: string; Value?: string };
    }>;
  }> {
    const start = Date.now();
    let lastErr: Error | undefined;
    while (Date.now() - start < AwsAcmCertProvider.POLL_TIMEOUT_MS) {
      try {
        const res = await client.send(
          new DescribeCertificateCommand({ CertificateArn: arn }),
        );
        const options = res.Certificate?.DomainValidationOptions;
        const ready = options?.every((o) => o.ResourceRecord?.Name);
        if (ready) {
          return { DomainValidationOptions: options };
        }
      } catch (err) {
        lastErr = err as Error;
      }
      await new Promise((r) =>
        setTimeout(r, AwsAcmCertProvider.POLL_INTERVAL_MS),
      );
    }
    throw new Error(
      `ACM: validation options polling timeout for ${arn}${lastErr ? `: ${lastErr.message}` : ''}`,
    );
  }

  /** IdempotencyToken：同 domain 重跑 issue 不會開新 cert */
  private makeIdempotencyToken(domain: string): string {
    const raw = `npt-${this.hashShort(domain)}`;
    return raw.replace(/[^A-Za-z0-9-_]/g, '').slice(0, 32);
  }

  private hashShort(s: string): string {
    let h = 0;
    for (const c of s) {
      h = (h * 31 + c.charCodeAt(0)) | 0;
    }
    return Math.abs(h).toString(36).slice(0, 8);
  }
}
