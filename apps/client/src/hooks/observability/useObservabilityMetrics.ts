import { useQuery } from '@tanstack/react-query';
import { 
    MOCK_SYSTEM_HEALTH, 
    MOCK_QUEUE_STATUS, 
    MOCK_WORKERS, 
    MOCK_LATENCY, 
    MOCK_ERROR_RATE, 
    MOCK_BILLING 
} from '../../mocks/observability';

export const useSystemHealth = () => useQuery({
    queryKey: ['observability', 'health'],
    queryFn: async () => MOCK_SYSTEM_HEALTH,
    refetchInterval: 5000 // Poll every 5s
});

export const useQueueStatus = () => useQuery({
    queryKey: ['observability', 'queues'],
    queryFn: async () => MOCK_QUEUE_STATUS,
    refetchInterval: 5000
});

export const useWorkersStatus = () => useQuery({
    queryKey: ['observability', 'workers'],
    queryFn: async () => MOCK_WORKERS,
    refetchInterval: 10000
});

export const useLatencyMetrics = () => useQuery({
    queryKey: ['observability', 'latency'],
    queryFn: async () => MOCK_LATENCY,
});

export const useErrorRateMetrics = () => useQuery({
    queryKey: ['observability', 'errors'],
    queryFn: async () => MOCK_ERROR_RATE,
});

export const useBillingMetrics = () => useQuery({
    queryKey: ['observability', 'billing'],
    queryFn: async () => MOCK_BILLING,
    refetchInterval: 60000
});
