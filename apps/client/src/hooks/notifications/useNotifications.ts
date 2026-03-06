import { useQuery } from '@tanstack/react-query';
import type { AppNotification } from './types';
import { apiClient } from '../../lib/api-client';



export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: async () => {
            // We use the real API instead of mocks
            const response = await apiClient.get('/notifications');
            return response.data as AppNotification[];
        }
    });
};
