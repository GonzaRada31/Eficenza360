import React, { useState } from 'react';
import { LayoutDashboard, Settings, Fuel, Zap, Globe, Plus, Database } from 'lucide-react';
import { CarbonDashboard } from './CarbonDashboard';
import { InventorySetup } from './InventorySetup';
import { Scope3Manager } from '../../components/carbon/Scope3Manager';
import { EmissionFactorManager } from '../../components/carbon/EmissionFactorManager';

// Placeholder for a list of ActivityData/CarbonRecords for Scope 1/2
const ScopeListView: React.FC<{ scope: 'SCOPE_1' | 'SCOPE_2' }> = ({ scope }) => {
    // Mock data
    const records = scope === 'SCOPE_1' 
        ? [{ id: '1', date: '2023-01-15', description: 'Consumo Gas Natural', val: 1500, unit: 'm3', emissions: 3.0 }] 
        : [{ id: '2', date: '2023-01-20', description: 'Factura Electricidad Edesur', val: 4500, unit: 'kWh', emissions: 1.57 }];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div>
                     <h3 className="font-bold text-gray-800">{scope === 'SCOPE_1' ? 'Emisiones Directas (Alcance 1)' : 'Emisiones Indirectas (Alcance 2)'}</h3>
                     <p className="text-sm text-gray-500">
                         {scope === 'SCOPE_1' 
                            ? 'Combustibles fósiles y fuentes móviles.' 
                            : 'Electricidad adquirida de la red.'}
                     </p>
                </div>
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Cargar Factura
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emisiones (tCO₂e)</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {records.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.val} {r.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.emissions}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Calculado
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-500">
                    Mostrando últimos registros. <span className="text-blue-600 cursor-pointer">Ver historial completo</span>
                </div>
            </div>
        </div>
    );
};

type TabId = 'dashboard' | 'inventory' | 'scope1' | 'scope2' | 'scope3' | 'factors';

export const CarbonPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <CarbonDashboard />;
            case 'inventory': return <InventorySetup onSave={() => setActiveTab('dashboard')} />;
            case 'scope1': return <ScopeListView scope="SCOPE_1" />;
            case 'scope2': return <ScopeListView scope="SCOPE_2" />;
            case 'scope3': return <Scope3Manager />;
            case 'factors': return <EmissionFactorManager />;
            default: return <CarbonDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900">Huella de Carbono</h1>
                     <p className="text-gray-500">Gestión de GEI alineada a ISO 14064</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 bg-white px-2 rounded-t-xl">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {[
                        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
                        { id: 'inventory', name: 'Inventario', icon: Settings },
                        { id: 'scope1', name: 'Alcance 1 (Directas)', icon: Fuel },
                        { id: 'scope2', name: 'Alcance 2 (Energía)', icon: Zap },
                        { id: 'scope3', name: 'Alcance 3 (Indirectas)', icon: Globe },
                        { id: 'factors', name: 'Factores de Emisión', icon: Database },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabId)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                    ${isActive 
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-6 animate-in fade-in duration-300">
                {renderContent()}
            </div>
        </div>
    );
};
