import { Worker, Job } from 'bullmq';
import { QueueFactory } from '../infra/queues/queue.factory';
import { QUEUE_NAMES } from '../infra/queues/queue.constants';
import { PrismaClient } from '@prisma/client';
import { IdempotencyValidator } from './idempotency';
import { BillingService } from '../modules/billing/billing.service';
import { NotificationService } from '../modules/notifications/notification.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('AuditEventsWorker');
const prisma = new PrismaClient();
const idempotency = new IdempotencyValidator(prisma);
const billing = new BillingService(prisma as any);
const notifications = new NotificationService(prisma as any);

export const auditWorker = QueueFactory.createWorker(
  QUEUE_NAMES.AUDIT_EVENTS,
  async (job: Job) => {
    const { eventId, tenantId, eventType, payload } = job.data;

    // 1. Idempotency Check
    if (await idempotency.hasProcessed(eventId, 'AuditWorker')) {
      logger.log(`Skipping already processed event: ${eventId}`);
      return;
    }

    logger.log(`Processing ${eventType} for tenant ${tenantId}`);

    // 2. Domain Action
    if (eventType === 'AUDIT_SUBMITTED') {
      await billing.recordUsage(tenantId, 'audits_processed', 1);
      await notifications.notifyTenantAdmin(
        tenantId,
        'Audit Submitted',
        `Audit ${payload.auditId} has been submitted for review`,
      );
    }

    // 3. Mark processed
    await idempotency.markProcessed(eventId, 'AuditWorker');
  },
);

auditWorker.on('completed', (job) => {
  logger.log(`Job with id ${job.id} has been completed`);
});
auditWorker.on('failed', (job, err) => {
  logger.error(`Job with id ${job?.id} has failed with ${err.message}`);
});
