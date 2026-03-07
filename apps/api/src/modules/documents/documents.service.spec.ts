import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../infra/storage/storage.provider.interface';

jest.mock('../../infra/context/tenant.context', () => ({
  getTenantId: jest.fn(() => 'tenant-123'),
  getCurrentUserId: jest.fn(() => 'user-123'),
}));

describe('DocumentsService', () => {
  let service: DocumentsService;
  
  const mockPrismaService: any = {
    $transaction: jest.fn(cb => cb(mockPrismaService)),
    document: { create: jest.fn().mockResolvedValue({ id: 'doc-1' }) },
    documentVersion: { create: jest.fn() },
    domainEventOutbox: { create: jest.fn() }
  };

  const mockS3Adapter = {
    generatePresignedPutUrl: jest.fn().mockResolvedValue('https://s3.aws.mock/put-url'),
    generatePresignedGetUrl: jest.fn().mockResolvedValue('https://s3.aws.mock/get-url'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: STORAGE_PROVIDER, useValue: mockS3Adapter },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should return a presigned URL', async () => {
    const res = await service.generatePresignedUrl({ fileName: 'test.pdf', contentType: 'application/pdf' });
    expect(res.uploadUrl).toBe('https://s3.aws.mock/put-url');
    expect(mockS3Adapter.generatePresignedPutUrl).toHaveBeenCalledWith('test.pdf', 'application/pdf');
  });

  it('should create metadata and emitDOCUMENT_UPLOADED event', async () => {
    const dto = { name: 'Doc', mimeType: 'pdf', size: 100, s3Key: 'key' };
    const doc = await service.create(dto);
    
    expect(mockPrismaService.document.create).toHaveBeenCalled();
    expect(mockPrismaService.documentVersion.create).toHaveBeenCalled();
    expect(mockPrismaService.domainEventOutbox.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ eventType: 'DOCUMENT_UPLOADED' })})
    );
    expect(doc.id).toEqual('doc-1');
  });
});
