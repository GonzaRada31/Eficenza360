export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface StorageUploadResult {
  fileName: string;
  blobName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  sasUrl: string;
}

export interface IStorageProvider {
  /**
   * Uploads a file to the configured storage provider.
   * @param fileBuffer The buffer of the file to upload
   * @param originalFilename The original filename
   * @param mimeType The MIME type of the file
   * @param prefix Usually the tenantId or tenantId/subtaskId to guarantee isolation
   */
  uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    prefix: string,
  ): Promise<StorageUploadResult>;

  /**
   * Generates a time-bound SAS URL or Presigned URL for downloading a file directly via browser.
   */
  generatePresignedUrl(blobName: string, prefix: string): Promise<string>;

  /**
   * Deletes a file.
   */
  deleteFile(blobName: string, prefix: string): Promise<void>;
}
