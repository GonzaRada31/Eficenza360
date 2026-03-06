import React from 'react';
import { useBillingMetrics } from '../../hooks/observability/useObservabilityMetrics';
import { CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const BillingPipelineStatus: React.FC = () => {
    const { data: billing, isLoading } = useBillingMetrics();

    if (isLoading || !billing) return <div className="h-32 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard size={18} className="text-brand-primary" />
                    Billing Pipeline (MRR)
                </h3>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${billing.failedWebhooks > 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                    {billing.failedWebhooks > 0 ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>}
                    {billing.failedWebhooks > 0 ? `${billing.failedWebhooks} WEBHOOKS FAILED` : 'HEALTHY'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Calculated MRR (Month)</span>
                    <span className="text-2xl font-black text-gray-900">{formatCurrency(billing.mrrCalculated)}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Events Processed</span>
                    <span className="text-2xl font-black text-brand-primary">{billing.eventsProcessed.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
                <span>Last run: {new Date(billing.lastRunAt).toLocaleTimeString()}</span>
                <span>Next run: {new Date(billing.nextRunAt).toLocaleTimeString()}</span>
            </div>
        </div>
    );
};
