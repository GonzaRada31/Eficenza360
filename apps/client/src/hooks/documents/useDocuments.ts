import { useQuery } from '@tanstack/react-query';
import { apiClient as api } from '../../lib/api-client';
import { DocumentData } from '../../components/documents/DocumentItem';



export const useDocuments = (entityType: string, entityId: string) => {
    return useQuery({
        queryKey: ['documents', entityType, entityId],
        queryFn: async () => {
            const response = await api.get(`/documents?entityType=${entityType}&entityId=${entityId}`);
            return response.data as DocumentData[];
        }
    });
};
