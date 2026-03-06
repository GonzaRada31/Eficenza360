import React from 'react';
import { useLatencyMetrics } from '../../hooks/observability/useObservabilityMetrics';
import { BarChart3 } from 'lucide-react';

export const APIResponseLatencyChart: React.FC = () => {
    const { data: latencyData, isLoading } = useLatencyMetrics();

    if (isLoading || !latencyData) return <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>;

    // Simple flexbox-based bar chart using tailwind
    const maxP99 = Math.max(...latencyData.map(d => d.p99));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 size={18} className="text-brand-primary" />
                        API Latency (p50 / p95 / p99)
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Últimas 24 horas. SLAs the Degradation Alert: {'>'} 800ms</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-primary"></div> p50</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-secondary"></div> p95</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400"></div> p99</div>
                </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-1 mt-4 h-48 overflow-hidden">
                {latencyData.map((data, idx) => {
                    const heightP50 = `${(data.p50 / maxP99) * 100}%`;
                    const heightP95 = `${((data.p95 - data.p50) / maxP99) * 100}%`;
                    const heightP99 = `${((data.p99 - data.p95) / maxP99) * 100}%`;
                    
                    return (
                        <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative cursor-crosshair">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 w-28 pointer-events-none">
                                <div className="font-mono mb-1">{new Date(data.timestamp).getHours()}:00</div>
                                <div className="text-orange-300">p99: {Math.round(data.p99)}ms</div>
                                <div className="text-brand-secondary">p95: {Math.round(data.p95)}ms</div>
                                <div>p50: {Math.round(data.p50)}ms</div>
                            </div>
                            
                            <div className="w-full bg-red-400 rounded-t-sm transition-all group-hover:bg-red-500" style={{ height: heightP99 }}></div>
                            <div className="w-full bg-brand-secondary transition-all opacity-80 group-hover:opacity-100" style={{ height: heightP95 }}></div>
                            <div className="w-full bg-brand-primary transition-all opacity-80 group-hover:opacity-100" style={{ height: heightP50 }}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
