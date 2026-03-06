import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ServiceType, Prisma } from '@prisma/client';

@Injectable()
export class EmissionFactorsService {
  constructor(private prisma: PrismaService) {}

  async findFactor(
    serviceType: ServiceType,
    year: number,
  ): Promise<{ value: number; unit: string; id?: string; source?: string }> {
    // Attempt DB lookup
    const factor = await this.prisma.emissionFactor.findFirst({
      where: {
        type: serviceType.toString(),
        validFrom: { lte: new Date(year, 0, 1) },
        OR: [{ validTo: null }, { validTo: { gte: new Date(year, 11, 31) } }],
      },
    });

    if (factor)
      return {
        value: factor.factorValue,
        unit: `${factor.unitNumerator}/${factor.unitDenominator}`,
        id: factor.id,
        source: factor.source,
      };

    // Fallback Defaults
    const DEFAULTS: Partial<
      Record<ServiceType, { value: number; unit: string; source: string }>
    > = {
      [ServiceType.ELECTRICITY]: {
        value: 0.35,
        unit: 'kgCO2e/kWh',
        source: 'Default MVP Grid',
      },
      [ServiceType.GAS]: {
        value: 2.0,
        unit: 'kgCO2e/m3',
        source: 'Default MVP Gas',
      },
      [ServiceType.GAS_NATURAL]: {
        value: 2.0,
        unit: 'kgCO2e/m3',
        source: 'Default MVP Gas Natural',
      },
      [ServiceType.WATER]: {
        value: 0.3,
        unit: 'kgCO2e/m3',
        source: 'Default MVP Water',
      },
      [ServiceType.FUEL]: {
        value: 2.68,
        unit: 'kgCO2e/L',
        source: 'Default MVP Fuel',
      },
      [ServiceType.DIESEL]: {
        value: 2.68,
        unit: 'kgCO2e/L',
        source: 'Default MVP Diesel',
      },
      [ServiceType.GASOLINE]: {
        value: 2.3,
        unit: 'kgCO2e/L',
        source: 'Default MVP Gasoline',
      },
      [ServiceType.LPG]: {
        value: 1.5,
        unit: 'kgCO2e/L',
        source: 'Default MVP LPG',
      },
    };

    return (
      DEFAULTS[serviceType] || {
        value: 0,
        unit: 'kgCO2e/unit',
        source: 'Unknown',
      }
    );
  }

  async findAll() {
    return this.prisma.emissionFactor.findMany({
      orderBy: { validFrom: 'desc' },
    });
  }

  async create(data: Prisma.EmissionFactorCreateInput) {
    return this.prisma.emissionFactor.create({ data });
  }

  async update(id: string, data: Prisma.EmissionFactorUpdateInput) {
    return this.prisma.emissionFactor.update({
      where: { id },
      data,
    });
  }
}
