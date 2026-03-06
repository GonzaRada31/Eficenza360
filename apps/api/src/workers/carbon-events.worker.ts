import { Worker, Job } from 'bullmq';
import { QueueFactory } from '../infra/queues/queue.factory';
import { QUEUE_NAMES } from '../infra/queues/queue.constants';
import { PrismaClient } from '@prisma/client';
import { IdempotencyValidator } from './idempotency';
import { BillingService } from '../modules/billing/billing.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('CarbonEventsWorker');
const prisma = new PrismaClient();
const idempotency = new IdempotencyValidator(prisma);
const billing = new BillingService(prisma as any);

export const carbonWorker = QueueFactory.createWorker(
  QUEUE_NAMES.CARBON_EVENTS,
  async (job: Job) => {
    const { eventId, tenantId, eventType, payload } = job.data;

    if (await idempotency.hasProcessed(eventId, 'CarbonWorker')) return;

    if (eventType === 'CARBON_CALCULATED') {
      await billing.recordUsage(tenantId, 'carbon_reports_generated', 1);
    }

    await idempotency.markProcessed(eventId, 'CarbonWorker');
  }
);
