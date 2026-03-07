import React, { useState } from 'react';
import { useAuditLogs } from '../../hooks/audit/useAuditLogs';
import { type AuditLogFiltersData, type AuditLog } from '../../types/audit';
import { AuditLogRow } from './AuditLogRow';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogDrawer } from './AuditLogDrawer';
import { Loader2, ShieldAlert } from 'lucide-react';
import { PermissionGate } from '../security/PermissionGate';

export const AuditLogTable: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [filters, setFilters] = useState<AuditLogFiltersData>({});
    
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const { data: paginatedData, isLoading, error } = useAuditLogs({ page, limit, filters });

    const handleFilterChange = (newFilters: AuditLogFiltersData) => {
        setFilters(newFilters);
        setPage(1); // Reset to page 1 on filter change
    };

    return (
        <PermissionGate permission="audit.read" fallback={
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 border border-gray-200 rounded-xl bg-gray-50 min-h-[400px]">
                <ShieldAlert size={48} className="mb-4 text-red-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Acceso Restringido</h3>
                <p className="text-sm max-w-sm">No tiene nivel de autorización `TenantAdmin` o superior para visualizar el registro forense de auditoría.</p>
            </div>
        }>
            <div className="flex flex-col w-full shadow-sm rounded-xl bg-white border border-gray-100 overflow-hidden">
                <AuditLogFilters filters={filters} onFilterChange={handleFilterChange} />
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-y border-gray-100 uppercase text-[10px] font-bold tracking-wider text-gray-500">
                                <th className="py-3 px-4 font-semibold">Timestamp</th>
                                <th className="py-3 px-4 font-semibold">Usuario</th>
                                <th className="py-3 px-4 font-semibold">Acción</th>
                                <th className="py-3 px-4 font-semibold">Entidad</th>
                                <th className="py-3 px-4 font-semibold hidden md:table-cell">Tenant</th>
                                <th className="py-3 px-4 font-semibold">Resultado</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Loader2 className="animate-spin text-brand-primary mb-2" size={24} />
                                            <span className="text-sm font-medium">Extrayendo registros cifrados...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && error && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block text-sm font-medium">
                                            Error de conexión con el Audit System.
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !error && paginatedData?.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-500 bg-gray-50/50">
                                        No se encontraron trazas de auditoría con los filtros actuales.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !error && paginatedData?.data.map(log => (
                                <AuditLogRow 
                                    key={log.id} 
                                    log={log} 
                                    onClick={setSelectedLog} 
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!isLoading && !error && paginatedData && paginatedData.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-50/50 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Total: {paginatedData.total} registros
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Anterior
                            </button>
                            <span className="text-sm font-medium text-gray-600 min-w-[40px] text-center">
                                {page} / {paginatedData.totalPages}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(paginatedData.totalPages, p + 1))}
                                disabled={page === paginatedData.totalPages}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AuditLogDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
        </PermissionGate>
    );
};
