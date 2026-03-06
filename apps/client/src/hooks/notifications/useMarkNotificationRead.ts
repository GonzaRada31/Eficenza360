import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, all = false }: { id?: string, all?: boolean }) => {
            // if (all) {
            //     await api.patch('/notifications/read-all');
            // } else {
            //     await api.patch(`/notifications/${id}/read`);
            // }
            return new Promise(resolve => setTimeout(resolve, 300));
        },
        onSuccess: () => {
            // Refresh both list and unread badge count
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};
