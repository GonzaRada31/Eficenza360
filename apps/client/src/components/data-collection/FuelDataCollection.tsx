import React, { useState } from 'react';
import type { Subtask, SubtaskData } from '../../types/project';
import { BaseDataCollectionGrid, type GridColumn } from './BaseDataCollectionGrid';

interface FuelDataCollectionProps {
    subtask: Subtask;
    onUpdateData: (id: string, data: SubtaskData) => void;
}

export const FuelDataCollection: React.FC<FuelDataCollectionProps> = ({ subtask, onUpdateData }) => {
    const [activeTab, setActiveTab] = useState('NAFTA');
    // Rows are stored in subtask.data.rows with a 'type' field
    const rows = (subtask.data?.rows as any[]) || [];
    const efData = (subtask.data?.emissionFactors as Record<string, number>) || { NAFTA: 0, GASOIL: 0 };

    const handleRowsChange = (newRowsForTab: any[], type: string) => {
        // Merge strategy: Keep rows of other types, replace rows of current type
        const otherRows = rows.filter(r => r.type !== type);
        const updatedRows = [
            ...otherRows,
            ...newRowsForTab.map(r => ({ ...r, type })) // Ensure type is set
        ];
        
        onUpdateData(subtask.id, {
            ...subtask.data,
            rows: updatedRows
        });
    };

    const handleEfChange = (val: string, type: string) => {
        const num = parseFloat(val);
        const newEf = { ...efData, [type]: isNaN(num) ? 0 : num };
        onUpdateData(subtask.id, {
            ...subtask.data,
            emissionFactors: newEf
        });
    };

    const columns: GridColumn[] = [
        { key: 'date', label: 'Fecha', type: 'date', width: '120px' },
        { key: 'provider', label: 'Proveedor', type: 'text' },
        { key: 'liters', label: 'Litros', type: 'number', width: '100px' },
        { key: 'cost', label: 'Costo ($)', type: 'cost', width: '100px' },
        { key: 'unit', label: 'Unidad', type: 'text', width: '80px' },
        { key: 'obs', label: 'Observaciones', type: 'text' }
    ];

    const totals = [
        { key: 'liters', label: 'Total Litros', format: 'number' as const },
        { key: 'cost', label: 'Costo Total', format: 'currency' as const }
    ];

    const renderTab = (type: string, title: string) => {
        const tabRows = rows.filter(r => r.type === type);
        const totalLiters = tabRows.reduce((acc, r) => acc + (parseFloat(r.liters) || 0), 0);
        const ef = efData[type] || 0;
        const tCO2e = (totalLiters * ef) / 1000;

        return (
            <div className="space-y-6">
                <BaseDataCollectionGrid
                    title={title}
                    subtaskId={subtask.id}
                    columns={columns}
                    rows={tabRows}
                    onRowsChange={(newRows) => handleRowsChange(newRows, type)}
                    totals={totals}
                    enableRowAttachments={true}
                    enableGlobalAttachments={true}
                    onAttachFile={(_rowId: string | null, _file: File) => Promise.resolve({} as any)} // Placeholder to trigger modal in Base
                />

                {/* Emission Logic */}
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                            Factor de Emisión (kg CO2e / litro):
                        </label>
                        <input 
                            type="number" 
                            step="0.001"
                            value={ef || ''}
                            onChange={(e) => handleEfChange(e.target.value, type)}
                            className="border border-blue-200 rounded px-2 py-1 text-sm w-24 text-center focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.000"
                        />
                    </div>
                    
                    <div className="text-right">
                         <div className="text-[10px] text-gray-500 uppercase font-medium">Emisiones Totales</div>
                         <div className="text-xl font-bold text-gray-800">
                             {tCO2e.toFixed(3)} <span className="text-xs font-normal text-gray-500">tCO2e</span>
                         </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-2">
            <div className="border-b border-gray-100">
                <div className="flex">
                    <button 
                        onClick={() => setActiveTab('NAFTA')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'NAFTA' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Nafta (Gasolina)
                    </button>
                    <button 
                        onClick={() => setActiveTab('GASOIL')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'GASOIL' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Gasoil (Diesel)
                    </button>
                </div>
            </div>
            
            <div className="p-4">
                {activeTab === 'NAFTA' && renderTab('NAFTA', 'Consumo de Nafta')}
                {activeTab === 'GASOIL' && renderTab('GASOIL', 'Consumo de Gasoil')}
            </div>
        </div>
    );
};
