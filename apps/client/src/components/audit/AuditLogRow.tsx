import React from 'react';
import { AuditLog } from '../../types/audit';
import { Eye } from 'lucide-react';

interface AuditLogRowProps {
    log: AuditLog;
    onClick: (log: AuditLog) => void;
}

export const AuditLogRow: React.FC<AuditLogRowProps> = ({ log, onClick }) => {

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date(dateString));
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'SUCCESS': return 'bg-green-100 text-green-700';
            case 'FAILURE': return 'bg-red-100 text-red-700';
            case 'WARNING': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <tr 
            className="group hover:bg-brand-primary/5 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
            onClick={() => onClick(log)}
        >
            <td className="py-3 px-4 whitespace-nowrap">
                <span className="text-xs font-medium text-gray-500">{formatDate(log.timestamp)}</span>
            </td>
            <td className="py-3 px-4">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={log.userEmail}>{log.userEmail}</span>
                </div>
            </td>
            <td className="py-3 px-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                    {log.action}
                </span>
            </td>
            <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-900">{log.entity}</span>
            </td>
            <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell">
                <span className="text-xs font-mono text-gray-500">{log.tenantId}</span>
            </td>
            <td className="py-3 px-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getResultColor(log.result)}`}>
                    {log.result}
                </span>
            </td>
            <td className="py-3 px-4 whitespace-nowrap text-right">
                <button 
                    className="p-1.5 text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Ver detalle"
                >
                    <Eye size={16} />
                </button>
            </td>
        </tr>
    );
};
