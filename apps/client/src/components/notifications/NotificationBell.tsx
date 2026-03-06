import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationPanel } from './NotificationPanel';

export const NotificationBell: React.FC = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsPanelOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50 group"
                title="Centro de Notificaciones"
            >
                <Bell size={20} className="group-hover:text-brand-primary transition-colors" />
                <NotificationBadge />
            </button>

            <NotificationPanel 
                isOpen={isPanelOpen} 
                onClose={() => setIsPanelOpen(false)} 
            />
        </>
    );
};
