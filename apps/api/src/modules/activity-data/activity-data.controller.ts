import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ActivityDataService } from './activity-data.service';

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
@Controller('activity-data')
export class ActivityDataController {
  constructor(private readonly activityDataService: ActivityDataService) {}

  @Post()
  async create(@Body() body: any) {
    // Enhanced Manual Validation (Prototype phase) - replace with DTO/Zod later
    const missingFields: string[] = [];
    if (!body.siteId) missingFields.push('siteId');
    if (!body.consumptionValue) missingFields.push('consumptionValue');
    if (!body.periodStart) missingFields.push('periodStart');
    if (!body.periodEnd) missingFields.push('periodEnd');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`,
      );
    }

    // Default status handling
    // If OCR data is incomplete or user flags it, status might be DRAFT
    const status = body.status || 'CONFIRMED';

    return this.activityDataService.create({
      site: { connect: { id: body.siteId } },
      consumptionValue: parseFloat(body.consumptionValue),
      cost: body.cost ? parseFloat(body.cost) : null,
      originalUnit: body.originalUnit || 'kWh',
      serviceType: body.serviceType || 'ELECTRICITY', // Default to Electricity
      status: status,
      periodStart: new Date(body.periodStart),
      periodEnd: new Date(body.periodEnd),
      evidenceUrl: body.evidenceUrl,
      metaData: body.metaData,
    } as any); // Cast to any because Prisma types might be stale in editor vs runtime
  }
}
