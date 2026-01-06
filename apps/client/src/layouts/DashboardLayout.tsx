import React from 'react';
import { useAuth } from '../context/auth.context';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, CheckSquare, Zap, Leaf, Building2, FolderOpen } from 'lucide-react';

export const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1a1a1a] text-gray-300 hidden md:flex flex-col border-r border-gray-800">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                        <Leaf className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Eficenza
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('/')} />
                    <NavItem to="/companies" icon={<Building2 size={20} />} label="Empresas" active={isActive('/companies')} />
                    <NavItem to="/projects" icon={<FolderOpen size={20} />} label="Proyectos" active={isActive('/projects')} />
                    <NavItem to="/reports" icon={<FileText size={20} />} label="Reportes" active={isActive('/reports')} />
                    <div className="pt-4 pb-2">
                        <hr className="border-gray-800" />
                    </div>
                    <NavItem to="/settings" icon={<CheckSquare size={20} />} label="Configuración" active={isActive('/settings')} />
                    <NavItem to="/admin" icon={<Zap size={20} />} label="Administración" active={isActive('/admin')} />
                </nav>

                <div className="p-4 border-t border-gray-800 bg-[#141414]">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-xs ring-2 ring-brand-primary/20">
                            {user?.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.email}
                            </p>
                            <p className="text-xs text-brand-primary truncate capitalize">
                                {user?.role.toLowerCase()}
                            </p>
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-white transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label, active = false }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
            ? 'bg-brand-dark/20 text-brand-primary border-l-2 border-brand-primary'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18, className: active ? 'text-brand-primary' : 'text-gray-500 group-hover:text-white transition-colors' })}
        {label}
    </Link>
);
