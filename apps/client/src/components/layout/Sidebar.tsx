import React from 'react';
import { 
    LayoutDashboard, 
    FileText, 
    CheckSquare, 
    Zap, 
    Building2, 
    FolderOpen,
    Leaf,
    ShieldAlert,
    ActivitySquare
} from 'lucide-react';
import logoEficenza from '../../assets/logo-eficenza.png';
import { SidebarItem } from './SidebarItem';
import { PermissionGate } from '../security/PermissionGate';
import { RoleGate } from '../security/RoleGate';

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-[#1a1a1a] text-gray-300 hidden md:flex flex-col border-r border-gray-800 shrink-0">
            <div className="p-6 flex items-center justify-center">
                <img 
                    src={logoEficenza} 
                    alt="Eficenza 360" 
                    className="h-14 w-auto object-contain" 
                />
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                <SidebarItem to="/" icon={<LayoutDashboard />} label="Dashboard" />
                
                {/* Core Modules (Restricted mostly by permissions) */}
                <PermissionGate permission="audit.read">
                    <SidebarItem to="/audits" icon={<Zap />} label="Auditorías Energéticas" />
                </PermissionGate>

                <PermissionGate permission="carbon.read">
                    <SidebarItem to="/carbon" icon={<Leaf />} label="Huella de Carbono" />
                </PermissionGate>

                <PermissionGate permission="document.read">
                    <SidebarItem to="/documents" icon={<FolderOpen />} label="Centro de Documentos" />
                </PermissionGate>

                {/* Admin Sec */}
                <PermissionGate permission="audit.read">
                    <SidebarItem
                        to="/dashboard/admin/audit-logs"
                        icon={<ShieldAlert size={20} />}
                        label="Registro Forense"
                    />
                    <SidebarItem
                        to="/dashboard/admin/observability"
                        icon={<ActivitySquare size={20} />}
                        label="Monitor & SLA"
                    />
                </PermissionGate>

                <PermissionGate permission="report.read">
                    <SidebarItem to="/reports" icon={<FileText />} label="Reportes ESG" />
                </PermissionGate>

                <div className="pt-4 pb-2">
                    <hr className="border-gray-800" />
                </div>

                {/* Legacy / Admin Routes */}
                <RoleGate anyRole={['SUPER_ADMIN', 'ADMIN']}>
                    <SidebarItem to="/companies" icon={<Building2 />} label="Empresas (Tenants)" />
                </RoleGate>
                
                <RoleGate anyRole={['SUPER_ADMIN', 'ADMIN']}>
                    <SidebarItem to="/settings" icon={<CheckSquare />} label="Configuración" />
                </RoleGate>
            </nav>

            <div className="p-4 border-t border-gray-800 bg-[#141414]">
                 <div className="text-[10px] text-gray-500 text-center leading-tight px-1">
                    EFICENZA 360 - Medir - Reducir - Invertir - Compensar
                </div>
            </div>
        </aside>
    );
};
