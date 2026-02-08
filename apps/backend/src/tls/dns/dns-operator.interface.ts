/**
 * DnsOperator — 寫入 / 移除 DNS TXT record 的抽象
 *
 * 為 ACME DNS-01 challenge 服務：provider（如 Let's Encrypt）會給 keyAuthorization，
 * 我們需把 `_acme-challenge.{domain}` 的 TXT record 寫到該 domain 的 DNS 權威伺服器上。
 *
 * 單租戶版：DNS provider 與 credential 由 env 直接決定（不像 tenant 版本由 HQ admin 設定）。
 */

export type DnsProviderName =
  | 'manual'
  | 'cloudflare'
  | 'route53'
  | 'google-cloud-dns';

export interface DnsOperator {
  readonly provider: DnsProviderName;

  /**
   * 寫入 TXT record。
   * @param name FQDN，例如 `_acme-challenge.app.example.com`
   * @param value TXT 內容（ACME 給的 base64url 字串）
   */
  writeTxt(name: string, value: string): Promise<void>;

  /** 驗證後清除 TXT record（best-effort；失敗不拋） */
  removeTxt(name: string, value: string): Promise<void>;

  /**
   * 連線測試：打該 DNS provider 的 read API 驗證 credential 有效、有權限。
   * 啟動時 / ops 手動觸發 — 避免簽憑證才爆。
   */
  testConnection(): Promise<DnsConnectionTest>;
}

export interface DnsConnectionTest {
  ok: boolean;
  /** 成功時列出可操作的 zone */
  zones?: string[];
  /** 失敗 reason */
  reason?: string;
}

/**
 * DNS provider 設定 — 由 env 提供（單租戶版）。
 */
export interface DnsConfig {
  provider: DnsProviderName;
  /** Cloudflare zone id（可選；factory 會用 API 自動找） */
  cloudflareZoneId?: string;
  /** Route53 hosted zone id */
  route53HostedZoneId?: string;
  /** Google Cloud DNS managed zone name（可選；factory 會用 list zones 自動找） */
  googleCloudManagedZone?: string;
}

/**
 * Credential 結構（從 env / SecretStore 讀取）。
 */
export interface DnsCredentialSecret {
  cloudflareApiToken?: string;
  route53AccessKeyId?: string;
  route53SecretAccessKey?: string;
  googleCloudServiceAccountJson?: string;
}
