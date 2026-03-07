
import { PageContainer } from '../../components/layout/PageContainer';
import { useNotificationPreferences } from '../../hooks/notifications/useNotificationPreferences';
import { Loader2, Bell, Mail, ShieldAlert, Leaf, UploadCloud, CheckCircle2 } from 'lucide-react';
import { PermissionGate } from '../../components/security/PermissionGate';

const PreferenceRow = ({ icon, label, description, field, inApp, email, handleToggle, isUpdating }: { 
    icon: React.ReactNode, 
    label: string, 
    description: string, 
    field: string,
    inApp: Record<string, boolean>,
    email: Record<string, boolean>,
    handleToggle: (channel: 'inApp' | 'email', field: string) => void,
    isUpdating: boolean
}) => (
    <div className="flex items-start sm:items-center justify-between py-5 border-b border-gray-100 last:border-0 gap-4 flex-col sm:flex-row">
        <div className="flex items-start gap-3">
            <div className="p-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-6 shrink-0 ml-11 sm:ml-0">
            <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary transition-all cursor-pointer disabled:opacity-50"
                    checked={inApp[field]}
                    onChange={() => handleToggle('inApp', field)}
                    disabled={isUpdating}
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">In-App</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary transition-all cursor-pointer disabled:opacity-50"
                    checked={email[field]}
                    onChange={() => handleToggle('email', field)}
                    disabled={isUpdating}
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Email</span>
            </label>
        </div>
    </div>
);

export const NotificationPreferencesPage = () => {
    const { data: preferences, isLoading, isUpdating, updatePreferences } = useNotificationPreferences();

    if (isLoading || !preferences) {
        return (
            <PageContainer title="Configuración de Notificaciones" description="Administre cómo y cuándo recibe alertas de Eficenza 360.">
                <div className="flex items-center justify-center p-24">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                </div>
            </PageContainer>
        );
    }

    const { inApp, email } = preferences;

    const handleToggle = (channel: 'inApp' | 'email', field: string) => {
        const currentData = preferences[channel] as Record<string, boolean>;
        const payload = {
            [channel]: {
                ...currentData,
                [field]: !currentData[field]
            }
        };
        updatePreferences(payload);
    };

    return (
        <PageContainer 
            title="Centro de Preferencias" 
            description="Administre cómo interactúa el sistema SaaS con sus operadores."
        >
            <PermissionGate permission="notification.manage" fallback={
                 <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-xl bg-gray-50">
                    No tiene permisos para modificar la configuración de notificaciones del tenant.
                 </div>
            }>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100 max-w-4xl">
                    <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Reglas de Envío Domiciliario</h3>
                            <p className="text-sm text-gray-500">Configure los canales de distribución para cada tipo de evento de negocio.</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 text-sm font-semibold text-gray-500 hidden sm:flex">
                            <div className="flex items-center gap-1.5 w-20 justify-end"><Bell size={16}/> In-App</div>
                            <div className="flex items-center gap-1.5 w-20 justify-end"><Mail size={16}/> Email</div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-4">Eventos ESG & Auditorías</h4>
                            <PreferenceRow 
                                field="auditValidated" 
                                label="Validación de Auditoría" 
                                description="Avisos sobre el cambio de estado de Auditorías Energéticas."
                                icon={<CheckCircle2 size={18} />}
                                inApp={inApp}
                                email={email}
                                handleToggle={handleToggle}
                                isUpdating={isUpdating}
                            />
                            <PreferenceRow 
                                field="carbonReport" 
                                label="Huella de Carbono Lista" 
                                description="Alertas cuando los cálculos masivos de CO2 han finalizado."
                                icon={<Leaf size={18} />}
                                inApp={inApp}
                                email={email}
                                handleToggle={handleToggle}
                                isUpdating={isUpdating}
                            />
                            <PreferenceRow 
                                field="documentUploaded" 
                                label="Ingesta de Evidencia" 
                                description="Alertas sobre nuevas subidas de documentos en su Tenant."
                                icon={<UploadCloud size={18} />}
                                inApp={inApp}
                                email={email}
                                handleToggle={handleToggle}
                                isUpdating={isUpdating}
                            />
                        </div>

                        <div className="space-y-1 mt-8">
                            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Seguridad & Sistema</h4>
                            <PreferenceRow 
                                field="systemAlerts" 
                                label="Alertas de Sistema y Workers" 
                                description="Advertencias sobre uso concurrente (OCC), latencia, o fallos."
                                icon={<ShieldAlert size={18} />}
                                inApp={inApp}
                                email={email}
                                handleToggle={handleToggle}
                                isUpdating={isUpdating}
                            />
                        </div>
                    </div>
                </div>
            </PermissionGate>
        </PageContainer>
    );
};
