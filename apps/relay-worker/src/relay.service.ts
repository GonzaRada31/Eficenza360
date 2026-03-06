import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { BullMQProducerService } from './bullmq-producer.service';

@Injectable()
export class RelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RelayService.name);
  private isShuttingDown = false;
  private workerPromise: Promise<void> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: BullMQProducerService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting Relay Polling Worker...');
    this.workerPromise = this.startPolling();
  }

  async onModuleDestroy() {
    this.logger.log('Graceful shutdown initiated. Stopping Relay Polling Worker...');
    this.isShuttingDown = true;
    if (this.workerPromise) {
      await this.workerPromise;
    }
    this.logger.log('Relay Polling Worker stopped.');
  }

  private async startPolling() {
    while (!this.isShuttingDown) {
      try {
        await this.processBatch();
      } catch (error) {
        this.logger.error({
          msg: 'Error in Relay Polling Loop',
          err: error instanceof Error ? error.message : String(error)
        });
        await this.sleep(5000); // Backoff on critical failure
      }
    }
  }

  private async processBatch() {
    // 1. Transactional Lock & Mutate
    const lockedEvents = await this.prisma.$transaction(async (tx: any) => {
      // FOR UPDATE SKIP LOCKED pattern natively supported by Prisma 5.22 via $queryRaw
      const events = await tx.$queryRaw<any[]>`
        SELECT id, event_type as "eventType", payload 
        FROM "domain_event_outbox"
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT 100
        FOR UPDATE SKIP LOCKED;
      `;

      if (events.length === 0) {
        return [];
      }

      const eventIds = events.map((e: any) => e.id);

      // Mutate to PROCESSING in the same transaction
      await tx.domainEventOutbox.updateMany({
        where: { id: { in: eventIds } },
        data: {
          status: 'PROCESSING',
          lockedAt: new Date(),
        }
      });

      return events;
    });

    if (lockedEvents.length === 0) {
      await this.sleep(500); // 500ms delay if no records
      return;
    }

    this.logger.log({
      msg: 'Locked batch for processing',
      batchSize: lockedEvents.length,
      action: 'outbox_batch_locked'
    });

    // 2. Enqueue outside the transaction
    for (const event of lockedEvents) {
      if (this.isShuttingDown) {
         this.logger.warn('Worker shutting down, truncating batch enqueue');
         break;
      }
      try {
        const payload = typeof event.payload === 'string' 
          ? JSON.parse(event.payload) 
          : event.payload;

        await this.producer.enqueueEvent(event.eventType, payload, event.id);
        
        // PENDIENTE: El Worker de la cola de BullMQ (Consumer) es quien debe setear PROCESSED
        // Por SLA, el Relay NUNCA llama a PROCESSED.
        this.logger.log({
          msg: 'Event routed to Redis',
          action: 'outbox_transition',
          eventId: event.id,
          tenantId: event.tenantId,
          from_status: 'PENDING',
          to_status: 'PROCESSING', // Solo avisa que terminó la responsabilidad del Relay
        });

      } catch (error) {
        this.logger.error({
          msg: 'Failed to enqueue event to BullMQ, event stuck in PROCESSING until Zombie Recovery kicks in',
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Failsafe: Rollback to PENDING immediately
        await this.prisma.$executeRaw`
          UPDATE "domain_event_outbox" 
          SET status = 'PENDING', locked_at = NULL 
          WHERE id = ${event.id} AND status = 'PROCESSING'
        `.catch((err: any) => {
           this.logger.error('Failed to rollback from PROCESSING to PENDING on enqueue error', err);
        });
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
