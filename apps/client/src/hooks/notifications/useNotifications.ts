import { useQuery } from '@tanstack/react-query';
import type { AppNotification } from './types';

// Mock data generator for B2B UI Development
const generateMockNotifications = (): AppNotification[] => [
    {
        id: 'notif-1',
        title: 'Auditoría Energética Validada',
        message: 'La auditoría de la planta industrial Pilar ha sido validada por el revisor técnico.',
        type: 'AUDIT_VALIDATED',
        status: 'UNREAD',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        link: '/dashboard/audits/audit-123'
    },
    {
        id: 'notif-2',
        title: 'Cálculo de Huella de Carbono Completo',
        message: 'El procesamiento masivo del outbox event ha finalizado. Módulo Carbono actualizado.',
        type: 'CARBON_CALCULATED',
        status: 'UNREAD',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        link: '/dashboard/carbon'
    },
    {
        id: 'notif-3',
        title: 'Alerta de Sistema (Stress Test)',
        message: 'Se detectó latencia alta en Redis durante la ejecución de los Relay Workers.',
        type: 'SYSTEM_ALERT',
        status: 'READ',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
        id: 'notif-4',
        title: 'Reporte ESG Generado',
        message: 'El reporte consolidado de sustentabilidad Q3 está listo para descargar.',
        type: 'REPORT_GENERATED',
        status: 'READ',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        link: '/dashboard/reports'
    }
];

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: async () => {
            // const response = await api.get('/notifications');
            // return response.data as AppNotification[];
            return new Promise<AppNotification[]>(resolve => {
                setTimeout(() => resolve(generateMockNotifications()), 800);
            });
        }
    });
};
