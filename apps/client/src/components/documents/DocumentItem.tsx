import React from 'react';
import { FileText, Image as ImageIcon, FileSpreadsheet, Download, Trash2, Eye } from 'lucide-react';
import { PermissionGate } from '../security/PermissionGate';

export interface DocumentData {
    id: string;
    filename: string;
    sizeBytes: number;
    mimeType: string;
    uploadedBy: string;
    createdAt: string;
    version: number;
    url: string; // The URL to download or preview
}

interface DocumentItemProps {
    document: DocumentData;
    onPreview: (doc: DocumentData) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ document, onPreview, onDelete, isDeleting }) => {
    
    const getIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="text-red-500" />;
        if (mimeType.includes('image')) return <ImageIcon className="text-blue-500" />;
        if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <FileSpreadsheet className="text-green-500" />;
        return <FileText className="text-gray-500" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all">
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 shrink-0 bg-gray-50 flex items-center justify-center rounded-lg border border-gray-100">
                    {getIcon(document.mimeType)}
                </div>
                <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate" title={document.filename}>
                        {document.filename}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatSize(document.sizeBytes)}</span>
                        <span>•</span>
                        <span>v{document.version}</span>
                        <span>•</span>
                        <span className="truncate">{document.uploadedBy}</span>
                        <span>•</span>
                        <span>{formatDate(document.createdAt)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onPreview(document)}
                    className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                    title="Vista Previa"
                >
                    <Eye size={18} />
                </button>
                
                <a 
                    href={document.url}
                    download
                    className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                    title="Descargar"
                >
                    <Download size={18} />
                </a>

                <PermissionGate permission="document.delete">
                    <button 
                        onClick={() => onDelete(document.id)}
                        disabled={isDeleting}
                        className={`p-2 rounded-lg transition-colors ${isDeleting ? 'text-gray-300 pointer-events-none' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                        title="Eliminar Documento"
                    >
                        <Trash2 size={18} />
                    </button>
                </PermissionGate>
            </div>
        </div>
    );
};
