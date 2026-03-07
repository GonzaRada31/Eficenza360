import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUE_NAMES } from '../infra/queues/queue.constants';
import { Logger } from '@nestjs/common';

const logger = new Logger('ResetQueuesScript');
const connection = new IORedis(
  process.env.REDIS_URL || 'redis://localhost:6379',
) as any;

async function main() {
  logger.log('Starting BullMQ Queue Reset...');

  const queueKeys = Object.values(QUEUE_NAMES);
  let totalCleared = 0;

  try {
    for (const key of queueKeys) {
      const q = new Queue(key, { connection });

      // Clean wait, active, delayed, failed, and completed lists
      logger.log(`Oblieterating queue: ${key}...`);
      await q.obliterate({ force: true });
      totalCleared++;
      logger.log(`✔ Queue ${key} wiped.`);

      await q.close();
    }

    logger.log(`✅ Successfully hard-reset ${totalCleared} queues.`);
  } catch (err: any) {
    logger.error(
      'Failed to obliterate queues (they might already be empty or missing Lua scripts if fresh):',
      err.message,
    );
    logger.warn('Attempting manual Redis flush for Bull prefixes...');

    // Fallback: Delete all BullMQ keys manually to guarantee pristine state
    const keys = await connection.keys('bull:*');
    if (keys.length > 0) {
      await connection.del(...keys);
      logger.log(`✅ Fully flushed ${keys.length} raw BullMQ keys manually.`);
    } else {
      logger.log('✔ No Redis keys found, cache is clean.');
    }
  } finally {
    connection.disconnect();
    process.exit(0);
  }
}

main();
