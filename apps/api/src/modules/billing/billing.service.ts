import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordUsage(tenantId: string, metricName: string, value: number = 1) {
    this.logger.log(
      `Recording Usage: ${metricName}=${value} for Tenant ${tenantId}`,
    );

    return this.prisma.billingUsage.create({
      data: {
        tenantId,
        metricName,
        value,
      },
    });
  }
}
