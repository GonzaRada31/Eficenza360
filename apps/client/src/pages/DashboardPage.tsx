import { useEffect, useState } from 'react';
import { useAuth } from '../context/auth.context';
import { api } from '../lib/api';
import { Activity, CheckCircle, AlertTriangle, ListFilter, ArrowRight } from 'lucide-react';

interface DashboardStats {
    activeProjects: number;
    completedProjects: number;
    pendingTasks: number;
    itemsInReview: number;
}

interface Project {
    id: string;
    name: string;
    standard: string | null;
    status: string;
}

export const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, projectsRes] = await Promise.all([
                    api.get('/projects/dashboard-stats'),
                    api.get('/projects/recent'),
                ]);
                setStats(statsRes.data);
                setProjects(projectsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-gray-500">Cargando dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-lg">
                    Bienvenido de nuevo, <span className="font-semibold text-gray-700">{user?.email}</span>.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Proyectos Activos"
                    value={stats?.activeProjects || 0}
                    description="Proyectos actualmente en desarrollo"
                    icon={<Activity className="text-gray-400" />}
                />
                <StatCard
                    title="Proyectos Completados"
                    value={stats?.completedProjects || 0}
                    description="Historial de proyectos finalizados"
                    icon={<CheckCircle className="text-gray-400" />}
                />
                <StatCard
                    title="Hallazgos Pendientes"
                    value={stats?.pendingTasks || 0}
                    description="Observaciones que requieren acción"
                    icon={<AlertTriangle className="text-gray-400" />}
                />
                <StatCard
                    title="Ítems en Revisión"
                    value={stats?.itemsInReview || 0}
                    description="Esperando aprobación"
                    icon={<ListFilter className="text-gray-400" />}
                />
            </div>

            {/* Recent Projects Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Proyectos Recientes</h2>
                    <button className="text-sm font-medium text-brand-primary flex items-center gap-1 hover:underline">
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Nombre del Proyecto</th>
                                <th className="px-6 py-4">Norma</th>
                                <th className="px-6 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {projects.length > 0 ? (
                                projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{project.standard || '-'}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={project.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                        No hay proyectos recientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, description, icon }: { title: string, value: number, description: string, icon: React.ReactNode }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-700">{title}</h3>
            {icon}
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
        COMPLETE: 'bg-green-50 text-green-700 border-green-200',
        BLOCKED: 'bg-red-50 text-red-700 border-red-200',
    };

    const labels: Record<string, string> = {
        PENDING: 'Pendiente',
        IN_PROGRESS: 'En Progreso',
        COMPLETE: 'Completado',
        BLOCKED: 'Bloqueado',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
            {labels[status] || status}
        </span>
    );
};
