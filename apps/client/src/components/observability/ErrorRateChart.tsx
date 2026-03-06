import React from 'react';
import { useErrorRateMetrics } from '../../hooks/observability/useObservabilityMetrics';
import { ShieldAlert } from 'lucide-react';

export const ErrorRateChart: React.FC = () => {
    const { data: errorData, isLoading } = useErrorRateMetrics();

    if (isLoading || !errorData) return <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>;

    const maxErrorRate = Math.max(2, ...errorData.map(d => d.errorPercentage)); // min y-axis scale is 2%

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-red-500" />
                        System Error Rate
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Alert threshold: {'>'} 1% over 5 mins</p>
                </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-1 mt-4 h-48 overflow-hidden relative">
                {/* 1% Threshold Line */}
                <div className="absolute left-0 right-0 border-t border-dashed border-red-300 z-0 pointer-events-none" style={{ bottom: `${(1 / maxErrorRate) * 100}%` }}>
                    <span className="absolute right-0 top-1 text-[9px] font-bold text-red-400 bg-white px-1">1% SLA LIMIT</span>
                </div>

                {errorData.map((data, idx) => {
                    const height = `${(data.errorPercentage / maxErrorRate) * 100}%`;
                    const isAboveThreshold = data.errorPercentage > 1;
                    
                    return (
                        <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative cursor-crosshair z-10 w-full px-0.5">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity w-28 pointer-events-none">
                                <div className="font-mono mb-1">{new Date(data.timestamp).getHours()}:00</div>
                                <div className={isAboveThreshold ? 'text-red-400 font-bold' : ''}>Rate: {data.errorPercentage.toFixed(2)}%</div>
                                <div className="text-gray-400 mt-1">Errors: {data.errorCount}</div>
                                <div className="text-gray-400">Total: {data.totalRequests}</div>
                            </div>
                            
                            <div className={`w-full rounded-t-sm transition-all ${isAboveThreshold ? 'bg-red-500' : 'bg-gray-200 group-hover:bg-gray-300'}`} style={{ height, minHeight: '2px' }}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
