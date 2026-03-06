import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BullMQProducerService {
  private readonly logger = new Logger(BullMQProducerService.name);

  constructor(
    @InjectQueue('energy-events') private readonly eventQueue: Queue,
  ) {}

  async enqueueEvent(eventName: string, payload: any, eventId: string) {
    // Idempotencia a nivel de Redis
    await this.eventQueue.add(eventName, payload, {
      jobId: eventId, 
      removeOnComplete: false,
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 }
    });

    this.logger.log({
       msg: 'Event enqueued to BullMQ',
       eventId,
       queue: 'energy-events'
    });
  }
}
