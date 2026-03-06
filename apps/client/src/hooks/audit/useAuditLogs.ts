import { useQuery } from '@tanstack/react-query';
import { AuditLogFiltersData, PaginatedAuditLogs } from '../../types/audit';
import { MOCK_AUDIT_LOGS } from '../../mocks/auditLogs';

interface UseAuditLogsProps {
    page: number;
    limit: number;
    filters: AuditLogFiltersData;
}

export const useAuditLogs = ({ page, limit, filters }: UseAuditLogsProps) => {
    return useQuery({
        queryKey: ['audit-logs', page, limit, filters],
        queryFn: async () => {
             // const response = await api.get('/audit-logs', { params: { page, limit, ...filters } });
             // return response.data as PaginatedAuditLogs;

             // Mock Implementation
             return new Promise<PaginatedAuditLogs>(resolve => {
                 setTimeout(() => {
                     let filtered = [...MOCK_AUDIT_LOGS];
                     
                     // Text search
                     if (filters.search) {
                         const search = filters.search.toLowerCase();
                         filtered = filtered.filter(log => 
                            log.userEmail.toLowerCase().includes(search) || 
                            log.action.toLowerCase().includes(search) ||
                            log.entity.toLowerCase().includes(search)
                         );
                     }
                     
                     // Dropdown filters
                     if (filters.action) {
                         filtered = filtered.filter(log => log.action === filters.action);
                     }
                     if (filters.result) { // assuming result is grouped in filters somewhere
                         // mapping logic if needed
                     }

                     const total = filtered.length;
                     const totalPages = Math.ceil(total / limit);
                     
                     resolve({
                         data: filtered,
                         total,
                         page,
                         limit,
                         totalPages
                     });
                 }, 600);
             });
        }
    });
};
