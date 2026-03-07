import { Queue, Worker, QueueEvents, DefaultJobOptions } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const defaultQueueOptions: DefaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false, // Keep for inspection or move to DLQ manually
};

export class QueueFactory {
  static createQueue(name: string): Queue {
    return new Queue(name, { 
      connection,
      defaultJobOptions: defaultQueueOptions
    } as any);
  }

  static createWorker(name: string, processor: any, options: any = {}): Worker {
    return new Worker(name, processor, {
      connection,
      concurrency: options.concurrency || 5,
      ...options,
    } as any);
  }

  static createQueueEvents(name: string): QueueEvents {
    return new QueueEvents(name, { connection } as any);
  }
}
