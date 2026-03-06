import type { 
    SystemHealthMetrics, 
    QueueStatusMetric, 
    WorkerStatusNode, 
    ResponseLatencyDataPoint, 
    ErrorRateDataPoint, 
    BillingPipelineMetric 
} from '../types/observability';

export const MOCK_SYSTEM_HEALTH: SystemHealthMetrics = {
    cpuUsagePercent: 42,
    memoryUsagePercent: 65,
    dbConnectionActive: 85,
    dbConnectionLimit: 200,
    status: 'healthy',
    lastUpdated: new Date().toISOString()
};

export const MOCK_QUEUE_STATUS: QueueStatusMetric[] = [
    {
        queueName: 'domain-events:outbox',
        pendingCount: 1420,
        processingCount: 50,
        failedCount: 2,
        completedCount: 89000,
        stalledCount: 0,
        throughputPerSec: 150,
        status: 'healthy'
    },
    {
        queueName: 'billing:webhooks',
        pendingCount: 5,
        processingCount: 1,
        failedCount: 12, // elevated failures
        completedCount: 450,
        stalledCount: 0,
        throughputPerSec: 2,
        status: 'warning'
    }
];

export const MOCK_WORKERS: WorkerStatusNode[] = [
    { id: 'w-01', name: 'relay-worker-primary', status: 'processing', currentJobId: 'job-991', uptimeSeconds: 86400, memoryUsageMb: 245 },
    { id: 'w-02', name: 'relay-worker-replica', status: 'idle', uptimeSeconds: 86400, memoryUsageMb: 120 },
    { id: 'w-03', name: 'billing-cron', status: 'paused', uptimeSeconds: 3600, memoryUsageMb: 95 },
    { id: 'w-04', name: 'calc-engine', status: 'stalled', currentJobId: 'job-err-44', uptimeSeconds: 45000, memoryUsageMb: 890 }
];

export const MOCK_LATENCY: ResponseLatencyDataPoint[] = Array.from({ length: 24 }).map((_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    p50: 45 + Math.random() * 20,
    p95: 120 + Math.random() * 50,
    p99: 300 + Math.random() * 150
}));

export const MOCK_ERROR_RATE: ErrorRateDataPoint[] = Array.from({ length: 24 }).map((_, i) => {
    const isSpike = i === 18;
    const errorCount = isSpike ? 450 : Math.floor(Math.random() * 5);
    const totalRequests = 10000 + Math.floor(Math.random() * 2000);
    return {
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        errorPercentage: (errorCount / totalRequests) * 100,
        totalRequests,
        errorCount
    };
});

export const MOCK_BILLING: BillingPipelineMetric = {
    currentStatus: 'running',
    lastRunAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    nextRunAt: new Date(Date.now() + 3600000 * 12).toISOString(),
    eventsProcessed: 1450200,
    mrrCalculated: 854000,
    failedWebhooks: 3,
    alertTriggered: false
};
