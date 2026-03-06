
import React, { useState } from 'react';

const SCOPE_3_CATEGORIES = [
  { id: 'transport', name: 'Transporte y Distribución (Aguas Arriba)', icon: '🚚' },
  { id: 'waste', name: 'Residuos Generados en Operaciones', icon: '🗑️' },
  { id: 'travel', name: 'Viajes de Negocios', icon: '✈️' },
  { id: 'commuting', name: 'Desplazamiento de Empleados', icon: '🚗' },
  { id: 'purchased_goods', name: 'Bienes y Servicios Adquiridos', icon: '📦' },
];

export const Scope3Manager: React.FC = () => {
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (id: string) => {
        const newSet = new Set(activeCategories);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setActiveCategories(newSet);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-emerald-800">Gestión de Alcance 3 (Otras Indirectas)</h2>
            <p className="mb-6 text-gray-600">
                Seleccione las categorías relevantes para su organización según el análisis de materialidad. 
                Solo las categorías activas se incluirán en el cálculo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCOPE_3_CATEGORIES.map((cat) => (
                    <div 
                        key={cat.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            activeCategories.has(cat.id) 
                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                                : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleCategory(cat.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl" role="img" aria-label={cat.name}>{cat.icon}</span>
                                <span className="font-medium text-gray-800">{cat.name}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                activeCategories.has(cat.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                            }`}>
                                {activeCategories.has(cat.id) && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        
                        {activeCategories.has(cat.id) && (
                            <div className="mt-3 pt-3 border-t border-emerald-100 text-sm text-emerald-700">
                                <span className="flex items-center gap-2">
                                    ✅ Categoría Activa
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
                    Guardar Configuración de Alcance 3
                </button>
            </div>
        </div>
    );
};
