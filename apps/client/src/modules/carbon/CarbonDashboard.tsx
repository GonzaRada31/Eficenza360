import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Loader2, Leaf, TrendingDown, TrendingUp } from 'lucide-react';

interface CarbonStats {
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
}

export const CarbonDashboard: React.FC = () => {
    const [stats, setStats] = useState<CarbonStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock API call for now, replacing with real endpoint
        setTimeout(() => {
            setStats({
                total: 125.5,
                scope1: 45.2,
                scope2: 80.3,
                scope3: 5.0
            });
            setLoading(false);
        }, 800);
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    const scopeData = [
        { name: 'Alcance 1', value: stats?.scope1 || 0, color: '#f59e0b' },
        { name: 'Alcance 2', value: stats?.scope2 || 0, color: '#10b981' },
        { name: 'Alcance 3', value: stats?.scope3 || 0, color: '#3b82f6' },
    ];

    const hotspotData = [
        { name: 'Electricidad (Red)', value: 80.3, color: '#10b981' },
        { name: 'Gas Natural (Calderas)', value: 30.2, color: '#f59e0b' },
        { name: 'Flota Vehicular', value: 15.0, color: '#f97316' },
    ];

    const historyData = [
        { year: '2023', emissions: 140.0 },
        { year: '2024', emissions: 125.5 }, // 10% reduction
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Emisiones Totales</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.total} <span className="text-base font-normal text-gray-500">tCO₂e</span></h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Intensidad</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">0.12 <span className="text-base font-normal text-gray-500">tCO₂e/m²</span></h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                        <TrendingDown className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Variación Anual</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-1">-10.4%</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scope Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Emisiones por Alcance</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scopeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip formatter={(value: number | undefined) => [`${value} tCO₂e`, 'Emisiones']} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                    {scopeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hotspots (Critical Focus) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Focos Críticos (Hotspots)</h4>
                    <div className="h-64 flex">
                        <div className="w-1/2 h-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={hotspotData} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {hotspotData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 flex flex-col justify-center space-y-3">
                            {hotspotData.map(item => (
                                <div key={item.name} className="flex items-center gap-2">
                                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                     <div className="text-sm">
                                         <p className="font-medium text-gray-700">{item.name}</p>
                                         <p className="text-gray-500">{item.value} tCO₂e</p>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Historical Comparison */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h4 className="text-lg font-bold text-gray-800 mb-4">Comparativa Interanual</h4>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value: number | undefined) => [`${value} tCO₂e`, 'Emisiones']} />
                            <Bar dataKey="emissions" fill="#059669" barSize={60} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>
    );
};
