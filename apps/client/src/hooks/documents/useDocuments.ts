import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { DocumentData } from '../../../components/documents/DocumentItem';

// Standard Mock Data for UI building purposes (Fase 6C)
const MOCK_DOCS: DocumentData[] = [
    {
        id: 'doc-1',
        filename: 'Factura_Edenor_Oct2023.pdf',
        sizeBytes: 1024 * 1024 * 2.5,
        mimeType: 'application/pdf',
        uploadedBy: 'admin@eficenza.com',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        version: 1,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
        id: 'doc-2',
        filename: 'Mediciones_Transformador_C1.xlsx',
        sizeBytes: 1024 * 45, // 45KB
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedBy: 'auditor@eficenza.com',
        createdAt: new Date().toISOString(),
        version: 2,
        url: '#'
    }
];

export const useDocuments = (entityType: string, entityId: string) => {
    return useQuery({
        queryKey: ['documents', entityType, entityId],
        queryFn: async () => {
            // const response = await api.get(`/documents?entityType=${entityType}&entityId=${entityId}`);
            // return response.data as DocumentData[];
            
            // Mock delayed response for UI
            return new Promise<DocumentData[]>((resolve) => {
                setTimeout(() => resolve(MOCK_DOCS), 600);
            });
        }
    });
};
