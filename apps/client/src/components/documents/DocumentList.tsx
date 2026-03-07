import React, { useState } from 'react';
import { DocumentItem, type DocumentData } from './DocumentItem';
import { DocumentPreview } from './DocumentPreview';
import { useDocuments } from '../../hooks/documents/useDocuments';
import { useDeleteDocument } from '../../hooks/documents/useDeleteDocument';
import { Loader2, Search } from 'lucide-react';
import { PermissionGate } from '../security/PermissionGate';

interface DocumentListProps {
    entityType: string;
    entityId: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ entityType, entityId }) => {
    const { data: documents, isLoading, error } = useDocuments(entityType, entityId);
    const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [previewDoc, setPreviewDoc] = useState<DocumentData | null>(null);

    const filteredDocs = documents?.filter(d => d.filename.toLowerCase().includes(searchTerm.toLowerCase())) || [];

    return (
        <PermissionGate permission="document.read" fallback={
            <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-xl bg-gray-50">
                No tiene permisos para leer evidencias de este módulo.
            </div>
        }>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Evidencias Adjuntas</h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar archivo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent w-full md:w-64"
                        />
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-primary" size={32} />
                    </div>
                )}

                {!isLoading && error && (
                    <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
                        Error al cargar los documentos de este módulo.
                    </div>
                )}

                {!isLoading && !error && filteredDocs.length === 0 && (
                    <div className="p-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                        {searchTerm ? 'No se encontraron documentos.' : 'No hay documentos adjuntos todavía.'}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {filteredDocs.map((doc) => (
                        <DocumentItem 
                            key={doc.id}
                            document={doc}
                            onPreview={setPreviewDoc}
                            onDelete={(id) => deleteDoc(id)}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>

                {previewDoc && (
                    <DocumentPreview 
                        document={previewDoc} 
                        onClose={() => setPreviewDoc(null)} 
                    />
                )}
            </div>
        </PermissionGate>
    );
};
