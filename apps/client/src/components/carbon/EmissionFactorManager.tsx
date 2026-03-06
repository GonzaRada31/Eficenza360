
import React, { useState } from 'react';

// Mock types until we generate client or share types
interface EmissionFactor {
    id: string;
    source: string;
    type: string;
    factorValue: number;
    unitNumerator: string;
    unitDenominator: string;
    uncertainty?: number;
    region?: string;
}

export const EmissionFactorManager: React.FC = () => {
    // Mock data for immediate preview
    const [factors] = useState<EmissionFactor[]>([
        { id: '1', type: 'ELECTRICITY', source: 'CAMMESA 2024', factorValue: 0.285, unitNumerator: 'kgCO2e', unitDenominator: 'kWh', region: 'Argentina' },
        { id: '2', type: 'GAS', source: 'IPCC 2006', factorValue: 1.98, unitNumerator: 'kgCO2e', unitDenominator: 'm3', uncertainty: 5 },
    ]);
    const [loading] = useState(false);

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Factores de Emisión</h2>
                    <p className="text-gray-500 text-sm">Gestiona y audita los factores utilizados en los cálculos.</p>
                </div>
                <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                    + Nuevo Factor
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo / Servicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factor & Unidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Región</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
                        ) : factors.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {f.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="font-medium">{f.factorValue}</div>
                                    <div className="text-gray-500 text-xs">{f.unitNumerator} / {f.unitDenominator}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {f.source}
                                    {f.uncertainty && <span className="ml-2 text-xs text-orange-600">(±{f.uncertainty}%)</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {f.region || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
                ℹ️ <strong>Nota de Auditoría:</strong> Los cambios en los factores no afectarán los registros históricos ya calculados (Traceability Lock). 
                Para recalcular períodos pasados, utilice la función "Recalculate Batch".
            </div>
        </div>
    );
};
