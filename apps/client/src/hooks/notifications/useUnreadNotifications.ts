import { useQuery } from '@tanstack/react-query';

export const useUnreadNotifications = () => {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => {
            // const response = await api.get('/notifications/unread');
            // return response.data;
            
            // Mock: Based on the 2 unread in our mock data
            return new Promise<{ count: number }>(resolve => {
                setTimeout(() => resolve({ count: 2 }), 400);
            });
        },
        refetchInterval: 30000 // Polling every 30s as a fallback to Websockets
    });
};
