import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { type AuditLogFiltersData } from '../../types/audit';

interface AuditLogFiltersProps {
    filters: AuditLogFiltersData;
    onFilterChange: (filters: AuditLogFiltersData) => void;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({ filters, onFilterChange }) => {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange({ ...filters, search: searchValue });
    };

    const clearFilters = () => {
        setSearchValue('');
        onFilterChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0 && filters.search !== '';

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-gray-100 rounded-t-xl border-b-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por email, acción, entidad..." 
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent w-full"
                    />
                </form>

                <div className="relative group">
                    <select 
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full py-2 pl-3 pr-8 cursor-pointer"
                        value={filters.action || ''}
                        onChange={(e) => onFilterChange({ ...filters, action: e.target.value || undefined })}
                    >
                        <option value="">Todas las acciones</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PROCESS">PROCESS (Workers)</option>
                    </select>
                </div>
            </div>

            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors shrink-0"
                >
                    <X size={14} />
                    Limpiar Filtros
                </button>
            )}
        </div>
    );
};
