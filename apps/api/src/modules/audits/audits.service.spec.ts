import { Test, TestingModule } from '@nestjs/testing';
import { AuditsService } from './audits.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { getTenantId, getCurrentUserId } from '../../../infra/context/tenant.context';

jest.mock('../../../infra/context/tenant.context', () => ({
  getTenantId: jest.fn(() => 'tenant-123'),
  getCurrentUserId: jest.fn(() => 'user-123'),
}));

const mockPrismaService = {
  $transaction: jest.fn(cb => cb(mockPrismaService)),
  energyAudit: {
    create: jest.fn().mockResolvedValue({ id: 'audit-1', name: 'Mock Audit', status: 'DRAFT' }),
    update: jest.fn().mockResolvedValue({ id: 'audit-1', status: 'SUBMITTED' }),
  },
  domainEventOutbox: {
    create: jest.fn().mockResolvedValue({ id: 'event-1' }),
  },
  tenantClient: {
    energyAudit: {
      findMany: jest.fn().mockResolvedValue([{ id: 'audit-1', name: 'Mock Audit' }]),
      findUnique: jest.fn().mockResolvedValue({ id: 'audit-1', name: 'Mock Audit' }),
    }
  }
};

describe('AuditsService', () => {
  let service: AuditsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditsService>(AuditsService);
  });

  it('should create an audit and emit a domain event', async () => {
    const dto = { name: 'Test Audit', companyId: 'comp-123' };
    const result = await service.create(dto as any);
    
    expect(mockPrismaService.energyAudit.create).toHaveBeenCalled();
    expect(mockPrismaService.domainEventOutbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: 'AUDIT_CREATED' })
      })
    );
    expect(result.id).toEqual('audit-1');
  });

  it('should submit an audit and emit an event', async () => {
    const result = await service.submit('audit-1');
    expect(mockPrismaService.energyAudit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'SUBMITTED' }})
    );
    expect(mockPrismaService.domainEventOutbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: 'AUDIT_SUBMITTED' })
      })
    );
    expect(result.status).toEqual('SUBMITTED');
  });
});
