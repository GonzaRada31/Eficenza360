import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building, Ruler, Calendar, Save } from 'lucide-react';

const inventorySchema = z.object({
  baseYear: z.number().min(2000).max(2100),
  area: z.number().min(1, 'Area must be positive'),
  buildingType: z.string().min(1, 'Building type is required'),
  historicalYears: z.number().min(1).max(10),
});

type InventoryData = z.infer<typeof inventorySchema>;

interface InventorySetupProps {
  onSave: (data: InventoryData) => void;
  initialData?: InventoryData;
}

export const InventorySetup: React.FC<InventorySetupProps> = ({ onSave, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: initialData || {
      baseYear: new Date().getFullYear() - 1,
      historicalYears: 3
    }
  });

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Definición del Inventario</h2>
        <p className="text-sm text-gray-500 mt-1">
          Define los límites organizacionales y el año base para el cálculo de Huella de Carbono.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Año Base</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="number"
                        {...register('baseYear', { valueAsNumber: true })}
                        className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5 border"
                    />
                </div>
                {errors.baseYear && <p className="text-red-500 text-xs mt-1">{errors.baseYear.message}</p>}
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Años Históricos</label>
                <input
                    type="number"
                    {...register('historicalYears', { valueAsNumber: true })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5 border"
                />
                <p className="text-xs text-gray-500 mt-1">Para comparación retrospectiva</p>
                {errors.historicalYears && <p className="text-red-500 text-xs mt-1">{errors.historicalYears.message}</p>}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Instalación</label>
            <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                 <select
                    {...register('buildingType')}
                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5 border bg-white"
                >
                    <option value="">Seleccionar tipo...</option>
                    <option value="office">Oficina Corporativa</option>
                    <option value="industrial">Planta Industrial</option>
                    <option value="warehouse">Centro Logístico</option>
                    <option value="commercial">Local Comercial</option>
                </select>
            </div>
            {errors.buildingType && <p className="text-red-500 text-xs mt-1">{errors.buildingType.message}</p>}
        </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Superficie Total (m²)</label>
            <div className="relative">
                <Ruler className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                    type="number" step="0.01"
                    {...register('area', { valueAsNumber: true })}
                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5 border"
                    placeholder="e.j. 1500"
                />
            </div>
             {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
        </div>

        <div className="pt-4 flex justify-end">
            <button
                type="submit"
                className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors"
            >
                Guardar Configuración
                <Save className="w-4 h-4 ml-2" />
            </button>
        </div>
      </form>
    </div>
  );
};
