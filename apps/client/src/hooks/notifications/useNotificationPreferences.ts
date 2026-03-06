import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationPreferencesData } from './types';

const mockPreferences: NotificationPreferencesData = {
    id: 'pref-1',
    userId: 'current-user',
    inApp: {
        auditValidated: true,
        carbonReport: true,
        documentUploaded: true,
        systemAlerts: true
    },
    email: {
        auditValidated: true,
        carbonReport: false,
        documentUploaded: false,
        systemAlerts: true
    }
};

export const useNotificationPreferences = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['notifications', 'preferences'],
        queryFn: async () => {
            // const response = await api.get('/notifications/preferences');
            // return response.data as NotificationPreferencesData;
            return new Promise<NotificationPreferencesData>(resolve => {
                setTimeout(() => resolve(mockPreferences), 400);
            });
        }
    });

    const mutation = useMutation({
        mutationFn: async (updatedData: Partial<NotificationPreferencesData>) => {
            // await api.patch('/notifications/preferences', updatedData);
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
        }
    });

    return { ...query, updatePreferences: mutation.mutate, isUpdating: mutation.isPending };
};
