import React, { useEffect } from 'react';
import { type AuditLog } from '../../types/audit';
import { X } from 'lucide-react';

interface AuditLogDrawerProps {
    log: AuditLog | null;
    onClose: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ log, onClose }) => {
    
    // Trap focus and block body scrolling
    useEffect(() => {
        if (log) {
            window.document.body.style.overflow = 'hidden';
        } else {
            window.document.body.style.overflow = 'unset';
        }
        return () => {
             window.document.body.style.overflow = 'unset';
        };
    }, [log]);

    if (!log) return null;

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date(dateString));
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-200';
            case 'FAILURE': return 'text-red-600 bg-red-50 border-red-200';
            case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 w-full max-w-2xl flex">
                <div className="relative w-full h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                                Detalle de Auditoría
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getResultColor(log.result)}`}>
                                    {log.result}
                                </span>
                            </h2>
                            <p className="text-xs text-gray-500 font-mono mt-1">ID: {log.id}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Timestamp</span>
                                <span className="text-sm font-medium text-gray-900">{formatDate(log.timestamp)}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Actor (User)</span>
                                <span className="text-sm font-medium text-gray-900">{log.userEmail}</span>
                                <span className="block text-xs text-gray-500 font-mono mt-0.5">{log.userId}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Acción & Entidad</span>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-dark rounded text-xs font-bold">
                                        {log.action}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">{log.entity}</span>
                                </div>
                                <span className="block text-xs text-gray-500 font-mono mt-0.5">ID: {log.entityId}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contexto Red</span>
                                <span className="text-sm font-medium text-gray-900">{log.ipAddress}</span>
                                <span className="block text-xs text-gray-500 font-mono mt-0.5">Tenant: {log.tenantId}</span>
                            </div>
                        </div>

                        {/* Payload Viewer */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                Payload (JSON Snapshot)
                            </h3>
                            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-inner border border-gray-800">
                                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
                                    <span className="text-xs font-mono text-gray-400">snapshot.json</span>
                                </div>
                                <div className="p-4 overflow-x-auto">
                                    <pre className="text-[13px] font-mono leading-relaxed text-[#d4d4d4]">
                                        {JSON.stringify(log.payload, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
