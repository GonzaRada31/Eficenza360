import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateAuditDto, UpdateAuditDto } from './dto/audit.dto';
import { getTenantId, getCurrentUserId } from '../../infra/context/tenant.context';

@Injectable()
export class AuditsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditDto) {
    const tenantId = getTenantId();
    const userId = getCurrentUserId();

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const audit = await tx.energyAudit.create({
        data: {
          name: dto.name,
          companyId: dto.companyId,
          tenantId: tenantId!,
          year: new Date().getFullYear(),
          status: 'DRAFT',
          createdBy: userId,
        }
      });

      await tx.domainEventOutbox.create({
        data: {
          tenantId: tenantId!,
          aggregateType: 'EnergyAudit',
          aggregateId: audit.id,
          eventType: 'AUDIT_CREATED',
          payload: { auditId: audit.id, name: audit.name }
        }
      });

      return audit;
    });
  }

  async findAll() {
    return this.prisma.tenantClient.energyAudit.findMany({
      include: {
        auditSites: true,
      }
    });
  }

  async findOne(id: string) {
    const audit = await this.prisma.tenantClient.energyAudit.findUnique({
      where: { id },
      include: {
        auditSites: true,
        consumptionRecords: true,
      }
    });
    
    if (!audit) throw new NotFoundException('Audit not found');
    return audit;
  }

  async update(id: string, dto: UpdateAuditDto) {
    return this.prisma.tenantClient.energyAudit.update({
      where: { id },
      data: dto
    });
  }

  async submit(id: string) {
    const tenantId = getTenantId();
    
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Intentionally bypassed extension via `tx` to showcase standard transactional queries
      // Usually, we'd use tx.energyAudit with strict explicit tenant checks or custom middleware
      const audit = await tx.energyAudit.update({
        where: { id_tenantId: { id, tenantId: tenantId! } },
        data: { status: 'SUBMITTED' as any }
      });

      await tx.domainEventOutbox.create({
        data: {
          tenantId: tenantId!,
          aggregateType: 'EnergyAudit',
          aggregateId: audit.id,
          eventType: 'AUDIT_SUBMITTED',
          payload: { auditId: audit.id }
        }
      });

      return audit;
    });
  }
}
