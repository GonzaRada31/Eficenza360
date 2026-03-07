import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import {
  IStorageProvider,
  StorageUploadResult,
} from './storage.provider.interface';

@Injectable()
export class AzureBlobProvider implements IStorageProvider {
  private readonly logger = new Logger(AzureBlobProvider.name);
  private readonly containerName = 'eficenza-storage';

  constructor(private configService: ConfigService) {}

  private getBlobServiceClient(): BlobServiceClient {
    const accountUrl = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_URL',
    );
    if (!accountUrl)
      throw new Error('AZURE_STORAGE_ACCOUNT_URL not configured');

    const credential = new DefaultAzureCredential();
    return new BlobServiceClient(accountUrl, credential);
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    prefix: string, // e.g., 'tenant-id/sub-id'
  ): Promise<StorageUploadResult> {
    const blobServiceClient = this.getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName,
    );

    await containerClient.createIfNotExists();

    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const blobName = `${prefix}/${timestamp}-${sanitizedFilename}`;
    const blobClient = containerClient.getBlockBlobClient(blobName);

    try {
      this.logger.log(`Uploading blob: ${blobName}`);
      await blobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: mimeType },
      });
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Failed to upload blob '${blobName}': ${err.message}`,
        err.stack,
      );
      throw new Error(`Upload Error: ${err.message}`);
    }

    const sasUrl = await this.generatePresignedUrl(blobName, prefix);

    return {
      fileName: originalFilename,
      blobName: blobName,
      mimeType: mimeType,
      size: fileBuffer.length,
      uploadedAt: new Date().toISOString(),
      sasUrl: sasUrl,
    };
  }

  async deleteFile(blobName: string, prefix: string): Promise<void> {
    if (!blobName.startsWith(`${prefix}/`)) {
      throw new Error('Access denied: Blob namespace isolation violation');
    }

    const blobServiceClient = this.getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlockBlobClient(blobName);

    try {
      this.logger.log(`Deleting blob: ${blobName}`);
      await blobClient.deleteIfExists();
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Failed to delete blob '${blobName}': ${err.message}`,
        err.stack,
      );
      throw new Error(`Delete Error: ${err.message}`);
    }
  }

  async generatePresignedUrl(
    blobName: string,
    prefix: string,
  ): Promise<string> {
    if (!blobName.startsWith(`${prefix}/`)) {
      throw new Error('Access Denied: Isolation rule violation');
    }

    const client = this.getBlobServiceClient();
    const containerClient = client.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const now = new Date();
    now.setMinutes(now.getMinutes() - 5);
    const expiresOn = new Date(now);
    expiresOn.setHours(expiresOn.getHours() + 24);

    const delegationKey = await client.getUserDelegationKey(now, expiresOn);

    let accountName = client.accountName;
    if (!accountName) {
      try {
        const hostname = new URL(client.url).hostname;
        if (hostname === '127.0.0.1' || hostname === 'localhost') {
          accountName = 'devstoreaccount1';
        } else {
          accountName = hostname.split('.')[0];
        }
      } catch {
        accountName = 'devstoreaccount1';
      }
    }

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: now,
        expiresOn: expiresOn,
        protocol: SASProtocol.HttpsAndHttp,
      },
      delegationKey,
      accountName,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }
}
