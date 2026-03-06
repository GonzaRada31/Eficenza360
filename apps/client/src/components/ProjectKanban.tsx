
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import type { ProjectModule, Task as ProjectTask } from '../types/project';

interface KanbanTask extends ProjectTask {
    moduleId: string;
}

interface ProjectKanbanProps {
    modules: ProjectModule[];
    onTaskStatusUpdate: (taskId: string, newStatus: string) => void;
}

export const ProjectKanban: React.FC<ProjectKanbanProps> = ({ modules, onTaskStatusUpdate }) => {
    // 1. Flatten tasks from all modules
    const [tasks, setTasks] = useState<KanbanTask[]>([]);
    
    useEffect(() => {
        const allTasks: KanbanTask[] = [];
        modules.forEach(m => {
            if (m.tasks) {
                m.tasks.forEach((t) => {
                    allTasks.push({ ...t, moduleId: m.id });
                });
            }
        });
        // eslint-disable-next-line
        setTasks(allTasks);
    }, [modules]);

    // 2. Group by status
    const columns = {
        'PENDING': { title: 'Pendiente', id: 'PENDING', color: 'bg-gray-100 border-gray-200' },
        'IN_PROGRESS': { title: 'En Progreso', id: 'IN_PROGRESS', color: 'bg-blue-50 border-blue-200' },
        'COMPLETE': { title: 'Completado', id: 'COMPLETE', color: 'bg-green-50 border-green-200' }
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;
        
        // Optimistic UI Update
        const updatedTasks = tasks.map(t => 
            t.id === draggableId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        // Call API
        onTaskStatusUpdate(draggableId, newStatus);
    };

    return (
        <div className="h-[calc(100vh-250px)] overflow-hidden">
             <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-6 p-4 overflow-x-auto">
                    {Object.values(columns).map((column) => (
                        <div key={column.id} className={`flex flex-col w-80 min-w-80 rounded-xl border ${column.color} backdrop-blur-sm bg-opacity-70 h-full`}>
                            <div className="p-4 border-b border-gray-200/50 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
                                <h3 className="font-bold text-gray-700">{column.title}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 shadow-sm">
                                    {tasks.filter(t => t.status === column.id).length}
                                </span>
                            </div>
                            
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                                    >
                                        {tasks.filter(t => t.status === column.id).map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-all
                                                            ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 z-50 ring-2 ring-brand-primary/20' : ''}
                                                        `}
                                                        style={provided.draggableProps.style}
                                                    >
                                                        <div className="text-xs text-brand-primary font-medium mb-1">
                                                            {modules.find(m => m.id === task.moduleId)?.name}
                                                        </div>
                                                        <h4 className="font-semibold text-gray-800 text-sm mb-2">{task.title}</h4>
                                                        
                                                        {task.endDate && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                                {new Date(task.endDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
             </DragDropContext>
        </div>
    );
};
