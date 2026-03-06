import React from 'react';
import { Loader2 } from 'lucide-react';

export const ProcessingState: React.FC = () => (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Procesando facturas...</p>
            <p className="text-sm text-gray-500">Analizando documentos con IA</p>
        </div>
    </div>
);
