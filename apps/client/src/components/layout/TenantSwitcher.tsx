import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, ChevronDown, Check } from 'lucide-react';

export const TenantSwitcher = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mock data for tenants if user had multiple
    const availableTenants = [
        { id: user?.tenantId || 'tenant-1', name: 'Corporación Principal' }
    ];

    const currentTenant = availableTenants.find(t => t.id === user?.tenantId) || availableTenants[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
            >
                <div className="w-6 h-6 rounded bg-brand-dark flex items-center justify-center text-white">
                    <Building2 size={12} />
                </div>
                <div className="flex flex-col items-start px-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none">Tenant Activo</span>
                    <span className="text-sm font-medium text-gray-900 leading-tight">{currentTenant?.name}</span>
                </div>
                <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cambiar Empresa</p>
                    </div>
                    {availableTenants.map((tenant) => (
                        <button
                            key={tenant.id}
                            onClick={() => setIsOpen(false)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${currentTenant.id === tenant.id ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                    <Building2 size={14} />
                                </div>
                                <span className={`text-sm font-medium truncate ${currentTenant.id === tenant.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {tenant.name}
                                </span>
                            </div>
                            {currentTenant.id === tenant.id && (
                                <Check size={16} className="text-brand-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
