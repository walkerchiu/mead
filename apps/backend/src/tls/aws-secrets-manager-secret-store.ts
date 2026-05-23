import { Logger } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  PutSecretValueCommand,
  DeleteSecretCommand,
  ResourceNotFoundException,
  ResourceExistsException,
  DescribeSecretCommand,
} from '@aws-sdk/client-secrets-manager';
import { SecretStore, TlsSecret } from './secret-store.interface';

/**
 * AwsSecretsManagerSecretStore — production SecretStore
 *
 * 每個 ref 對應一條 AWS Secrets Manager secret：
 *   SecretId = `{prefix}/{ref}`  例：`mead/prod/tls/example.com`
 *
 * 啟用條件：
 *   TLS_SECRET_STORE=aws-secrets-manager
 *   AWS_SECRETS_MANAGER_REGION=us-east-1
 *   AWS_SECRETS_MANAGER_PREFIX=mead/prod
 *   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY（或 instance profile / shared credentials）
 *
 * 需要 IAM permissions（最小集）：
 *   - secretsmanager:GetSecretValue
 *   - secretsmanager:CreateSecret
 *   - secretsmanager:PutSecretValue
 *   - secretsmanager:DescribeSecret
 *   - secretsmanager:DeleteSecret（僅 deleteSecret 用）
 *   Resource: `arn:aws:secretsmanager:{region}:{account}:secret:mead/*`
 */
export class AwsSecretsManagerSecretStore implements SecretStore {
  private readonly logger = new Logger(AwsSecretsManagerSecretStore.name);
  private readonly client: SecretsManagerClient;
  private readonly prefix: string;

  constructor(region: string, prefix: string) {
    this.prefix = prefix.replace(/\/$/, '');
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

    this.client = new SecretsManagerClient({
      region,
      credentials:
        accessKey && secretKey
          ? { accessKeyId: accessKey, secretAccessKey: secretKey }
          : undefined,
    });
  }

  async write(ref: string, secret: TlsSecret): Promise<void> {
    await this.writeRaw(ref, JSON.stringify(secret));
  }

  async read(ref: string): Promise<TlsSecret | null> {
    const raw = await this.readRaw(ref);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as TlsSecret;
    } catch (err) {
      this.logger.warn(
        `[AwsSecretsManager] parse failed for ${ref}: ${(err as Error).message}`,
      );
      return null;
    }
  }

  async markRevoked(ref: string): Promise<void> {
    const existing = await this.read(ref);
    if (!existing) return;
    existing.revokedAt = new Date().toISOString();
    await this.write(ref, existing);
  }

  async writeRaw(ref: string, value: string): Promise<void> {
    const secretId = this.secretId(ref);
    try {
      await this.client.send(
        new PutSecretValueCommand({
          SecretId: secretId,
          SecretString: value,
        }),
      );
    } catch (err) {
      if (err instanceof ResourceNotFoundException) {
        try {
          await this.client.send(
            new CreateSecretCommand({
              Name: secretId,
              SecretString: value,
              Description: 'mead TLS/DNS secret (auto-managed)',
              Tags: [
                { Key: 'mead', Value: 'true' },
                { Key: 'kind', Value: this.kindFromRef(ref) },
              ],
            }),
          );
        } catch (createErr) {
          if (createErr instanceof ResourceExistsException) {
            await this.client.send(
              new PutSecretValueCommand({
                SecretId: secretId,
                SecretString: value,
              }),
            );
          } else {
            throw createErr;
          }
        }
      } else {
        throw err;
      }
    }
  }

  async readRaw(ref: string): Promise<string | null> {
    const secretId = this.secretId(ref);
    try {
      const res = await this.client.send(
        new GetSecretValueCommand({ SecretId: secretId }),
      );
      return res.SecretString ?? null;
    } catch (err) {
      if (err instanceof ResourceNotFoundException) return null;
      throw err;
    }
  }

  /**
   * 真的刪 secret（hard delete；預設 7 天 recovery window）
   */
  async deleteSecret(
    ref: string,
    opts: { forceDeleteWithoutRecovery?: boolean } = {},
  ): Promise<void> {
    const secretId = this.secretId(ref);
    await this.client.send(
      new DeleteSecretCommand({
        SecretId: secretId,
        ForceDeleteWithoutRecovery: opts.forceDeleteWithoutRecovery,
        RecoveryWindowInDays: opts.forceDeleteWithoutRecovery ? undefined : 7,
      }),
    );
  }

  async healthCheck(): Promise<{
    ok: boolean;
    prefix: string;
    reason?: string;
  }> {
    try {
      await this.client.send(
        new DescribeSecretCommand({
          SecretId: `${this.prefix}/__healthcheck__`,
        }),
      );
      return { ok: true, prefix: this.prefix };
    } catch (err) {
      if (err instanceof ResourceNotFoundException) {
        return { ok: true, prefix: this.prefix };
      }
      return {
        ok: false,
        prefix: this.prefix,
        reason: (err as Error).message,
      };
    }
  }

  // --- internals ---

  private secretId(ref: string): string {
    return `${this.prefix}/${ref}`;
  }

  private kindFromRef(ref: string): string {
    if (ref.includes('/tls/') || ref.startsWith('tls/')) return 'tls-cert';
    if (ref.includes('/dns/')) return 'dns-credential';
    if (ref.includes('/acme/')) return 'acme-account';
    return 'other';
  }
}
