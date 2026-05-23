import { ConfigService } from '@nestjs/config';
import { SecretStoreFactory } from './secret-store.factory';
import { FileSecretStore } from './file-secret-store';
import { AwsSecretsManagerSecretStore } from './aws-secrets-manager-secret-store';
import { VaultSecretStore } from './vault-secret-store';

function makeConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: <T>(key: string, defaultValue?: T) =>
      (values[key] ?? defaultValue) as T,
  } as ConfigService;
}

describe('SecretStoreFactory', () => {
  it('預設回 FileSecretStore（NODE_ENV=development）', () => {
    const factory = new SecretStoreFactory(
      makeConfig({ NODE_ENV: 'development' }),
    );
    expect(factory.create()).toBeInstanceOf(FileSecretStore);
  });

  it('production 下選 file 會 throw', () => {
    const factory = new SecretStoreFactory(
      makeConfig({ TLS_SECRET_STORE: 'file', NODE_ENV: 'production' }),
    );
    expect(() => factory.create()).toThrow(/not allowed in production/);
  });

  it('TLS_SECRET_STORE=aws-secrets-manager 回 AwsSecretsManager 實例', () => {
    const factory = new SecretStoreFactory(
      makeConfig({
        TLS_SECRET_STORE: 'aws-secrets-manager',
        AWS_SECRETS_MANAGER_REGION: 'ap-northeast-1',
        AWS_SECRETS_MANAGER_PREFIX: 'mead/test',
      }),
    );
    expect(factory.create()).toBeInstanceOf(AwsSecretsManagerSecretStore);
  });

  it('TLS_SECRET_STORE=vault 缺 VAULT_ADDR 會 throw', () => {
    const factory = new SecretStoreFactory(
      makeConfig({ TLS_SECRET_STORE: 'vault' }),
    );
    expect(() => factory.create()).toThrow(/VAULT_ADDR is required/);
  });

  it('TLS_SECRET_STORE=vault 缺 token + AppRole 會 throw', () => {
    const factory = new SecretStoreFactory(
      makeConfig({
        TLS_SECRET_STORE: 'vault',
        VAULT_ADDR: 'https://vault.local',
      }),
    );
    expect(() => factory.create()).toThrow(/VAULT_TOKEN or/);
  });

  it('TLS_SECRET_STORE=vault token auth 回 Vault 實例', () => {
    const factory = new SecretStoreFactory(
      makeConfig({
        TLS_SECRET_STORE: 'vault',
        VAULT_ADDR: 'https://vault.local',
        VAULT_TOKEN: 'root',
      }),
    );
    expect(factory.create()).toBeInstanceOf(VaultSecretStore);
  });

  it('未知 TLS_SECRET_STORE 值 fallback 到 file', () => {
    const factory = new SecretStoreFactory(
      makeConfig({ TLS_SECRET_STORE: 'bogus' }),
    );
    expect(factory.create()).toBeInstanceOf(FileSecretStore);
  });
});
