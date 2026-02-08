# TLS 自動化

多 provider TLS 自動簽發架構：LetsEncrypt（預設）、Cloudflare、AWS ACM。

## 架構總覽

```
   呼叫方（cron / CLI / controller）
       │
       ▼
   TlsIssuanceService.issue({
     domain, additionalDomains?, contactEmail?,
     providerOverride?,   // 單次強制用某 provider
     secretRefPrefix?,    // SecretStore key 前綴，未填 = 'tls'
   })
       │
       ├─▶ CertProviderFactory.default()  (TLS_PROVIDER 決定)
       │       └─▶ LetsEncryptProvider | CloudflareProvider | AwsAcmProvider
       │
       ├─▶ DnsOperatorFactory.resolve()   (DEFAULT_DNS_PROVIDER 決定)
       │       └─▶ Manual | Cloudflare | Route53 | GoogleCloudDns
       │
       └─▶ SecretStoreFactory.create()    (TLS_SECRET_STORE 決定)
               └─▶ File | AwsSecretsManager | Vault
       │
       ▼
   IssuedCertMetadata { secretRef, externalId, notAfter, ... }
       │
       └─▶ SecretStore[secretRef] = { privateKey, certificateChain }
```

私鑰與 chain 永遠不進 DB。呼叫方拿 `secretRef`，部署 nginx / 反向代理時自行從 SecretStore 讀。

## Provider 選擇

由 env `TLS_PROVIDER` 決定全域預設：

| 值                    | 說明                                                           |
| --------------------- | -------------------------------------------------------------- |
| `letsencrypt`（預設） | ACME、免費、DNS-01 challenge                                   |
| `cloudflare`          | Cloudflare Origin CA 或 Universal SSL                          |
| `aws-acm`             | AWS Certificate Manager（僅配 ALB / CloudFront / API Gateway） |

呼叫 `TlsIssuanceService.issue({ providerOverride })` 可單次強制切。

## 設定

### Let's Encrypt（預設）

| 環境變數               | 說明                                  | 預設          |
| ---------------------- | ------------------------------------- | ------------- |
| `TLS_PROVIDER`         | `letsencrypt`                         | `letsencrypt` |
| `ACME_DIRECTORY_URL`   | ACME directory；staging 或 production | LE staging    |
| `ACME_CONTACT_EMAIL`   | 帳號 email（到期通知）                | **必填**      |
| `DEFAULT_DNS_PROVIDER` | DNS-01 challenge 寫 TXT 的 operator   | `manual`      |

**第一次上線**：務必從 staging 開始（`ACME_DIRECTORY_URL=https://acme-staging-v02.api.letsencrypt.org/directory`），完整跑通一個 domain 後才切 production。LE production 嚴格 rate limit（單 domain 每週 5 次 issue）。

### Cloudflare

| 模式（`CF_CERT_MODE`） | 說明                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| `origin-ca`（預設）    | CF 給 15 年 cert 給 origin；需 `CF_API_TOKEN`（Origin CA Key scope）       |
| `universal-ssl`        | CF 邊緣已自動簽好 public cert；只做 poll；需 `CF_API_TOKEN` + `CF_ZONE_ID` |

```
TLS_PROVIDER=cloudflare
CF_CERT_MODE=origin-ca
CF_API_TOKEN=...
CF_CERT_VALIDITY_DAYS=365      # Origin CA：7 / 30 / 90 / 365 / 730 / 1095 / 5475
```

### AWS ACM

ACM 免費，**只能**配合 AWS 邊緣（ALB / CloudFront / API Gateway）使用；自管 nginx / origin 需走 ACM Private CA（收費）。

```
TLS_PROVIDER=aws-acm
AWS_ACM_REGION=us-east-1   # CloudFront 強制 us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

SDK 會自動從 env / instance profile / shared credentials 解析。

ACM 走 DNS validation 但要寫 **CNAME**；目前 `DnsOperator` 抽象只 `writeTxt` — issue 時會 log WARN 提示要手動加 CNAME，ACM 自行 poll 驗證。

## Secret Store

TLS material（private key + cert chain）**不**進 Postgres。`SecretStore` 介面讓實作可替換。
選擇走 `TLS_SECRET_STORE` env：

| 值                    | 實作                                              | 適用                                         |
| --------------------- | ------------------------------------------------- | -------------------------------------------- |
| `file`（預設）        | `FileSecretStore` — 寫 `TLS_SECRET_DIR` 權限 0600 | **僅 dev**；NODE_ENV=production 啟動會 throw |
| `aws-secrets-manager` | `AwsSecretsManagerSecretStore`                    | AWS 部署推薦                                 |
| `vault`               | `VaultSecretStore` — HashiCorp Vault KV v2        | 自管 / non-AWS 推薦                          |

### AwsSecretsManagerSecretStore

```
TLS_SECRET_STORE=aws-secrets-manager
AWS_SECRETS_MANAGER_REGION=us-east-1
AWS_SECRETS_MANAGER_PREFIX=npt/prod
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

最小 IAM policy：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:CreateSecret",
        "secretsmanager:PutSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:DeleteSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:npt/prod/*"
    }
  ]
}
```

### VaultSecretStore

```
TLS_SECRET_STORE=vault
VAULT_ADDR=https://vault.internal:8200
VAULT_MOUNT=secret
VAULT_PATH_PREFIX=npt/prod
# 認證擇一：
VAULT_TOKEN=...                     # token（dev / staging）
# 或 AppRole（production 推薦）：
# VAULT_ROLE_ID=...
# VAULT_SECRET_ID=...
```

最小 Vault policy：

```hcl
path "secret/data/npt/prod/*" {
  capabilities = ["create", "read", "update"]
}
path "secret/delete/npt/prod/*" {
  capabilities = ["update"]
}
path "secret/metadata/npt/prod/*" {
  capabilities = ["read", "delete"]
}
```

Kubernetes 部署：用 Vault Agent 注入 token，env 裡不放 `VAULT_TOKEN`。

## DNS Provider（單租戶）

ACME DNS-01 challenge 需在域名的 DNS 權威伺服器寫 TXT record。`DnsOperator` 抽象支援四種，由 env `DEFAULT_DNS_PROVIDER` 選擇：

| Provider           | env credential                                                                 | 說明                     |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------ |
| `manual`（預設）   | —                                                                              | log-only；ops 自行加 TXT |
| `cloudflare`       | `CF_API_TOKEN`（可選 `CF_ZONE_ID`）                                            | Cloudflare API v4        |
| `route53`          | `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`（可選 `ROUTE53_HOSTED_ZONE_ID`） | AWS Route53              |
| `google-cloud-dns` | `GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON`（可選 `GOOGLE_CLOUD_MANAGED_ZONE`）        | Google Cloud DNS         |

### Cloudflare API token scope

- **Zone Resources**：`Include → Specific zone`（或 All zones）
- **Permissions**：`Zone → DNS → Edit` + `Zone → Zone → Read`

### Route53 IAM policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets",
        "route53:ListResourceRecordSets"
      ],
      "Resource": "arn:aws:route53:::hostedzone/{ZONE_ID}"
    },
    { "Effect": "Allow", "Action": "route53:ListHostedZones", "Resource": "*" }
  ]
}
```

### Google Cloud DNS IAM

Service account 需要 `roles/dns.admin`（或自訂含 `dns.changes.create` + `dns.changes.get` + `dns.managedZones.list` + `dns.resourceRecordSets.list`）。

### Manual fallback

`DEFAULT_DNS_PROVIDER=manual`（預設）下，LE issue 時會 log WARN：

```
[manual-dns] PLEASE add TXT: _acme-challenge.app.example.com "xxxxx"
```

ops 需手動加，LE 會 poll DNS 等結果（acme-client 預設 1 分鐘 timeout）。
若沒加 → issue 失敗。適合測試環境或一次性簽發；production 建議接真實 DNS provider。

## 程式介面

```ts
import { TlsIssuanceService } from './tls/tls-issuance.service';

constructor(private readonly tls: TlsIssuanceService) {}

// 簽發
const meta = await this.tls.issue({
  domain: 'app.example.com',
  additionalDomains: ['*.example.com'],
  // providerOverride: 'cloudflare', // 可選，單次強制
  // secretRefPrefix: 'tls/edge',    // 可選，預設 'tls'
});
// meta.secretRef → 'tls/app.example.com'（secretRefPrefix + '/' + domain）
// meta.notAfter   → Date

// 讀取簽出的 cert + key（部署到 nginx 用）
const secret = await this.tls.readSecret(meta.secretRef);
// { privateKey, certificateChain }

// 續發
await this.tls.renew({ externalId: meta.externalId, domain: 'app.example.com' });

// 撤銷
await this.tls.revoke(meta.externalId);

// 查狀態
const status = await this.tls.checkStatus(meta.externalId);
// { status: 'valid' | 'expiring_soon' | 'expired' | 'revoked' | 'unknown', notAfter }
```

## 安全守則

1. **Private key 永遠不落 DB / log / audit trail** — 只進 SecretStore
2. `secretRef` 是路徑、不是 secret，可以記在 DB
3. 不提供「下載 cert + key」的對外 endpoint；要 rotate 就 revoke + 重新 issue
4. LE production 上線前先跑 staging 完整流程；rate limit 被擋要等 1 週
5. Production 禁用 `FileSecretStore`（`SecretStoreFactory` 啟動會 throw）
6. DNS credential（CF token / AWS / GCP SA JSON）走 env 注入，**不**寫 source

## 驗證 checklist（pre-production）

- [ ] `TLS_PROVIDER` + provider-specific env 全設
- [ ] `ACME_DIRECTORY_URL` 從 staging 切 production
- [ ] `TLS_SECRET_STORE` 非 `file`（Production 啟動會 throw 阻擋）
- [ ] `DEFAULT_DNS_PROVIDER` 接真實 provider，或 ops 流程能保證手動加 TXT 在 timeout 前完成
- [ ] Staging LE 完整跑通一次（issue → readSecret 拿到 cert 部署 → 訪問成功）
- [ ] 切 production directory，再跑一次真實 domain
- [ ] 監控：`checkStatus` 回 `expiring_soon` / `expired` 時 page
- [ ] 排程：cron 每日跑 `checkStatus` for known domains，<30 天到期觸發 `renew`
