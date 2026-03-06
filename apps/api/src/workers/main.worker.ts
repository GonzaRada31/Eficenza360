// Initialize OpenTelemetry globally before workers load
import '../infra/telemetry/otel';

import { auditWorker } from './audit-events.worker';
import { carbonWorker } from './carbon-events.worker';
import { documentWorker } from './document-events.worker';
import { notificationWorker } from './notification.worker';
import { billingWorker } from './billing.worker';
import { Logger } from '@nestjs/common';

const logger = new Logger('WorkerBootstrap');

async function bootstrap() {
  logger.log('Bootstrapping BullMQ Workers... (Standalone Process)');

  const workers = [
    auditWorker,
    carbonWorker,
    documentWorker,
    notificationWorker,
    billingWorker,
  ];

  logger.log(`${workers.length} workers registered and listening to external Redis queues.`);

  // Graceful shutdown hooks
  const shutdown = async () => {
    logger.log('Shutting down workers gracefully...');
    await Promise.all(workers.map(w => w.close()));
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap();
