import { Worker, Job } from 'bullmq';
import { QueueFactory } from '../infra/queues/queue.factory';
import { QUEUE_NAMES } from '../infra/queues/queue.constants';
import { PrismaClient } from '@prisma/client';
import { IdempotencyValidator } from './idempotency';
import { BillingService } from '../modules/billing/billing.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('BillingWorker');
const prisma = new PrismaClient();
const idempotency = new IdempotencyValidator(prisma);
const billing = new BillingService(prisma as any);

export const billingWorker = QueueFactory.createWorker(
  QUEUE_NAMES.BILLING,
  async (job: Job) => {
    const { eventId, tenantId, eventType, payload } = job.data;

    if (await idempotency.hasProcessed(eventId, 'BillingWorker')) return;

    if (eventType === 'TENANT_CREATED') {
      await billing.recordUsage(tenantId, 'tenant_activation_fee', 1);
    }

    await idempotency.markProcessed(eventId, 'BillingWorker');
  }
);
