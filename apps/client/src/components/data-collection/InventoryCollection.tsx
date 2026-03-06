import React from 'react';
import type { Subtask, SubtaskData } from '../../types/project';
import { BaseDataCollectionGrid, type GridColumn } from './BaseDataCollectionGrid';

interface InventoryCollectionProps {
    subtask: Subtask;
    onUpdateData: (id: string, data: SubtaskData) => void;
}

export const InventoryCollection: React.FC<InventoryCollectionProps> = ({ subtask, onUpdateData }) => {
    const rows = (subtask.data?.rows as any[]) || [];

    const handleRowsChange = (newRows: any[]) => {
        onUpdateData(subtask.id, {
            ...subtask.data,
            rows: newRows
        });
    };

    const columns: GridColumn[] = [
        { key: 'area', label: 'Área / Sector', type: 'text' },
        { key: 'equipment', label: 'Equipo / Sistema', type: 'text' },
        { 
            key: 'type', 
            label: 'Tipo', 
            type: 'select', 
            options: ['Motor', 'Caldera', 'Iluminación', 'HVAC', 'Compresor', 'Horno', 'Otro'] 
        },
        { key: 'power', label: 'Potencia (kW)', type: 'number', width: '100px' },
        { key: 'hours', label: 'Horas/Año', type: 'number', width: '100px' },
        { key: 'consumption', label: 'Consumo (kWh)', type: 'number', width: '110px' }, // Could be auto-calculated? Or manual? User said "Consumo estimado anual". Simple multiplication Power * Hours * LoadFactor? Too complex for generic. Keep manual or simple logic. Let's keep manual input for now as Load Factor is missing.
        { key: 'status', label: 'Estado', type: 'select', options: ['Operativo', 'Fuera de Servicio', 'Mantenimiento'], width: '110px' },
        { key: 'obs', label: 'Observaciones', type: 'text' }
    ];

    const totals = [
        { key: 'power', label: 'Potencia Total', format: 'number' as const },
        { key: 'consumption', label: 'Consumo Total', format: 'number' as const }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-2 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Inventario de Equipos (USENs)</h3>
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
        </div>
    );
};
