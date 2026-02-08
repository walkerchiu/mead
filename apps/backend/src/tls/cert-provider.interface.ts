import type { DnsOperator } from './dns/dns-operator.interface';
// re-export 讓 import 路徑統一
export type { DnsOperator };

/**
 * CertProvider — TLS 憑證供應商抽象
 *
 * 不同 provider 負責「把 domain 的 cert 發出來」的細節；
 * 上層 TlsIssuanceService 只關心 issue / renew / revoke / status 四件事。
 *
 * 單租戶版：不帶 tenantId / tenantSlug，secretRef 路徑由 caller 決定。
 *
 * 實作：
 * - LetsEncrypt（ACME）— 預設，走 DNS-01 challenge
 * - Cloudflare Origin CA / Universal SSL — 呼叫 Cloudflare API
 * - AWS ACM — requestCertificate + RequestValidation
 *
 * Private key **不**在這個抽象裡流動。Provider 自己負責把 key 寫進 SecretStore，
 * 回傳 `secretRef` 給上層存。
 */

export type CertProviderName = 'letsencrypt' | 'cloudflare' | 'aws-acm';

export type ChallengeType = 'dns-01' | 'http-01' | 'none';

/**
 * Provider 對外的 issue request（單租戶版）
 */
export interface IssueCertRequest {
  domain: string;
  /** 若 provider 需要多 SAN（例如 `*.{domain}`）由實作決定 */
  additionalDomains?: string[];
  /** 用於聯絡（LE account + 過期通知） */
  contactEmail: string;
  /**
   * 若 provider 採 DNS-01：呼叫方提供 helper 讓 provider 寫 / 刪 TXT record
   * 若 provider 自管 DNS（Cloudflare）— 可忽略
   */
  dnsOperator?: DnsOperator;
  /** SecretStore 路徑前綴（例如 `tls/example.com`） */
  secretRefPrefix: string;
}

export interface IssuedCertMetadata {
  provider: CertProviderName;
  challengeType: ChallengeType;
  issuer: string;
  serialNumber?: string;
  notBefore: Date;
  notAfter: Date;
  fingerprintSha256?: string;
  /** SecretStore 路徑 — 真正的 key / chain 存這；business code 不碰 */
  secretRef: string;
  /**
   * provider 給的原始識別（LE order url、Cloudflare cert id、ACM arn）
   * 之後 renew / revoke 會用到
   */
  externalId: string;
}

export interface RenewResult extends IssuedCertMetadata {
  renewedFrom: string; // 之前的 externalId
}

export interface CertStatusResult {
  externalId: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'revoked' | 'unknown';
  notAfter?: Date;
}

/**
 * 所有 provider 必須實作的介面
 */
export interface CertProvider {
  readonly name: CertProviderName;

  /** 檢查 env / 認證是否備齊；啟動時呼叫避免跑 job 才爆 */
  isConfigured(): boolean;

  /** Issue 新憑證（首次） */
  issue(req: IssueCertRequest): Promise<IssuedCertMetadata>;

  /** Renew（通常是 issue 新一張、沿用 external domain） */
  renew(req: IssueCertRequest): Promise<RenewResult>;

  /** Revoke（可選 — 某些 provider 不支援） */
  revoke(externalId: string, reason?: string): Promise<void>;

  /** 查詢狀態 */
  checkStatus(externalId: string): Promise<CertStatusResult>;
}

/** DI token — runtime 由 CertProviderFactory 解析到具體 provider */
export const CERT_PROVIDER = Symbol('CertProvider');
