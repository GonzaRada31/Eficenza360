import React from 'react';
import { useWorkersStatus } from '../../hooks/observability/useObservabilityMetrics';
import { Server } from 'lucide-react';

export const WorkerStatusTable: React.FC = () => {
    const { data: workers, isLoading } = useWorkersStatus();

    if (isLoading || !workers) return <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'processing': return 'bg-brand-primary text-white border-transparent';
            case 'idle': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'stalled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Server size={18} className="text-brand-primary" />
                    Relay Workers & Calculation Engines
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-y border-gray-100 uppercase text-[10px] font-bold tracking-wider text-gray-500">
                            <th className="py-3 px-6 font-semibold">Instance Name</th>
                            <th className="py-3 px-6 font-semibold">Status</th>
                            <th className="py-3 px-6 font-semibold">Current Job</th>
                            <th className="py-3 px-6 font-semibold">Uptime</th>
                            <th className="py-3 px-6 font-semibold">Memory</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {workers.map(worker => (
                            <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{worker.name}</span>
                                        <span className="text-xs text-gray-500 font-mono">{worker.id}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(worker.status)}`}>
                                        {worker.status}
                                    </span>
                                </td>
                                <td className="py-3 px-6">
                                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {worker.currentJobId || '----'}
                                    </span>
                                </td>
                                <td className="py-3 px-6">
                                    <span className="text-sm font-medium text-gray-900">{formatUptime(worker.uptimeSeconds)}</span>
                                </td>
                                <td className="py-3 px-6">
                                    <span className="text-sm font-medium text-gray-900">{worker.memoryUsageMb} MB</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
