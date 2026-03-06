import React from 'react';
import { useSystemHealth } from '../../hooks/observability/useObservabilityMetrics';
import { Activity, Cpu, HardDrive, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SystemHealthCard: React.FC = () => {
    const { data: health, isLoading } = useSystemHealth();

    if (isLoading || !health) return <div className="h-32 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>;

    const StatusIcon = health.status === 'healthy' ? CheckCircle2 : AlertTriangle;
    const statusColor = health.status === 'healthy' ? 'text-green-500' : health.status === 'warning' ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Activity size={18} className="text-brand-primary" />
                    Salud del Core System
                </h3>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-50 border border-gray-100 ${statusColor}`}>
                    <StatusIcon size={14} />
                    {health.status}
                </div>
            </div>

            <div className="space-y-5">
                <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 flex items-center gap-1.5"><Cpu size={14} /> CPU (Cluster)</span>
                        <span className="font-medium text-gray-900">{health.cpuUsagePercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${health.cpuUsagePercent > 85 ? 'bg-red-500' : 'bg-brand-primary'}`} style={{ width: `${health.cpuUsagePercent}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 flex items-center gap-1.5"><HardDrive size={14} /> RAM (Heap)</span>
                        <span className="font-medium text-gray-900">{health.memoryUsagePercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${health.memoryUsagePercent > 80 ? 'bg-yellow-500' : 'bg-brand-secondary'}`} style={{ width: `${health.memoryUsagePercent}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 flex items-center gap-1.5"><Database size={14} /> DB Pool (Prisma)</span>
                        <span className="font-medium text-gray-900">{health.dbConnectionActive} / {health.dbConnectionLimit}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-purple-500" style={{ width: `${(health.dbConnectionActive/health.dbConnectionLimit)*100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
