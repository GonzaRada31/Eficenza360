import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getTenantId } from '../context/tenant.context';

@Injectable()
export class S3StorageAdapter {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'eficenza-documents';
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
      },
      // Override endpoint for S3 compatible local or MinIO
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
    });
  }

  async generatePresignedPutUrl(fileName: string, contentType: string): Promise<string> {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("Tenant context missing for S3 put url");

    // Strictly partitioning data via bucket prefixes by Tenant
    const objectKey = `${tenantId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // Client has exactly 15 minutes to upload securely directly to S3
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  async generatePresignedGetUrl(objectKey: string): Promise<string> {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("Tenant context missing for S3 get url");

    // Secure Data Isolation Verification
    // A tenant should strictly only read files starting with their tenant directory
    if (!objectKey.startsWith(`${tenantId}/`)) {
        throw new Error("Security Violation: Unauthorized object access attempt across tenants boundaries");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    });

    // Read access token valid for 30 minutes
    return getSignedUrl(this.client, command, { expiresIn: 1800 });
  }
}
