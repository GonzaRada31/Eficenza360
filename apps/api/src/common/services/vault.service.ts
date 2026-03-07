import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VaultService implements OnModuleInit {
  private secretClient!: SecretClient;
  private readonly logger = new Logger(VaultService.name);
  private secretCache: Map<string, string> = new Map();

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const keyVaultName = this.configService.get<string>('KEY_VAULT_NAME');
    if (!keyVaultName) {
      this.logger.warn(
        'KEY_VAULT_NAME not defined. VaultService will not function correctly.',
      );
      return;
    }

    const kvURL = `https://${keyVaultName}.vault.azure.net`;
    const credential = new DefaultAzureCredential();
    this.secretClient = new SecretClient(kvURL, credential);
  }

  async getSecret(secretName: string): Promise<string> {
    if (this.secretCache.has(secretName)) {
      return this.secretCache.get(secretName) || '';
    }

    try {
      if (!this.secretClient) {
        throw new Error(
          'SecretClient is not initialized. Check KEY_VAULT_NAME.',
        );
      }
      const secret = await this.secretClient.getSecret(secretName);
      if (secret.value) {
        this.secretCache.set(secretName, secret.value);
        return secret.value;
      }
      throw new Error(`Secret ${secretName} returned undefined value.`);
    } catch (error) {
      this.logger.error(`Failed to retrieve secret ${secretName}`, error);
      throw error;
    }
  }
}
