import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { TenantSwitcher } from './TenantSwitcher';
import { NotificationBell } from '../notifications/NotificationBell';

export const Topbar = () => {
    const { logout, user } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
            {/* Left side / Breadcrumbs or Tenant Switcher */}
            <div className="flex items-center gap-4">
                <TenantSwitcher />
            </div>

            {/* Right side / User actions */}
            <div className="flex items-center gap-4">
                <NotificationBell />

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 leading-none">{user?.email}</p>
                        <p className="text-xs text-brand-primary mt-1 capitalize leading-none">{user?.role?.toLowerCase()}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-sm ring-2 ring-brand-primary/20">
                        {user?.email[0].toUpperCase()}
                    </div>
                    
                    <button 
                        onClick={logout} 
                        className="p-2 ml-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 group"
                        title="Cerrar sesión"
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform"/>
                    </button>
                </div>
            </div>
        </header>
    );
};
