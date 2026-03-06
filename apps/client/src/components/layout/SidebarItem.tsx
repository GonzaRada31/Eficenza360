import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, onClick }) => {
    const location = useLocation();
    const active = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                    ? 'bg-brand-dark/20 text-brand-primary border-l-2 border-brand-primary'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
        >
            {React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string }>, { 
                size: 18, 
                className: active ? 'text-brand-primary' : 'text-gray-500 group-hover:text-white transition-colors' 
            })}
            <span className="truncate">{label}</span>
        </Link>
    );
};
