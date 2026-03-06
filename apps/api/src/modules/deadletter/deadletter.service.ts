import { Injectable, Logger } from '@nestjs/common';
import { queues } from '../../infra/queues/queues';

@Injectable()
export class DeadLetterService {
  private readonly logger = new Logger(DeadLetterService.name);

  async getDeadJobs(limit: number = 50) {
    const dlq = queues.deadLetter;
    // Bullmq considers failed or delayed as possible DLQ mechanisms for this queue
    const failed = await dlq.getFailed(0, limit);
    return failed.map(job => ({
      id: job.id,
      name: job.name,
      failedReason: job.failedReason,
      data: job.data,
      timestamp: job.timestamp
    }));
  }

  async retryJob(jobId: string) {
    const dlq = queues.deadLetter;
    const job = await dlq.getJob(jobId);
    if (!job) throw new Error('Job not found in dead letter queue');
    
    await job.retry();
    this.logger.log(`Manually retrying job ${jobId}`);
    return { success: true, jobId };
  }
}
