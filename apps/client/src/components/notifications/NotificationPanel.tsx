import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Settings } from 'lucide-react';
import { NotificationList } from './NotificationList';
import { useMarkNotificationRead } from '../../hooks/notifications/useMarkNotificationRead';
import { Link } from 'react-router-dom';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
    const { mutate: markAllRead, isPending } = useMarkNotificationRead();

    // Trap body scroll when panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
             document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute inset-y-0 right-0 w-full max-w-sm flex">
                <div className="relative w-full h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-900 leading-none">Notificaciones</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link 
                                to="/settings/notifications" 
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Configuración"
                            >
                                <Settings size={18} />
                            </Link>
                            <button 
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setFilter('ALL')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Todas
                            </button>
                            <button 
                                onClick={() => setFilter('UNREAD')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                No Leídas
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => markAllRead({ all: true })}
                            disabled={isPending}
                            className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-dark transition-colors disabled:opacity-50"
                        >
                            <CheckCircle2 size={14} />
                            Marcar leídas
                        </button>
                    </div>

                    {/* List */}
                    <NotificationList 
                        filter={filter} 
                        onClosePanel={onClose} 
                    />
                </div>
            </div>
        </div>
    );
};
