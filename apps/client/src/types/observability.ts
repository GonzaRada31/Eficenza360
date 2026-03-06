export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface ObservabilityEvent {
    id: string;
    timestamp: string;
    traceId: string;
    tenantId?: string;
    userId?: string;
    level: LogLevel;
    message: string;
    context: string; // e.g., 'API_GATEWAY', 'RELAY_WORKER'
    latencyMs?: number;
    errorStack?: string;
    payload?: Record<string, unknown>;
}

export interface SystemHealthMetrics {
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    dbConnectionActive: number;
    dbConnectionLimit: number;
    status: HealthStatus;
    lastUpdated: string;
}

export interface QueueStatusMetric {
    queueName: string;
    pendingCount: number;
    processingCount: number;
    failedCount: number;
    completedCount: number;
    stalledCount: number;
    throughputPerSec: number;
    status: HealthStatus;
}

export interface WorkerStatusNode {
    id: string;
    name: string;
    status: 'idle' | 'processing' | 'paused' | 'stalled';
    currentJobId?: string;
    uptimeSeconds: number;
    memoryUsageMb: number;
}

export interface ResponseLatencyDataPoint {
    timestamp: string;
    p50: number;
    p95: number;
    p99: number;
}

export interface ErrorRateDataPoint {
    timestamp: string;
    errorPercentage: number;
    totalRequests: number;
    errorCount: number;
}

export interface BillingPipelineMetric {
    currentStatus: 'running' | 'completed' | 'failed' | 'idle';
    lastRunAt: string;
    nextRunAt: string;
    eventsProcessed: number;
    mrrCalculated: number;
    failedWebhooks: number;
    alertTriggered: boolean;
}

export interface AlertRule {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
    enabled: boolean;
}
