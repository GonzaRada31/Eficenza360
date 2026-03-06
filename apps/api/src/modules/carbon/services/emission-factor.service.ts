import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class EmissionFactorService {
  constructor(private readonly prisma: PrismaService) {}

  async findApplicableFactor(activityType: string, year: number) {
    // Basic search. In reality, it would match Region as well.
    const factor = await this.prisma.emissionFactor.findFirst({
      where: {
        type: activityType,
        validFrom: { lte: new Date(`${year}-12-31`) },
      },
      orderBy: { validFrom: 'desc' },
    });

    if (!factor) {
      throw new NotFoundException(`No valid emission factor found for type ${activityType} in year ${year}`);
    }

    return factor;
  }
}
