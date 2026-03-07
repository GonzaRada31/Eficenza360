import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { getTenantId } from '../../../infra/context/tenant.context';
import { OccService } from './occ.service';
import { EmissionFactorService } from './emission-factor.service';

@Injectable()
export class CarbonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly occService: OccService,
    private readonly factorService: EmissionFactorService
  ) {}

  async calculateAndReport(auditId: string) {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("Tenant Context Missing");

    const audit = await this.prisma.tenantClient.energyAudit.findUnique({
      where: { id: auditId },
      include: {
        carbonActivities: true,
      }
    });

    if (!audit) throw new NotFoundException('Audit not found');

    const activities = audit.carbonActivities;
    
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const results = [];
      
      // Process activities sequentially for safety or use Promise.all in bulk logic
      for (const activity of activities) {
        // Find matching factor
        const factor = await this.factorService.findApplicableFactor(activity.activityType, audit.year);
        
        // Let OCC Engine calculate
        const result = this.occService.processActivity({
          activityId: activity.id,
          activityType: activity.activityType,
          activityValue: activity.activityValue,
          activityUnit: activity.activityUnit,
        }, factor as any);

        // Save calculation
        const calculation = await tx.carbonCalculation.create({
          data: {
            activityId: activity.id,
            emissions: result.emissions,
            unit: result.unit,
          }
        });

        results.push({ calculation, result });
      }

      // Aggregate
      const mappedResults = results.map(r => r.result);
      const totalEmissions = this.occService.aggregateEmissions(mappedResults);

      // Generate Report
      const report = await tx.carbonReport.create({
        data: {
          auditId,
          totalEmissions,
        }
      });

      // Emit Domain Event
      await tx.domainEventOutbox.create({
        data: {
          tenantId: tenantId,
          aggregateType: 'CarbonReport',
          aggregateId: report.id,
          eventType: 'CARBON_CALCULATED',
          payload: { auditId, totalEmissions, reportId: report.id, calculationsMade: results.length }
        }
      });

      return {
        report,
        calculations: results.length,
      };
    });
  }
}
