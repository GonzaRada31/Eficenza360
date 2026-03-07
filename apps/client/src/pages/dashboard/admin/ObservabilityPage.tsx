
import { PageContainer } from '../../../components/layout/PageContainer';
import { PermissionGate } from '../../../components/security/PermissionGate';
import { SystemHealthCard } from '../../../components/observability/SystemHealthCard';
import { BillingPipelineStatus } from '../../../components/observability/BillingPipelineStatus';
import { QueueStatusPanel } from '../../../components/observability/QueueStatusPanel';
import { WorkerStatusTable } from '../../../components/observability/WorkerStatusTable';
import { APIResponseLatencyChart } from '../../../components/observability/APIResponseLatencyChart';
import { ErrorRateChart } from '../../../components/observability/ErrorRateChart';

export const ObservabilityPage = () => {
    return (
        <PageContainer 
            title="SaaS Observability & Monitoring" 
            description="Centro de control operacional para System Admins (SLA, Métricas de Worker, Pipelines y Latencia HTP)."
        >
            <PermissionGate permission="audit.read" fallback={
                <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 border border-gray-200 rounded-xl bg-gray-50 min-h-[400px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Acceso Restringido</h3>
                    <p className="text-sm max-w-sm">Este panel es exclusivo para operadores y administradores de plataforma.</p>
                </div>
            }>
                
                <div className="space-y-6 max-w-7xl">
                    
                    {/* Top row: Health & Billing */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SystemHealthCard />
                        <BillingPipelineStatus />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <APIResponseLatencyChart />
                        <ErrorRateChart />
                    </div>

                    {/* Queues & Workers Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-5">
                            <QueueStatusPanel />
                        </div>
                        <div className="xl:col-span-7">
                            <WorkerStatusTable />
                        </div>
                    </div>

                </div>

            </PermissionGate>
        </PageContainer>
    );
};
