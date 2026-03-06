import React, { useEffect } from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import type { DocumentData } from './DocumentItem';

interface DocumentPreviewProps {
    document: DocumentData;
    onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
    
    // Trap focus and block body scrolling
    useEffect(() => {
        window.document.body.style.overflow = 'hidden';
        return () => {
             window.document.body.style.overflow = 'unset';
        };
    }, []);

    const isImage = document.mimeType.startsWith('image/');
    const isPDF = document.mimeType === 'application/pdf';

    // Click outside handler
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate" title={document.filename}>
                            {document.filename}
                        </h3>
                        <p className="text-xs text-gray-500">v{document.version} • {document.uploadedBy}</p>
                    </div>
                    <div className="flex items-center gap-2 pl-4 shrink-0">
                        <a 
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ExternalLink size={16} /> 
                            <span className="hidden sm:inline">Abrir</span>
                        </a>
                        <a 
                            href={document.url}
                            download
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg shadow-sm transition-colors"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Download</span>
                        </a>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100/50 p-6 overflow-hidden flex items-center justify-center relative inner-shadow">
                    {isImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                                src={document.url} 
                                alt={document.filename} 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                            />
                        </div>
                    ) : isPDF ? (
                        <iframe 
                            src={`${document.url}#toolbar=0`} 
                            className="w-full h-full rounded shadow-sm border border-gray-200 bg-white"
                            title={document.filename}
                        />
                    ) : (
                        <div className="text-center max-w-sm">
                            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                                <FileText size={40} />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Vista previa no disponible</h4>
                            <p className="text-sm text-gray-500 mb-6">
                                Este tipo de archivo ({document.mimeType}) no puede previsualizarse en el navegador. Por favor descárguelo para verlo.
                            </p>
                            <a 
                                href={document.url}
                                download
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-xl shadow-sm transition-all"
                            >
                                <Download size={18} />
                                Descargar Archivo
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
