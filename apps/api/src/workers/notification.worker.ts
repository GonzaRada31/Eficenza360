import { Worker, Job } from 'bullmq';
import { QueueFactory } from '../infra/queues/queue.factory';
import { QUEUE_NAMES } from '../infra/queues/queue.constants';
import { PrismaClient } from '@prisma/client';
import { IdempotencyValidator } from './idempotency';
import { NotificationService } from '../modules/notifications/notification.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('NotificationWorker');
const prisma = new PrismaClient();
const idempotency = new IdempotencyValidator(prisma);
const notifications = new NotificationService(prisma as any);

export const notificationWorker = QueueFactory.createWorker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job) => {
    const { eventId, tenantId, eventType, payload } = job.data;

    if (await idempotency.hasProcessed(eventId, 'NotificationWorker')) return;

    if (eventType === 'USER_CREATED') {
      await notifications.notifyTenantAdmin(
        tenantId,
        'New User Joined',
        `${payload.email} joined your tenant workspace.`,
      );
    }

    await idempotency.markProcessed(eventId, 'NotificationWorker');
  },
);
