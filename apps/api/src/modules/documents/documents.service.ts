import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { IStorageProvider, STORAGE_PROVIDER } from '../../../infra/storage/storage.provider.interface';
import { getTenantId, getCurrentUserId } from '../../../infra/context/tenant.context';
import { PresignDocumentDto, CreateDocumentDto } from '../dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {}

  async generatePresignedUrl(dto: PresignDocumentDto) {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("Tenant Context Missing");
    
    // Using Azure abstraction generate format ensuring tenantId isolation directly in the service
    const blobName = `${tenantId}/${Date.now()}-${dto.fileName}`;
    const url = await this.storage.generatePresignedUrl(blobName, tenantId);
    return { uploadUrl: url, blobName };
  }

  async create(dto: CreateDocumentDto) {
    const tenantId = getTenantId();
    const userId = getCurrentUserId();

    if (!tenantId) throw new Error("Tenant Context Missing");

    return this.prisma.$transaction(async (tx) => {
      // Create Base Document
      const document = await tx.document.create({
        data: {
          tenantId,
          name: dto.name,
          category: dto.category || 'UNCATEGORIZED',
          createdAt: new Date(),
        }
      });

      // Create Version 1 linked to S3
      await tx.documentVersion.create({
        data: {
          documentId: document.id,
          version: 1,
          blobUrl: dto.s3Key, // Storing S3 key logic
          mimeType: dto.mimeType,
          sizeBytes: dto.size,
          status: 'AVAILABLE',
          uploadedBy: userId,
        }
      });

      // Emit Domain Event
      await tx.domainEventOutbox.create({
        data: {
          tenantId,
          aggregateType: 'Document',
          aggregateId: document.id,
          eventType: 'DOCUMENT_UPLOADED',
          payload: { documentId: document.id, s3Key: dto.s3Key, size: dto.size }
        }
      });

      return document;
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.tenantClient.document.findUnique({
      where: { id },
      include: {
        versions: true,
      }
    });

    if (!document) throw new NotFoundException('Document not found');

    const activeVersion = document.versions.sort((a, b) => b.version - a.version)[0];
    let downloadUrl = null;

    if (activeVersion && activeVersion.blobUrl) {
      downloadUrl = await this.storage.generatePresignedUrl(activeVersion.blobUrl, activeVersion.document?.tenantId || '');
    }

    return {
      ...document,
      activeVersion,
      downloadUrl
    };
  }
}
