import { Worker, Job } from 'bullmq';
import { QueueFactory } from '../infra/queues/queue.factory';
import { QUEUE_NAMES } from '../infra/queues/queue.constants';
import { PrismaClient } from '@prisma/client';
import { IdempotencyValidator } from './idempotency';
import { BillingService } from '../modules/billing/billing.service';
import { NotificationService } from '../modules/notifications/notification.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('DocumentEventsWorker');
const prisma = new PrismaClient();
const idempotency = new IdempotencyValidator(prisma);
const billing = new BillingService(prisma as any);
const notifications = new NotificationService(prisma as any);

export const documentWorker = QueueFactory.createWorker(
  QUEUE_NAMES.DOCUMENT_EVENTS,
  async (job: Job) => {
    const { eventId, tenantId, eventType, payload } = job.data;

    if (await idempotency.hasProcessed(eventId, 'DocumentWorker')) return;

    if (eventType === 'DOCUMENT_UPLOADED') {
      await billing.recordUsage(tenantId, 'documents_uploaded', 1);
      await notifications.notifyReviewers(tenantId, payload.s3Key);
    }

    await idempotency.markProcessed(eventId, 'DocumentWorker');
  },
);
