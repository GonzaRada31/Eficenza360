import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('eficenza-workers');

export const jobsProcessedTotal = meter.createCounter('jobs_processed_total', {
  description: 'Total number of successfully processed jobs',
});

export const jobsFailedTotal = meter.createCounter('jobs_failed_total', {
  description: 'Total number of failed jobs',
});

export const queueLatency = meter.createHistogram('queue_latency', {
  description: 'Time elapsed between event creation and worker processing start (ms)',
  unit: 'ms',
});

export const workerExecutionTime = meter.createHistogram('worker_execution_time', {
  description: 'Duration of the worker processing logic (ms)',
  unit: 'ms',
});

export function recordWorkerMetrics(queueName: string, duration: number, success: boolean, latencyMs?: number) {
  const attributes = { queue: queueName };
  
  workerExecutionTime.record(duration, attributes);
  if (latencyMs) queueLatency.record(latencyMs, attributes);
  
  if (success) {
    jobsProcessedTotal.add(1, attributes);
  } else {
    jobsFailedTotal.add(1, attributes);
  }
}
