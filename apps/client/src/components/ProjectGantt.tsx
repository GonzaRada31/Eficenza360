
import React from 'react';
import { Gantt, type Task as GanttTask, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import type { ProjectModule } from '../types/project';


interface ProjectGanttProps {
    modules: ProjectModule[];
    onTaskUpdate: (taskId: string, start: Date, end: Date) => void;
}

export const ProjectGantt: React.FC<ProjectGanttProps> = ({ modules, onTaskUpdate }) => {
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Month);

    // Transform Project Modules/Tasks to Gantt Tasks
    const tasks: GanttTask[] = [];

    modules.forEach(module => {
        // Module as a "Project" (Group) in Gantt
        const moduleTasks = module.tasks || [];
        
        if (moduleTasks.length > 0) {
            // Find min start and max end from children to set group dates properly
            let minStart = new Date(8640000000000000);
            let maxEnd = new Date(-8640000000000000);

            moduleTasks.forEach((t) => {
                const s = t.startDate ? new Date(t.startDate) : new Date();
                const e = t.endDate ? new Date(t.endDate) : new Date(s.getTime() + (24 * 60 * 60 * 1000));
                if (s < minStart) minStart = s;
                if (e > maxEnd) maxEnd = e;
            });

            // If no tasks with dates, fallback to now
            if (minStart.getTime() === 8640000000000000) minStart = new Date();
            if (maxEnd.getTime() === -8640000000000000) maxEnd = new Date(minStart.getTime() + (24 * 60 * 60 * 1000));

             tasks.push({
                start: minStart,
                end: maxEnd,
                name: module.name,
                id: `module-${module.id}`,
                type: 'project',
                progress: 0,
                isDisabled: true,
                hideChildren: false,
                styles: { backgroundColor: '#f3f4f6', progressColor: 'transparent', backgroundSelectedColor: '#e5e7eb' }
             });

             moduleTasks.forEach((task) => {
                const startDate = task.startDate ? new Date(task.startDate) : new Date();
                const endDate = task.endDate ? new Date(task.endDate) : new Date(startDate.getTime() + (24 * 60 * 60 * 1000));

                tasks.push({
                    start: startDate,
                    end: endDate,
                    name: task.title,
                    id: task.id,
                    project: `module-${module.id}`,
                    type: 'task',
                    progress: task.status === 'COMPLETE' ? 100 : (task.status === 'IN_PROGRESS' ? 50 : 0),
                    isDisabled: false,
                    styles: { progressColor: '#16a34a', progressSelectedColor: '#15803d', backgroundColor: '#dcfce7' }
                });
             });
        }
    });

    const handleTaskChange = (task: GanttTask) => {
        onTaskUpdate(task.id, task.start, task.end);
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">No hay tareas programadas para visualizar en el cronograma.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                <span className="text-sm font-medium text-gray-500 mr-2 flex items-center">Vista:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode(ViewMode.Day)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === ViewMode.Day ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Día
                    </button>
                    <button 
                        onClick={() => setViewMode(ViewMode.Week)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === ViewMode.Week ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Semana
                    </button>
                    <button 
                        onClick={() => setViewMode(ViewMode.Month)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === ViewMode.Month ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Mes
                    </button>
                </div>
            </div>

            <div className="h-[600px] overflow-auto">
                 <Gantt
                    tasks={tasks}
                    viewMode={viewMode}
                    locale="es"
                    onDateChange={handleTaskChange}
                    listCellWidth="350px"
                    columnWidth={viewMode === ViewMode.Month ? 60 : (viewMode === ViewMode.Week ? 150 : 60)}
                    headerHeight={60}
                    rowHeight={60}
                    barFill={70}
                    barCornerRadius={6}
                    fontFamily="Inter, sans-serif"
                    TaskListHeader={({ headerHeight }) => (
                        <div style={{ height: headerHeight }} className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 bg-gray-50">
                            <div className="flex-1 pl-4" style={{ minWidth: '350px' }}>Tarea</div>
                            <div className="w-[120px] text-center border-l border-gray-100">Desde</div>
                            <div className="w-[120px] text-center border-l border-gray-100">Hasta</div>
                        </div>
                    )}
                    TaskListTable={(props) => (
                        <div className="border-r border-gray-200 bg-white">
                            {props.tasks.map((t) => (
                                <div 
                                    key={t.id} 
                                    style={{ height: props.rowHeight }} 
                                    className={`flex items-center text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${t.type === 'project' ? 'bg-gray-50 font-semibold text-gray-900 sticky top-0 z-10' : 'text-gray-600'}`}
                                >
                                    <div className="flex-1 pl-4 truncate pr-2" title={t.name} style={{ minWidth: '350px' }}>
                                        {t.type === 'project' ? '' : <span className="inline-block w-2 h-2 rounded-full bg-brand-primary mr-2"></span>}
                                        {t.name}
                                    </div>
                                    <div className="w-[120px] text-center text-xs text-gray-500 border-l border-gray-100 font-mono">
                                        {t.start.toLocaleDateString()}
                                    </div>
                                    <div className="w-[120px] text-center text-xs text-gray-500 border-l border-gray-100 font-mono">
                                        {t.end.toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                />
            </div>
        </div>
    );
};
