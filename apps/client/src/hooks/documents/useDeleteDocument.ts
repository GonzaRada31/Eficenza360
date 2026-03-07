import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (_documentId: string) => {
            // await api.delete(`/documents/${documentId}`);
            // Mock delay
            return new Promise(resolve => setTimeout(resolve, 600));
        },
        onSuccess: () => {
            // Invalidate the documents query so the list refreshes
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
    });
};
