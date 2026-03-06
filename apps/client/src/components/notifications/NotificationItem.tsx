import React from 'react';
import { AppNotification } from '../../hooks/notifications/types';
import { 
    CheckCircle2, 
    Leaf, 
    UploadCloud, 
    FileText, 
    AlertTriangle,
    Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
    notification: AppNotification;
    onMarkRead: (id: string) => void;
    onClosePanel: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onClosePanel }) => {
    const isUnread = notification.status === 'UNREAD';

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'AUDIT_VALIDATED': return <div className="p-2 bg-green-100 text-green-600 rounded-full"><CheckCircle2 size={16} /></div>;
            case 'CARBON_CALCULATED': return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><Leaf size={16} /></div>;
            case 'DOCUMENT_UPLOADED': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><UploadCloud size={16} /></div>;
            case 'REPORT_GENERATED': return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><FileText size={16} /></div>;
            case 'SYSTEM_ALERT': return <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertTriangle size={16} /></div>;
            default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><CheckCircle2 size={16} /></div>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} min`;
        if (diffHours < 24) return `${diffHours} hs`;
        if (diffDays === 1) return `Ayer`;
        if (diffDays < 7) return `${diffDays} días`;
        
        return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(date);
    };

    const content = (
        <div className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 group flex items-start gap-4 relative ${isUnread ? 'bg-brand-primary/5' : 'bg-white'}`}>
            {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r"></div>
            )}
            
            <div className="shrink-0 mt-1">
                {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-medium truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-medium shrink-0">
                        {formatDate(notification.createdAt)}
                    </span>
                </div>
                <p className={`text-xs line-clamp-2 ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>
                    {notification.message}
                </p>
            </div>

            {isUnread && (
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkRead(notification.id);
                    }}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Marcar como leída"
                >
                    <Check size={16} />
                </button>
            )}
        </div>
    );

    if (notification.link) {
        return (
            <Link to={notification.link} onClick={onClosePanel} className="block">
                {content}
            </Link>
        );
    }

    return content;
};
