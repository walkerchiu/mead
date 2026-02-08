import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CertProvider, CertProviderName } from './cert-provider.interface';
import { LetsEncryptCertProvider } from './providers/letsencrypt.provider';
import { CloudflareCertProvider } from './providers/cloudflare.provider';
import { AwsAcmCertProvider } from './providers/aws-acm.provider';

/**
 * CertProviderFactory
 *
 * 依 `TLS_PROVIDER` env 選出當前使用的 CertProvider。
 * 預設：letsencrypt
 */
@Injectable()
export class CertProviderFactory {
  private readonly logger = new Logger(CertProviderFactory.name);
  private readonly defaultName: CertProviderName;

  // 註：顯式 @Inject 讓 tsx/esbuild 正確 emit `design:paramtypes`
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LetsEncryptCertProvider)
    private readonly letsEncrypt: LetsEncryptCertProvider,
    @Inject(CloudflareCertProvider)
    private readonly cloudflare: CloudflareCertProvider,
    @Inject(AwsAcmCertProvider) private readonly awsAcm: AwsAcmCertProvider,
  ) {
    const raw = this.config.get<string>('TLS_PROVIDER', 'letsencrypt');
    this.defaultName = this.parseName(raw);
    this.logger.log(
      `[CertProviderFactory] default provider = ${this.defaultName}`,
    );
  }

  /** 預設 provider（全域 env） */
  default(): CertProvider {
    return this.byName(this.defaultName);
  }

  /** 依名稱直接取 — ops 切換 provider 用 */
  byName(name: string): CertProvider {
    switch (name) {
      case 'letsencrypt':
        return this.letsEncrypt;
      case 'cloudflare':
        return this.cloudflare;
      case 'aws-acm':
        return this.awsAcm;
      default:
        throw new Error(
          `Unknown cert provider: ${name} (expected letsencrypt | cloudflare | aws-acm)`,
        );
    }
  }

  /** 當前預設 provider 是否配置完整 */
  defaultReady(): boolean {
    return this.default().isConfigured();
  }

  private parseName(raw: string): CertProviderName {
    if (raw === 'cloudflare' || raw === 'aws-acm' || raw === 'letsencrypt') {
      return raw;
    }
    this.logger.warn(
      `[CertProviderFactory] Unknown TLS_PROVIDER=${raw}, falling back to letsencrypt`,
    );
    return 'letsencrypt';
  }
}
