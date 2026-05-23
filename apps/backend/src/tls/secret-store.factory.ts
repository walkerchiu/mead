import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretStore } from './secret-store.interface';
import { FileSecretStore } from './file-secret-store';
import { AwsSecretsManagerSecretStore } from './aws-secrets-manager-secret-store';
import { VaultSecretStore } from './vault-secret-store';

export type SecretStoreName = 'file' | 'aws-secrets-manager' | 'vault';

/**
 * SecretStoreFactory
 *
 * 依 `TLS_SECRET_STORE` env 選擇實作：
 *   - file（預設，dev 用）— FileSecretStore，落 `TLS_SECRET_DIR`
 *   - aws-secrets-manager — AwsSecretsManagerSecretStore
 *   - vault — VaultSecretStore（Token 或 AppRole）
 *
 * Production NODE_ENV 下選 file 會 throw（避免把 secret 落到本機 disk）。
 */
@Injectable()
export class SecretStoreFactory {
  private readonly logger = new Logger(SecretStoreFactory.name);

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  create(): SecretStore {
    const raw = this.config.get<string>('TLS_SECRET_STORE', 'file');
    const name = this.parseName(raw);
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');

    if (name === 'file' && nodeEnv === 'production') {
      throw new Error(
        '[SecretStoreFactory] TLS_SECRET_STORE=file is not allowed in production. ' +
          'Use aws-secrets-manager or vault.',
      );
    }

    switch (name) {
      case 'aws-secrets-manager':
        return this.buildAwsSecretsManager();
      case 'vault':
        return this.buildVault();
      case 'file':
      default:
        return this.buildFile();
    }
  }

  private buildFile(): SecretStore {
    const dir = this.config.get<string>('TLS_SECRET_DIR', '.dev-secrets');
    this.logger.log(`[SecretStoreFactory] using FileSecretStore at ${dir}`);
    return new FileSecretStore(dir);
  }

  private buildAwsSecretsManager(): SecretStore {
    const region = this.config.get<string>(
      'AWS_SECRETS_MANAGER_REGION',
      'us-east-1',
    );
    const prefix = this.config.get<string>(
      'AWS_SECRETS_MANAGER_PREFIX',
      'mead',
    );
    this.logger.log(
      `[SecretStoreFactory] using AwsSecretsManagerSecretStore region=${region} prefix=${prefix}`,
    );
    return new AwsSecretsManagerSecretStore(region, prefix);
  }

  private buildVault(): SecretStore {
    const addr = this.config.get<string>('VAULT_ADDR');
    if (!addr) {
      throw new Error('[SecretStoreFactory] VAULT_ADDR is required for vault');
    }
    const token = this.config.get<string>('VAULT_TOKEN');
    const roleId = this.config.get<string>('VAULT_ROLE_ID');
    const secretId = this.config.get<string>('VAULT_SECRET_ID');
    const mount = this.config.get<string>('VAULT_MOUNT', 'secret');
    const pathPrefix = this.config.get<string>('VAULT_PATH_PREFIX', 'mead');

    if (!token && !(roleId && secretId)) {
      throw new Error(
        '[SecretStoreFactory] vault auth requires VAULT_TOKEN or (VAULT_ROLE_ID + VAULT_SECRET_ID)',
      );
    }

    this.logger.log(
      `[SecretStoreFactory] using VaultSecretStore addr=${addr} mount=${mount} prefix=${pathPrefix}`,
    );
    return new VaultSecretStore({
      addr,
      token,
      roleId,
      secretId,
      mount,
      pathPrefix,
    });
  }

  private parseName(raw: string): SecretStoreName {
    if (raw === 'file' || raw === 'aws-secrets-manager' || raw === 'vault') {
      return raw;
    }
    this.logger.warn(
      `[SecretStoreFactory] Unknown TLS_SECRET_STORE=${raw}, fallback to file`,
    );
    return 'file';
  }
}
