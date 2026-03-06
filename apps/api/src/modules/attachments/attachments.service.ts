import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export interface AttachmentUploadResult {
  fileName: string;
  blobName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  sasUrl: string;
}

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  private readonly containerName = 'project-attachments';

  constructor(private configService: ConfigService) {}

  private getBlobServiceClient(): BlobServiceClient {
    const accountUrl = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_URL',
    );
    if (!accountUrl) {
      throw new Error('AZURE_STORAGE_ACCOUNT_URL not configured');
    }

    const credential = new DefaultAzureCredential();
    return new BlobServiceClient(accountUrl, credential);
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    tenantId: string,
    subtaskId: string,
  ): Promise<AttachmentUploadResult> {
    const blobServiceClient = this.getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName,
    );

    // Ensure container exists
    await containerClient.createIfNotExists();

    // Sanitize filename
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();

    // Path structure: {tenantId}/{subtaskId}/{timestamp}-{filename}
    // Note: tenantId at the root ensures strict isolation level via prefix
    const blobName = `${tenantId}/${subtaskId}/${timestamp}-${sanitizedFilename}`;
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

    const sasUrl = await this.generateSasUrl(
      blobName,
      tenantId,
      blobServiceClient,
    );

    return {
      fileName: originalFilename,
      blobName: blobName,
      mimeType: mimeType,
      size: fileBuffer.length,
      uploadedAt: new Date().toISOString(),
      sasUrl: sasUrl,
    };
  }

  async deleteFile(blobName: string, tenantId: string): Promise<void> {
    // strict isolation check
    if (!blobName.startsWith(`${tenantId}/`)) {
      throw new Error(
        'Acceso denegado: el campo esperado no pertenece al cliente',
      );
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

  async generateSasUrl(
    blobName: string,
    tenantId: string,
    blobServiceClient?: BlobServiceClient,
  ): Promise<string> {
    // ENFORCE TENANT ISOLATION
    if (!blobName.startsWith(`${tenantId}/`)) {
      this.logger.error(
        `Security Alert: Attempt to access blob '${blobName}' from tenant '${tenantId}' denied.`,
      );
      throw new Error('Access Denied: Blob does not belong to the tenant.');
    }

    const client = blobServiceClient || this.getBlobServiceClient();
    const containerClient = client.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Generate SAS Token
    const now = new Date();
    now.setMinutes(now.getMinutes() - 5); // Adjust for clock skew
    const expiresOn = new Date(now);
    expiresOn.setHours(expiresOn.getHours() + 24); // Valid for 24h

    const delegationKey = await client.getUserDelegationKey(now, expiresOn);

    let accountName = client.accountName;
    if (!accountName) {
      // Fallback or extraction logic similar to invoice service
      const accountUrl = client.url; // e.g. https://account.blob.core.windows.net
      try {
        const hostname = new URL(accountUrl).hostname;
        if (hostname === '127.0.0.1' || hostname === 'localhost') {
          accountName = 'devstoreaccount1';
        } else {
          accountName = hostname.split('.')[0];
        }
      } catch {
        accountName = 'devstoreaccount1'; // Safe fallback
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
