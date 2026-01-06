import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { api } from '../lib/api';
import { Plus, Folder, Search, MoreHorizontal, Calendar, MapPin, Building2, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Project {
    id: string;
    name: string;
    standard: string | null;
    status: string;
    company: { id: string; name: string } | null;
    companyId?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    projectContact?: string;
    description?: string;
}

interface Company {
    id: string;
    name: string;
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        IN_PROGRESS: 'bg-green-100 text-green-700 border-green-200',
        PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        COMPLETE: 'bg-blue-100 text-blue-700 border-blue-200',
        ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const labels: Record<string, string> = {
        IN_PROGRESS: 'Activo',
        PENDING: 'Pendiente',
        COMPLETE: 'Completado',
        ARCHIVED: 'Archivado',
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {labels[status] || status}
        </span>
    );
};

const MySwal = withReactContent(Swal);

export const ProjectsPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form Stats
    const [formData, setFormData] = useState({
        name: '',
        companyId: '',
        standard: 'ISO 50001',
        status: 'IN_PROGRESS',
        startDate: '',
        endDate: '',
        location: '',
        projectContact: '',
        description: '',
    });

    useEffect(() => {
        fetchProjects();
        fetchCompanies();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            companyId: '',
            standard: 'ISO 50001',
            status: 'IN_PROGRESS',
            startDate: '',
            endDate: '',
            location: '',
            projectContact: '',
            description: '',
        });
        setEditingId(null);
    };

    const handleEdit = (project: Project) => {
        setFormData({
            name: project.name,
            companyId: project.company?.id || project.companyId || '',
            standard: project.standard || 'ISO 50001',
            status: project.status || 'IN_PROGRESS',
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            location: project.location || '',
            projectContact: project.projectContact || '',
            description: project.description || '',
        });
        setEditingId(project.id);
        setShowCreateModal(true);
    };

    const handleDelete = async (id: string) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción. El proyecto será eliminado permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/projects/${id}`);
                await MySwal.fire(
                    '¡Eliminado!',
                    'El proyecto ha sido eliminado.',
                    'success'
                );
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
                MySwal.fire(
                    'Error',
                    'No se pudo eliminar el proyecto.',
                    'error'
                );
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting project data:', formData);

        try {
            if (editingId) {
                await api.patch(`/projects/${editingId}`, formData);
                await MySwal.fire({
                    title: '¡Actualizado!',
                    text: 'El proyecto se ha actualizado correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await api.post('/projects', formData);
                await MySwal.fire({
                    title: '¡Éxito!',
                    text: 'El proyecto se ha creado correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#10B981',
                    timer: 2000,
                    timerProgressBar: true
                });
            }

            setShowCreateModal(false);
            resetForm();
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (error as any).response?.data?.message || 'Hubo un error al guardar el proyecto.';

            MySwal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#EF4444'
            });
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
                    <p className="text-gray-500 mt-1">Gestiona todos tus proyectos en un solo lugar.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Proyecto
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre del Proyecto</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Norma</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando proyectos...</td>
                                </tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay proyectos encontrados.</td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                                    <Folder size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 group-hover:text-brand-primary transition-colors">{project.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Building2 size={12} />
                                                        {project.company?.name || 'Sin empresa'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {project.company ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building2 size={14} className="text-gray-400" />
                                                    {project.company.name}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                {project.standard || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={project.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-gray-400">
                                                <button
                                                    onClick={() => navigate(`/projects/${project.id}`)}
                                                    title="Ver detalles"
                                                    className="hover:text-brand-primary transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(project)}
                                                    title="Editar"
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    title="Eliminar"
                                                    className="hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Crear Proyecto */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="rotate-90" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 1. Selección de Empresa */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa Cliente</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                        value={formData.companyId}
                                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Empresa...</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/companies')}
                                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200"
                                    >
                                        + Nueva
                                    </button>
                                </div>
                            </div>

                            {/* 2. Nombre del Proyecto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* 3 & 4. Contacto y Ubicación */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contacto Principal</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                        value={formData.projectContact}
                                        onChange={(e) => setFormData({ ...formData, projectContact: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 5. Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all h-24 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* 6. Fechas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin (Opcional)</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* 7 & 8. Norma y Estado */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Norma de Aplicación</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                        value={formData.standard}
                                        onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                                    >
                                        <option value="ISO 50001">ISO 50001 - Gestión de Energía</option>
                                        <option value="ISO 14064">ISO 14064 - Gases de Efecto Invernadero</option>
                                        <option value="ISO 9001">ISO 9001 - Gestión de Calidad</option>
                                        <option value="ESG / Empresas B">ESG / Empresas B</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="IN_PROGRESS">Activo</option>
                                        <option value="COMPLETE">Completado</option>
                                        <option value="ARCHIVED">Archivado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-brand-primary hover:bg-brand-dark text-white rounded-lg transition-colors font-medium shadow-sm shadow-brand-primary/30"
                                >
                                    {editingId ? 'Guardar Cambios' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
