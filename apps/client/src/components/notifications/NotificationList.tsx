import React from 'react';
import { useNotifications } from '../../hooks/notifications/useNotifications';
import { useMarkNotificationRead } from '../../hooks/notifications/useMarkNotificationRead';
import { NotificationItem } from './NotificationItem';
import { Loader2, BellOff } from 'lucide-react';
import { PermissionGate } from '../security/PermissionGate';

interface NotificationListProps {
    filter: 'ALL' | 'UNREAD';
    onClosePanel: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ filter, onClosePanel }) => {
    const { data: notifications, isLoading, error } = useNotifications();
    const { mutate: markRead } = useMarkNotificationRead();

    const filteredNotifications = React.useMemo(() => {
        if (!notifications) return [];
        if (filter === 'UNREAD') return notifications.filter(n => n.status === 'UNREAD');
        return notifications;
    }, [notifications, filter]);

    return (
        <PermissionGate permission="notification.read" fallback={
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 h-64">
                <BellOff size={32} className="mb-4 text-gray-300" />
                <p className="text-sm">No tiene permisos para ver notificaciones.</p>
            </div>
        }>
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-primary" size={24} />
                    </div>
                )}

                {!isLoading && error && (
                    <div className="p-4 text-center text-red-500 text-sm">
                        Error al cargar las notificaciones.
                    </div>
                )}

                {!isLoading && !error && filteredNotifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                        <BellOff size={32} className="mb-4 text-gray-300" />
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Cero notificaciones</h4>
                        <p className="text-xs text-gray-500">
                            {filter === 'UNREAD' ? 'No tiene notificaciones nuevas.' : 'El historial está limpio.'}
                        </p>
                    </div>
                )}

                {filteredNotifications.map((notif) => (
                    <NotificationItem 
                        key={notif.id}
                        notification={notif}
                        onMarkRead={(id) => markRead({ id })}
                        onClosePanel={onClosePanel}
                    />
                ))}
            </div>
        </PermissionGate>
    );
};
