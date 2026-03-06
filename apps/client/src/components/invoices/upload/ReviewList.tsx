import React, { useRef } from 'react';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Loader2, UploadCloud, CheckCircle, X, CircleAlert } from 'lucide-react';
import type { InvoiceQueueItem } from '../../../types/invoice';

interface ReviewListProps {
    queue: InvoiceQueueItem[];
    onReview: (item: InvoiceQueueItem) => void;
    onAnalyze: (item: InvoiceQueueItem) => void;
    onReset: () => void;
    onAddMore: (files: File[]) => void;
    serviceType: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ queue, onReview, onAnalyze, onAddMore, serviceType }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddMore(Array.from(e.target.files));
        }
        // Reset input value to allow selecting same file again
        if (e.target) e.target.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="application/pdf,image/*" 
                />
                {/* 
                  In single file mode, we might want to prevent accidental replacements if not saved?
                  But the requirement is "Allow next file upload" after review.
                  We'll call this "Subir otra" (Upload another).
                */}
                <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 border-dashed"
                >
                    <UploadCloud size={16} />
                    Subir otra factura
                </Button>
                
                {/* 
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onReset}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    Cancelar
                </Button>
                */}
            </div>

            {/* Queue List */}
            <div>
                <h4 className="text-sm font-medium mb-2">Documentos en proceso</h4>
                <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Estado</TableHead>
                                <TableHead>Archivo</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queue.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.status === 'uploaded' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Cargado</span>}
                                        {item.status === 'analyzing' && <span className="flex items-center text-blue-600 text-xs"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Analizando...</span>}
                                        {item.status === 'queued' && <span className="text-gray-400 text-xs">En cola</span>}
                                        {item.status === 'ready_for_review' && <span className="flex items-center text-amber-600 text-xs font-medium"><CircleAlert className="mr-1 h-3 w-3" /> Validar</span>}
                                        {(item.status === 'confirmed' || item.status === 'saved') && <span className="flex items-center text-green-600 text-xs"><CheckCircle className="mr-1 h-3 w-3" /> Completado</span>}
                                        {item.status === 'error' && <span className="flex items-center text-red-600 text-xs"><X className="mr-1 h-3 w-3" /> Error</span>}
                                    </TableCell>
                                    <TableCell className="font-medium text-xs break-all">
                                        {item.fileName}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.status === 'uploaded' && (
                                           <>
                                             {(serviceType === 'ELECTRICITY' || serviceType === 'GAS' || serviceType === 'GAS_NATURAL') ? (
                                                <Button size="sm" onClick={() => onAnalyze(item)} className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs">
                                                    Analizar IA
                                                </Button>
                                             ) : (
                                                 <Button size="sm" onClick={() => onAnalyze(item)} className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs">
                                                    Completar datos
                                                </Button>
                                             )}
                                           </>
                                        )}
                                        {item.status === 'ready_for_review' && (
                                            <Button size="sm" onClick={() => onReview(item)} variant="outline" className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50">
                                                Revisar
                                            </Button>
                                        )}
                                        {item.status === 'error' && (
                                             <Button size="sm" onClick={() => onAnalyze(item)} variant="ghost" className="h-7 text-xs text-red-600 hover:bg-red-50">
                                                Reintentar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {queue.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-gray-500 text-sm">
                                        No hay documentos en proceso.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};
