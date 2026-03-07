/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import React from 'react';
import type { Subtask, SubtaskData } from '../../types/project';
import { BaseDataCollectionGrid, type GridColumn } from './BaseDataCollectionGrid';

interface MeasurementsCollectionProps {
    subtask: Subtask;
    onUpdateData: (id: string, data: SubtaskData) => void;
}

export const MeasurementsCollection: React.FC<MeasurementsCollectionProps> = ({ subtask, onUpdateData }) => {
    const rows = (subtask.data?.rows as any[]) || [];

    const handleRowsChange = (newRows: any[]) => {
        onUpdateData(subtask.id, {
            ...subtask.data,
            rows: newRows
        });
    };

    const columns: GridColumn[] = [
        { key: 'date', label: 'Fecha', type: 'date', width: '120px' },
        { key: 'point', label: 'Punta de Medición', type: 'text' },
        { key: 'parameter', label: 'Parámetro', type: 'text' }, // e.g. Temp, Press, kW
        { key: 'value', label: 'Valor', type: 'number', width: '100px' },
        { key: 'unit', label: 'Unidad', type: 'text', width: '80px' },
        { key: 'instrument', label: 'Instrumento', type: 'text' },
        { key: 'responsible', label: 'Responsable', type: 'text' },
        { key: 'obs', label: 'Observaciones', type: 'text' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-2 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Mediciones en Sitio</h3>
            <BaseDataCollectionGrid
                subtaskId={subtask.id}
                columns={columns}
                rows={rows}
                onRowsChange={handleRowsChange}
                totals={[]}
                enableRowAttachments={true} // "Adjuntar imagen"
                enableGlobalAttachments={true} // "Informe técnico"
                onAttachFile={(_rowId: string | null, _file: File) => Promise.resolve({} as any)} 
            />
        </div>
    );
};

