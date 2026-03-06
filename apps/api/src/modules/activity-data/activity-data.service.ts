import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { CarbonCalculationService } from '../carbon-footprint/carbon-calculation.service';

@Injectable()
export class ActivityDataService {
  private readonly logger = new Logger(ActivityDataService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly carbonService: CarbonCalculationService,
  ) {}

  async create(data: Prisma.ActivityDataCreateInput) {
    const activity = await this.prisma.activityData.create({
      data,
    });

    // Auto-calculate carbon footprint if confirmed
    if (activity.status === 'CONFIRMED' || activity.status === 'VALIDATED') {
      try {
        await this.carbonService.calculateFromActivity(activity);
      } catch (error) {
        this.logger.error(
          `Failed to calculate carbon for activity ${activity.id}`,
          error,
        );
        // Non-blocking error for creation flow, but logged
      }
    }

    return activity;
  }
}
