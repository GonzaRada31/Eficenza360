/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
import type { Subtask, SubtaskData } from '../../types/project';
import { BaseDataCollectionGrid, type GridColumn } from './BaseDataCollectionGrid';

interface OtherEnergyCollectionProps {
    subtask: Subtask;
    onUpdateData: (id: string, data: SubtaskData) => void;
}

export const OtherEnergyCollection: React.FC<OtherEnergyCollectionProps> = ({ subtask, onUpdateData }) => {
    const rows = (subtask.data?.rows as any[]) || [];

    const handleRowsChange = (newRows: any[]) => {
        onUpdateData(subtask.id, {
            ...subtask.data,
            rows: newRows
        });
    };

    const columns: GridColumn[] = [
        { key: 'date', label: 'Fecha', type: 'date', width: '120px' },
        { 
            key: 'type', 
            label: 'Tipo Energético', 
            type: 'text', 
            // Editable text since user wants to create new types dynamically
        },
        { key: 'unit', label: 'Unidad', type: 'text', width: '80px' },
        { key: 'qty', label: 'Cantidad', type: 'number', width: '100px' },
        { key: 'cost', label: 'Costo ($)', type: 'cost', width: '100px' },
        { key: 'emissionFactor', label: 'FE (kgCO2/un)', type: 'number', width: '100px' },
        { key: 'obs', label: 'Observaciones', type: 'text' }
    ];

    const totals = [
        { key: 'cost', label: 'Costo Total', format: 'currency' as const }
    ];

    // Calc total CO2e
    const totalCO2e = useMemo(() => {
        return rows.reduce((acc, r) => {
            const qty = parseFloat(r.qty) || 0;
            const fe = parseFloat(r.emissionFactor) || 0;
            return acc + (qty * fe);
        }, 0) / 1000; // tCO2e
    }, [rows]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-2 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Otros Energéticos</h3>
            <BaseDataCollectionGrid
                subtaskId={subtask.id}
                columns={columns}
                rows={rows}
                onRowsChange={handleRowsChange}
                totals={totals}
                enableRowAttachments={true}
                enableGlobalAttachments={true}
                onAttachFile={(_rowId: string | null, _file: File) => Promise.resolve({} as any)} 
            />
            
            <div className="mt-4 flex justify-end">
                <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">Emisiones Totales Estimadas:</span>
                    <span className="text-lg font-bold text-gray-800">{totalCO2e.toFixed(3)} tCO2e</span>
                </div>
            </div>
        </div>
    );
};

