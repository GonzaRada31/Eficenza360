import { Test, TestingModule } from '@nestjs/testing';
import { CarbonService } from './carbon.service';
import { OccService } from './occ.service';
import { EmissionFactorService } from './emission-factor.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';

jest.mock('../../../infra/context/tenant.context', () => ({
  getTenantId: jest.fn(() => 'tenant-123'),
}));

describe('CarbonService', () => {
  let service: CarbonService;
  let mockPrismaService: any = {
    $transaction: jest.fn((cb: any) => cb(mockPrismaService)),
    tenantClient: {
      energyAudit: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'audit-1',
          year: 2026,
          carbonActivities: [{ id: 'act-1', activityType: 'electricity', activityValue: 100 }]
        })
      }
    },
    carbonCalculation: { create: jest.fn().mockResolvedValue({ id: 'calc-1' }) },
    carbonReport: { create: jest.fn().mockResolvedValue({ id: 'rep-1', totalEmissions: 50 }) },
    domainEventOutbox: { create: jest.fn() }
  };
  let mockOccService = {
    processActivity: jest.fn().mockReturnValue({ emissions: 50, unit: 'kgCO2e' }),
    aggregateEmissions: jest.fn().mockReturnValue(50),
  };
  let mockEmissionFactorService = {
    findApplicableFactor: jest.fn().mockResolvedValue({ factorValue: 0.5 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarbonService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OccService, useValue: mockOccService },
        { provide: EmissionFactorService, useValue: mockEmissionFactorService },
      ],
    }).compile();

    service = module.get<CarbonService>(CarbonService);
  });

  it('should calculate carbon footprint and emit event', async () => {
    const result = await service.calculateAndReport('audit-1');
    expect(mockOccService.processActivity).toHaveBeenCalled();
    expect(mockPrismaService.carbonReport.create).toHaveBeenCalled();
    expect(mockPrismaService.domainEventOutbox.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ eventType: 'CARBON_CALCULATED' }) })
    );
    expect(result.calculations).toEqual(1);
    expect(result.report.totalEmissions).toEqual(50);
  });
});
