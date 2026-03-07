import { Injectable, Logger, Inject } from '@nestjs/common';
import { STORAGE_PROVIDER, type IStorageProvider, type StorageUploadResult } from '../../infra/storage/storage.provider.interface';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {}

  async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    tenantId: string,
    subtaskId: string,
  ): Promise<StorageUploadResult> {
    const prefix = `${tenantId}/${subtaskId}`;
    return this.storage.uploadFile(fileBuffer, originalFilename, mimeType, prefix);
  }

  async deleteFile(blobName: string, tenantId: string): Promise<void> {
    return this.storage.deleteFile(blobName, tenantId);
  }

  async generateSasUrl(blobName: string, tenantId: string): Promise<string> {
    return this.storage.generatePresignedUrl(blobName, tenantId);
  }
}
