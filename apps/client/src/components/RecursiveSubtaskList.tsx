import React from 'react';
import type { Subtask, SubtaskData } from '../types/project';
import { UniversalSubtask } from './UniversalSubtask';

interface RecursiveSubtaskListProps {
    subtasks: Subtask[];
    onToggle: (id: string, isCompleted: boolean) => void;
    onAddSubtask: (parentId: string) => void;
    onUpdateData?: (id: string, data: SubtaskData) => void;
    onToggleActive?: (id: string, isActive: boolean) => void;
    sharedDataMap?: Record<string, Subtask[]>;
    level?: number;
}

export const RecursiveSubtaskList: React.FC<RecursiveSubtaskListProps> = ({ 
    subtasks, 
    onToggle, 
    onAddSubtask,
    onUpdateData,
    onToggleActive,
    sharedDataMap,
    level = 0
}) => {
    if (!subtasks || subtasks.length === 0) return null;

    return (
        <div className="space-y-2">
            {subtasks.map((subtask) => (
                <UniversalSubtask
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={onToggle}
                    onAddSubtask={onAddSubtask}
                    onUpdateData={onUpdateData}
                    onToggleActive={onToggleActive}
                    sharedDataMap={sharedDataMap}
                    level={level}
                >
                    {subtask.childSubtasks && (
                         <RecursiveSubtaskList 
                            subtasks={subtask.childSubtasks} 
                            onToggle={onToggle} 
                            onAddSubtask={onAddSubtask} 
                            onUpdateData={onUpdateData}
                            onToggleActive={onToggleActive}
                            sharedDataMap={sharedDataMap}
                            level={level + 1}
                        />
                    )}
                </UniversalSubtask>
            ))}
        </div>
    );
};
