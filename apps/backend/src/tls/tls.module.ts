import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TlsIssuanceService } from './tls-issuance.service';
import { CertProviderFactory } from './cert-provider.factory';
import { LetsEncryptCertProvider } from './providers/letsencrypt.provider';
import { CloudflareCertProvider } from './providers/cloudflare.provider';
import { AwsAcmCertProvider } from './providers/aws-acm.provider';
import { SecretStoreFactory } from './secret-store.factory';
import { SECRET_STORE, SecretStore } from './secret-store.interface';
import { DnsOperatorFactory } from './dns/dns-operator.factory';

/**
 * TlsModule（單租戶版）
 *
 * Pluggable TLS automation：
 *   - CertProvider：letsencrypt（預設）/ cloudflare / aws-acm
 *   - SecretStore：file（dev）/ aws-secrets-manager / vault
 *   - DnsOperator：manual / cloudflare / route53 / google-cloud-dns
 *
 * 關鍵 env：
 * - `TLS_PROVIDER`、`TLS_SECRET_STORE`、`DEFAULT_DNS_PROVIDER`
 * - `ACME_DIRECTORY_URL`、`ACME_CONTACT_EMAIL`
 * - `CF_API_TOKEN`、`CF_CERT_MODE`、`CF_ZONE_ID`
 * - `AWS_ACM_REGION`、`AWS_SECRETS_MANAGER_REGION`、`AWS_SECRETS_MANAGER_PREFIX`
 * - `VAULT_ADDR`、`VAULT_TOKEN`、`VAULT_ROLE_ID`、`VAULT_SECRET_ID`
 *
 * 使用：注入 `TlsIssuanceService` 呼叫 issue / renew / revoke / checkStatus。
 */

const secretStoreProvider: Provider = {
  provide: SECRET_STORE,
  useFactory: (factory: SecretStoreFactory): SecretStore => factory.create(),
  inject: [SecretStoreFactory],
};

@Module({
  imports: [ConfigModule],
  providers: [
    SecretStoreFactory,
    secretStoreProvider,

    LetsEncryptCertProvider,
    CloudflareCertProvider,
    AwsAcmCertProvider,
    CertProviderFactory,

    DnsOperatorFactory,

    TlsIssuanceService,
  ],
  exports: [
    TlsIssuanceService,
    CertProviderFactory,
    DnsOperatorFactory,
    SECRET_STORE,
  ],
})
export class TlsModule {}
