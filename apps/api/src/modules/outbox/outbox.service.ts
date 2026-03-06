import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { queues } from '../../../infra/queues/queues';
import { EVENT_ROUTING_MAP } from '../../../infra/queues/queue.constants';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processOutbox() {
    try {
      // 1. Transaction to select and lock records
      const processedIds = await this.prisma.$transaction(async (tx) => {
        // Find 100 unpublished events
        const events = await tx.$queryRaw<any[]>`
          SELECT * FROM "DomainEventOutbox"
          WHERE processed = false
          ORDER BY "created_at" ASC
          LIMIT 100
          FOR UPDATE SKIP LOCKED
        `;

        if (events.length === 0) return [];

        this.logger.debug(`Found ${events.length} pending events to relay.`);
        
        const processed = [];

        for (const event of events) {
          const queueName = EVENT_ROUTING_MAP[event.event_type];
          
          if (queueName) {
            // Fan out to matching queue
            const mq = (queues as any)[this.toCamelCase(queueName)] || queues.deadLetter;
            
            await mq.add(event.event_type, {
              eventId: event.id,
              tenantId: event.tenant_id,
              aggregateType: event.aggregate_type,
              aggregateId: event.aggregate_id,
              eventType: event.event_type,
              payload: event.payload,
              createdAt: event.created_at,
            });
            this.logger.debug(`Relayed event ${event.id} to ${queueName}`);
          } else {
             this.logger.warn(`No queue mapping found for ${event.event_type}, sending to dead-letter`);
             await queues.deadLetter.add('unroutable-event', event);
          }

          processed.push(event.id);
        }

        // Mark all as processed inside the same locking transaction
        if (processed.length > 0) {
          await tx.$queryRaw`
            UPDATE "DomainEventOutbox"
            SET processed = true, status = 'PROCESSED'::"OutboxStatus"
            WHERE id IN (${ Prisma.join(processed) })
          `;
        }

        return processed;
      });

      return processedIds;
    } catch (e: any) {
      this.logger.error(`Error processing outbox: ${e.message}`, e.stack);
      return [];
    }
  }

  private toCamelCase(str: string) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
}
