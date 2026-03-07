import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

export const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />
                
                <main className="flex-1 overflow-auto p-4 md:p-8 relative flex flex-col">
                    <div className="flex-1">
                        <Outlet />
                    </div>
                    
                    <footer className="mt-8 pt-6 border-t border-gray-200 text-center shrink-0">
                        <p className="text-[10px] text-gray-400 max-w-4xl mx-auto leading-relaxed">
                            La plataforma EFICENZA 360 es una herramienta de apoyo técnico para la gestión de energía, huella de carbono y sostenibilidad.
                            No constituye un organismo certificador ni emite certificaciones oficiales. Los resultados obtenidos dependen de la información proporcionada
                            por el usuario y deben ser validados por organismos competentes cuando corresponda.
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
};
