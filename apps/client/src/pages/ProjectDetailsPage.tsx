import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
    Building2, MapPin,
    CheckCircle2, Clock,
    Plus, MoreHorizontal, ChevronRight,
    Layout, FileText, ShieldCheck, ChevronDown, ChevronUp, Edit2
} from 'lucide-react';
import Swal from 'sweetalert2';
interface Subtask {
    id: string;
    title?: string;
    description: string;
    isCompleted: boolean;
    type?: string;
    data?: any;
    evidenceUrl?: string;
}

interface Task {
    id: string;
    title: string;
    status: string;
    type: string;
    createdAt: string;
    subtasks: Subtask[];
}

// ... existing Project interface ...
interface Project {
    id: string;
    name: string;
    status: string;
    description?: string;
    standard?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    company: {
        name: string;
    };
    modules: ProjectModule[];
    stats: {
        progress: number;
        totalTasks: number;
        completedTasks: number;
        nextTask?: Task;
    };
}

interface ProjectModule {
    id: string;
    name: string;
    description?: string;
    tasks: Task[];
}


export const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    // Task/Subtask Expansion State
    const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

    const toggleTask = (taskId: string) => {
        setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data);
        } catch (error) {
            console.error('Error fetching project details:', error);
            Swal.fire('Error', 'No se pudo cargar el proyecto', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Module Management (Keep existing) ---
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [moduleFormData, setModuleFormData] = useState({ name: '', description: '' });
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

    const PREDEFINED_MODULES = [
        { name: 'Auditoría Energética', description: 'Evaluación ISO 50001 y eficiencia energética' },
        { name: 'Huella de Carbono', description: 'Cálculo de emisiones Scope 1, 2 y 3' },
        { name: 'ESG / Empresas B', description: 'Checklist de impacto social y gobernanza' },
        { name: 'Plan EFICENZA 360', description: 'Plan integral de transformación sostenible' },
        { name: 'REPORTES', description: 'Generación y gestión de informes técnicos' },
    ];

    const handleOpenModuleModal = (module?: ProjectModule) => {
        if (module) {
            setEditingModuleId(module.id);
            setModuleFormData({ name: module.name, description: module.description || '' });
        } else {
            setEditingModuleId(null);
            setModuleFormData({ name: '', description: '' });
        }
        setShowModuleModal(true);
    };

    const handleSelectPredefinedModule = (moduleName: string, description: string) => {
        setModuleFormData({ name: moduleName, description });
    };

    const handleModuleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingModuleId) {
                await api.patch(`/projects/${id}/modules/${editingModuleId}`, moduleFormData);
                Swal.fire({ icon: 'success', title: 'Módulo actualizado', showConfirmButton: false, timer: 1500 });
            } else {
                await api.post(`/projects/${id}/modules`, moduleFormData);
                Swal.fire({ icon: 'success', title: 'Módulo creado', showConfirmButton: false, timer: 1500 });
            }
            setShowModuleModal(false);
            fetchProjectDetails();
        } catch (error) {
            console.error('Error saving module:', error);
            Swal.fire('Error', 'Hubo un problema al guardar el módulo', 'error');
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará el módulo y todas sus tareas asociadas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/projects/${id}/modules/${moduleId}`);
                Swal.fire('Eliminado!', 'El módulo ha sido eliminado.', 'success');
                fetchProjectDetails();
            } catch (error) {
                console.error('Error deleting module:', error);
                Swal.fire('Error', 'No se pudo eliminar el módulo', 'error');
            }
        }
    };


    // --- Task Management ---
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskFormData, setTaskFormData] = useState({ title: '', description: '' });
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

    const handleOpenTaskModal = (moduleId: string) => {
        setSelectedModuleId(moduleId);
        setTaskFormData({ title: '', description: '' });
        setShowTaskModal(true);
    };

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedModuleId) return;
        try {
            await api.post(`/projects/${id}/modules/${selectedModuleId}/tasks`, taskFormData);
            Swal.fire({ icon: 'success', title: 'Tarea creada', showConfirmButton: false, timer: 1500 });
            setShowTaskModal(false);
            fetchProjectDetails();
        } catch (error) {
            console.error('Error creating task:', error);
            Swal.fire('Error', 'Hubo un problema al crear la tarea', 'error');
        }
    };

    // --- Subtask Management (NEW) ---
    const [showSubtaskModal, setShowSubtaskModal] = useState(false);
    const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
    const [subtaskData, setSubtaskData] = useState<any>({});

    const handleOpenSubtaskModal = (subtask: Subtask) => {
        setSelectedSubtask(subtask);
        setSubtaskData(subtask.data || {});
        setShowSubtaskModal(true);
    };

    const handleSubtaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubtask) return;
        
        try {
            await api.patch(`/projects/${id}/subtasks/${selectedSubtask.id}`, {
                data: subtaskData
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Datos guardados',
                showConfirmButton: false,
                timer: 1500
            });
            setShowSubtaskModal(false);
            fetchProjectDetails();
        } catch (error) {
            console.error('Error updating subtask:', error);
            Swal.fire('Error', 'No se pudieron guardar los datos', 'error');
        }
    };

    const renderSubtaskFields = () => {
        if (!selectedSubtask) return null;

        switch (selectedSubtask.type) {
            case 'CONSUMPTION':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Consumo Anual (kWh/m3)</label>
                            <input type="number" className="w-full border p-2 rounded" 
                                value={subtaskData.annualConsumption || ''}
                                onChange={e => setSubtaskData({...subtaskData, annualConsumption: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Costo ($)</label>
                            <input type="number" className="w-full border p-2 rounded" 
                                value={subtaskData.cost || ''}
                                onChange={e => setSubtaskData({...subtaskData, cost: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Adjuntar Factura (PDF)</label>
                            <input type="file" accept=".pdf" className="w-full border p-2 rounded" />
                        </div>
                    </>
                );
            case 'IMPROVEMENT':
                return (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Inversión Estimada ($)</label>
                            <input type="number" className="w-full border p-2 rounded" 
                                value={subtaskData.investment || ''}
                                onChange={e => setSubtaskData({...subtaskData, investment: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ahorro Energético (kWh/año)</label>
                            <input type="number" className="w-full border p-2 rounded" 
                                value={subtaskData.energySavings || ''}
                                onChange={e => setSubtaskData({...subtaskData, energySavings: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payback (años)</label>
                            <input type="number" className="w-full border p-2 rounded" 
                                value={subtaskData.payback || ''}
                                onChange={e => setSubtaskData({...subtaskData, payback: e.target.value})} />
                        </div>
                    </>
                );
             case 'EQUIPMENT':
                return (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select className="w-full border p-2 rounded"
                                value={subtaskData.status || ''}
                                onChange={e => setSubtaskData({...subtaskData, status: e.target.value})}>
                                <option value="">Seleccionar...</option>
                                <option value="Bueno">Bueno</option>
                                <option value="Regular">Regular</option>
                                <option value="Malo">Malo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                            <textarea className="w-full border p-2 rounded" 
                                value={subtaskData.observations || ''}
                                onChange={e => setSubtaskData({...subtaskData, observations: e.target.value})} />
                        </div>
                    </>
                );
            default:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Datos Generales</label>
                        <textarea className="w-full border p-2 rounded" 
                                value={subtaskData.generalData || ''}
                                onChange={e => setSubtaskData({...subtaskData, generalData: e.target.value})} />
                    </div>
                );
        }
    };


    if (loading) return <div className="p-8 text-center text-gray-500">Cargando proyecto...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Proyecto no encontrado</div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* ... Header and Stats (Keep generic) ... */}
            <div>
                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="cursor-pointer hover:text-brand-primary" onClick={() => navigate('/projects')}>Proyectos</span>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">{project.company?.name || 'Sin Empresa'}</span>
                </div>
                <div className="flex justify-between items-start">
                    <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} />
                                {project.company?.name || 'Sin Empresa'}
                            </div>
                            {project.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    {project.location}
                                </div>
                            )}
                            {project.standard && (
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} />
                                    {project.standard}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                            <div className="text-sm text-gray-500 mb-1">Progreso General</div>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                                        style={{ width: `${project.stats.progress}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-900">{project.stats.progress}%</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border
                ${project.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                project.status === 'COMPLETE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {project.status === 'IN_PROGRESS' ? 'En Progreso' : project.status}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Módulos del Proyecto</h2>
                    <button
                        onClick={() => handleOpenModuleModal()}
                        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        Crear Módulo
                    </button>
                </div>

                <div className="space-y-4">
                    {project.modules.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                           <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                <Layout size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay módulos configurados</h3>
                            <p className="text-gray-500 mb-4">Haz clic en "Crear Módulo" para comenzar.</p>
                        </div>
                    ) : (
                        project.modules.map(module => (
                            <div key={module.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white rounded-md shadow-sm">
                                            <FileText size={18} className="text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{module.name}</h3>
                                            {module.description && <p className="text-sm text-gray-500">{module.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleOpenTaskModal(module.id)}
                                            className="text-sm text-brand-primary hover:underline font-medium"
                                        >
                                            + Tarea
                                        </button>
                                        <div className="h-4 w-px bg-gray-300"></div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleOpenModuleModal(module)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                                <MoreHorizontal size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteModule(module.id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {module.tasks && module.tasks.length > 0 ? (
                                        module.tasks.map(task => (
                                            <div key={task.id} className="bg-white">
                                                <div 
                                                    className="p-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                                                    onClick={() => toggleTask(task.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {task.subtasks && task.subtasks.length > 0 && (
                                                            <div className="text-gray-400">
                                                                {expandedTasks[task.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </div>
                                                        )}
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                            ${task.status === 'COMPLETE' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                                            {task.status === 'COMPLETE' && <CheckCircle2 size={12} />}
                                                        </div>
                                                        <span className={`text-sm font-medium ${task.status === 'COMPLETE' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {task.subtasks?.length || 0} subtareas
                                                    </div>
                                                </div>
                                                
                                                {/* Subtasks rendering */}
                                                {expandedTasks[task.id] && task.subtasks && (
                                                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 pl-12">
                                                        <ul className="space-y-2">
                                                            {task.subtasks.map(subtask => (
                                                                <li key={subtask.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-3 h-3 rounded-full border ${subtask.isCompleted ? 'bg-green-400 border-green-400' : 'border-gray-300'}`}></div>
                                                                        <span className="text-gray-600">{subtask.title || subtask.description}</span>
                                                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] rounded uppercase">{subtask.type || 'General'}</span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleOpenSubtaskModal(subtask); }}
                                                                        className="text-brand-primary hover:text-brand-dark p-1 rounded hover:bg-white"
                                                                        title="Completar datos"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-400 italic p-4 text-center">No hay tareas en este módulo.</div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Subtask Data Modal */}
            {showSubtaskModal && selectedSubtask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedSubtask.title}</h2>
                                <p className="text-sm text-gray-500">{selectedSubtask.description}</p>
                            </div>
                            <span className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded text-xs font-semibold">
                                {selectedSubtask.type}
                            </span>
                        </div>
                        
                        <form onSubmit={handleSubtaskSubmit} className="space-y-4">
                            {renderSubtaskFields()}

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSubtaskModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white rounded-lg transition-colors"
                                >
                                    Guardar Datos
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Module Modal (Existing) */}
            {showModuleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 overflow-hidden">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingModuleId ? 'Editar Módulo' : 'Agregar Módulo'}
                        </h2>

                         {!editingModuleId && (
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Módulos Recomendados
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {PREDEFINED_MODULES.map((mod) => (
                                        <button
                                            key={mod.name}
                                            type="button"
                                            onClick={() => handleSelectPredefinedModule(mod.name, mod.description)}
                                            className={`text-left p-3 rounded-lg border transition-all
                                                ${moduleFormData.name === mod.name 
                                                    ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary' 
                                                    : 'border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-medium text-gray-900 text-sm">{mod.name}</div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{mod.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleModuleSubmit} className="space-y-4 border-t border-gray-100 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Módulo</label>
                                <input
                                    type="text" required placeholder="Ej. Auditoría Inicial"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                    value={moduleFormData.name} onChange={(e) => setModuleFormData({ ...moduleFormData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                                <input
                                    type="text" placeholder="Breve descripción del alcance del módulo"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                    value={moduleFormData.description} onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white rounded-lg">{editingModuleId ? 'Guardar Cambios' : 'Crear Módulo'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Modal (Existing) */}
             {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Tarea</h2>
                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Tarea</label>
                                <input type="text" required placeholder="Ej. Recopilar facturas"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                    value={taskFormData.title} onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                                <textarea placeholder="Detalles adicionales..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none min-h-[100px]"
                                    value={taskFormData.description} onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white rounded-lg">Crear Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
