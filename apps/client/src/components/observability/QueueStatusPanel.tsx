import React from 'react';
import { useQueueStatus } from '../../hooks/observability/useObservabilityMetrics';
import { Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const QueueStatusPanel: React.FC = () => {
    const { data: queues, isLoading } = useQueueStatus();

    if (isLoading || !queues) return <div className="h-48 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Layers size={18} className="text-brand-primary" />
                    BullMQ / Outbox Queues
                </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
                {queues.map(queue => (
                    <div key={queue.queueName} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${queue.status === 'healthy' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>
                                {queue.status === 'healthy' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 font-mono">{queue.queueName}</h4>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">Throughput: {queue.throughputPerSec} / sec</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto text-center sm:text-left divide-x divide-gray-100">
                            <div className="px-2">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pendientes</span>
                                <span className="text-xl font-bold text-gray-900">{queue.pendingCount.toLocaleString()}</span>
                            </div>
                            <div className="px-2">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Processing</span>
                                <span className="text-xl font-bold text-brand-primary">{queue.processingCount.toLocaleString()}</span>
                            </div>
                            <div className="px-2">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fallidos</span>
                                <span className={`text-xl font-bold ${queue.failedCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>{queue.failedCount.toLocaleString()}</span>
                            </div>
                            <div className="px-2">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Finalizados</span>
                                <span className="text-xl font-bold text-green-600">{queue.completedCount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
