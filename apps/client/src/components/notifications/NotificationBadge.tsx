import React from 'react';
import { useUnreadNotifications } from '../../hooks/notifications/useUnreadNotifications';

export const NotificationBadge: React.FC = () => {
    const { data } = useUnreadNotifications();
    const count = data?.count || 0;

    if (count === 0) return null;

    return (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center -translate-y-1/2 translate-x-1/2">
            <span className="text-[9px] font-bold text-white leading-none">
                {count > 9 ? '9+' : count}
            </span>
        </span>
    );
};
