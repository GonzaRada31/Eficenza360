import React from 'react';
import { Plus } from 'lucide-react';

interface AttachmentButtonProps {
    onClick: () => void;
    label?: string;
    disabled?: boolean;
}

export const AttachmentButton: React.FC<AttachmentButtonProps> = ({ onClick, label = 'Agregar documentación', disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Plus size={16} />
            {label}
        </button>
    );
};
