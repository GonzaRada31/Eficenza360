import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379') as any;

// Outbox Relay Queue (High Priority)
export const outboxRelayQueue = new Queue('system:outbox-relay', { connection });

// Notification Delivery Queue (IO Bound)
export const notificationQueue = new Queue('notify:delivery', { connection });

// Carbon Engine Queue (CPU Bound)
export const carbonCalcQueue = new Queue('calc:carbon-engine', { connection });

// Example basic worker configuration for the outbox relay
export const outboxRelayWorker = new Worker(
  'system:outbox-relay',
  async (job) => {
    // Process the outbox event and emit proper bounded context messages
    console.log(`Processing outbox job ${job.id}`, job.data);
  },
  { 
    connection,
    concurrency: 5, // Pure I/O so moderate concurrency is fine
  }
);
