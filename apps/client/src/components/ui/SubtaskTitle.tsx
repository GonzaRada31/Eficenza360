import React from 'react';

interface SubtaskTitleProps {
    title: string;
    isCompleted?: boolean;
    className?: string;
}

export const SubtaskTitle: React.FC<SubtaskTitleProps> = ({ title, isCompleted, className = '' }) => {
    return (
        <span 
            className={`text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'} ${className}`}
        >
            {title}
        </span>
    );
};
