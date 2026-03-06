import React from 'react';
import type { InvoiceQueueItem } from '../../types/invoice';
import { Button } from '../ui/button';
import { Loader2, Play, CircleAlert, CheckCircle, FileText } from 'lucide-react';
import { useAnalyzeInvoice } from '../../modules/invoices/useInvoice';

interface InvoiceProcessingPanelProps {
    queue: InvoiceQueueItem[];
    onUpdateItem: (id: string, updates: Partial<InvoiceQueueItem>) => void;
    onReviewItem: (item: InvoiceQueueItem) => void;
}

export const InvoiceProcessingPanel: React.FC<InvoiceProcessingPanelProps> = ({ 
    queue, onUpdateItem, onReviewItem 
}) => {
    const analyzeMutation = useAnalyzeInvoice();

    const handleAnalyze = async (item: InvoiceQueueItem) => {
        onUpdateItem(item.id, { status: 'analyzing' });
        
        try {
            const result = await analyzeMutation.mutateAsync(item.previewUrl);
            onUpdateItem(item.id, { 
                status: 'ready_for_review', 
                extractedData: result.extractedData,
                rawData: result.extractedData // Assuming duplication for compatibility
            });
        } catch (error) {
            console.error("Analysis failed", error);
            onUpdateItem(item.id, { status: 'error', errorMessage: 'Error en análisis IA' });
        }
    };

    if (queue.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No hay facturas en proceso. Sube una nueva factura para comenzar.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                 <h3 className="font-medium text-gray-900">Cola de Procesamiento ({queue.length})</h3>
             </div>
             <div className="divide-y divide-gray-100">
                 {queue.map(item => (
                     <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                         {/* Thumbnail / Icon */}
                         <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 border overflow-hidden">
                             {(item.file?.type.startsWith('image/') || item.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                                 <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                             ) : (
                                 <FileText className="text-gray-400" size={20} />
                             )}
                         </div>

                         {/* Info */}
                         <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                             <div className="flex items-center gap-2 mt-1">
                                 <StatusBadge status={item.status} error={item.errorMessage} />
                                 {item.fileSize && (
                                     <span className="text-xs text-gray-400">
                                         {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                                     </span>
                                 )}
                             </div>
                         </div>

                         {/* Actions */}
                         <div className="flex items-center gap-2">
                             {item.status === 'uploaded' && (
                                 <Button 
                                     size="sm" 
                                     onClick={() => handleAnalyze(item)}
                                     className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                                 >
                                     <Play size={14} fill="currentColor" />
                                     Analizar con IA
                                 </Button>
                             )}
                             
                             {item.status === 'ready_for_review' && (
                                 <Button 
                                     size="sm" 
                                     variant="outline"
                                     className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                     onClick={() => onReviewItem(item)}
                                 >
                                     Revisar
                                 </Button>
                             )}

                            {item.status === 'error' && (
                                 <Button 
                                     size="sm" 
                                     variant="ghost" 
                                     className="text-red-600 hover:bg-red-50"
                                     onClick={() => onUpdateItem(item.id, { status: 'uploaded', errorMessage: undefined })} // Retry logic simple
                                 >
                                     Reintentar
                                 </Button>
                             )}
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const StatusBadge = ({ status, error }: { status: InvoiceQueueItem['status'], error?: string }) => {
    switch (status) {
        case 'uploaded':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Subido</span>;
        case 'analyzing':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 gap-1"><Loader2 size={10} className="animate-spin"/> Analizando...</span>;
        case 'ready_for_review':
            // Use CircleAlert if available, or just generic alert
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 gap-1"><CircleAlert size={10} /> Revisión requerida</span>;
        case 'confirmed':
        case 'saved':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 gap-1"><CheckCircle size={10} /> Completado</span>;
        case 'error':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 gap-1" title={error}><CircleAlert size={10} /> Error</span>;
        default:
            return <span className="text-xs text-gray-500">{status}</span>;
    }
};
