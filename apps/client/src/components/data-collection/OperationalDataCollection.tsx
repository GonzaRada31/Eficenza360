/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import type { Subtask, SubtaskData } from '../../types/project';
import { BaseDataCollectionGrid, type GridColumn } from './BaseDataCollectionGrid';

interface OperationalDataCollectionProps {
    subtask: Subtask;
    onUpdateData: (id: string, data: SubtaskData) => void;
}

export const OperationalDataCollection: React.FC<OperationalDataCollectionProps> = ({ subtask, onUpdateData }) => {
    // We store the text in subtask.data.text
    // We store the grid rows in subtask.data.rows
    const [textValue, setTextValue] = useState(subtask.data?.text || '');
    const rows = (subtask.data?.rows as any[]) || [];

    const handleTextChange = (newText: string) => {
        setTextValue(newText);
        // Debounce actual update is ideal, but for now simple 
        // We can simulate debounce or rely on blur, but let's just update parent for simplicity if not heavy
        // Actually this will re-render parent often.
        // Let's us use timeout
        const timeoutId = setTimeout(() => {
             onUpdateData(subtask.id, {
                ...subtask.data,
                text: newText,
                rows // preserve rows
            });
        }, 1000);
        return () => clearTimeout(timeoutId);
    };

    const handleRowsChange = (newRows: any[]) => {
        onUpdateData(subtask.id, {
            ...subtask.data,
            rows: newRows
        });
    };

    const columns: GridColumn[] = [
        { key: 'variable', label: 'Variable Operativa', type: 'text' }, // Producción, Horas, etc.
        { key: 'period', label: 'Periodo', type: 'text' },
        { key: 'value', label: 'Valor', type: 'number', width: '100px' },
        { key: 'unit', label: 'Unidad', type: 'text', width: '80px' },
        { key: 'obs', label: 'Observaciones', type: 'text' }
    ];

    return (
        <div className="space-y-6 mt-2">
            {/* Text Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Resumen Operativo</h3>
                <p className="text-xs text-gray-500 mb-2">Describa horarios, turnos, capacidad instalada y estacionalidad.</p>
                <textarea 
                    className="w-full h-32 p-3 border border-gray-200 rounded text-sm focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="Escriba aquí los detalles operativos..."
                    value={textValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                />
            </div>

            {/* Grid Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Variables Operativas (KPIs)</h3>
                <BaseDataCollectionGrid
                    subtaskId={subtask.id}
                    columns={columns}
                    rows={rows}
                    onRowsChange={handleRowsChange}
                    totals={[]}
                    enableRowAttachments={false} // Less likely needed for operational KPIs rows
                    enableGlobalAttachments={true}
                    onAttachFile={(_rowId: string | null, _file: File) => Promise.resolve({} as any)} 
                />
            </div>
        </div>
    );
};

