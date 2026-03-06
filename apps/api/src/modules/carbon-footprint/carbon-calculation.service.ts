import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmissionFactorsService } from './emission-factors.service';
import {
  ActivityData,
  CarbonScope,
  CarbonSourceType,
  ServiceType,
  DataStatus,
} from '@prisma/client';

@Injectable()
export class CarbonCalculationService {
  private readonly logger = new Logger(CarbonCalculationService.name);

  constructor(
    private prisma: PrismaService,
    private emissionFactors: EmissionFactorsService,
  ) {}

  async calculateFromActivity(activityData: ActivityData) {
    if (
      activityData.status !== DataStatus.CONFIRMED &&
      activityData.status !== DataStatus.VALIDATED
    ) {
      this.logger.warn(
        `Skipping calculation for unconfirmed activity ${activityData.id}`,
      );
      return;
    }

    const year = activityData.periodStart.getFullYear();
    const factor = await this.emissionFactors.findFactor(
      activityData.serviceType,
      year,
    );

    // Determine Scope automatically
    let scope: CarbonScope;
    switch (activityData.serviceType) {
      case ServiceType.FUEL:
      case ServiceType.GAS:
        scope = CarbonScope.SCOPE_1;
        break;
      case ServiceType.ELECTRICITY:
        scope = CarbonScope.SCOPE_2;
        break;
      case ServiceType.WATER:
        scope = CarbonScope.SCOPE_3; // Typically Scope 3 (Treatment/Supply)
        break;
      default:
        scope = CarbonScope.SCOPE_1;
    }

    // Calculate Emissions (Consumption * Factor)
    // Note: Ensure units match. Assuming Factor is per SAME unit as Activity for MVP.
    // In production, unit conversion service is needed.
    const emissions = (activityData.consumptionValue * factor.value) / 1000; // kg -> tonnes? check units.
    // If factor is kgCO2e, result is kg. We typically report in tCO2e.
    // So / 1000 is correct if inputs are consistent.

    const site = await this.prisma.site.findUnique({
      where: { id: activityData.siteId },
      include: { tenant: true },
    });
    if (!site) throw new Error('Site not found');

    const project = await this.prisma.project.findFirst({
      where: { tenantId: site.tenantId }, // rudimentary link to project. ideally activity maps to project directly or via site.
    });

    if (!project) {
      this.logger.warn(
        'No project found for site context to link Carbon Record',
      );
      // We might need to link ActivityData directly to Project, or Site to Project.
      // fallback: Just create it if we can identify the project, otherwise skip.
      return;
    }

    // Formula Traceability
    const formulaString = `${activityData.consumptionValue} ${activityData.originalUnit} * ${factor.value} ${factor.unit}`;

    // Upsert Carbon Record

    const record = await this.prisma.carbonRecord.upsert({
      where: { activityDataId: activityData.id },
      update: {
        consumptionValue: activityData.consumptionValue,
        emissionsTotal: emissions,
        year: year,
        scope: scope,
        // Snapshot updates (optional: should we update snapshots on re-calc? Yes, if underlying data changed)
        factorValueSnapshot: factor.value,
        factorSourceSnapshot: factor.source || 'Default',
        formulaSnapshot: formulaString,
        emissionFactorId: factor.id,
      },
      create: {
        projectId: project.id,
        activityDataId: activityData.id,
        year: year,
        scope: scope,
        category: `Consumo de ${activityData.serviceType}`,
        sourceType: CarbonSourceType.ACTIVITY_DATA,
        consumptionValue: activityData.consumptionValue,
        unit: activityData.originalUnit,
        emissionsTotal: emissions,
        // Snapshots for Audit
        factorValueSnapshot: factor.value,
        factorSourceSnapshot: factor.source || 'Default',
        formulaSnapshot: formulaString,
        emissionFactorId: factor.id,
      },
    });

    this.logger.log(
      `Calculated Carbon Record ${record.id} for Activity ${activityData.id}: ${emissions} tCO2e`,
    );
    return record;
  }
}
