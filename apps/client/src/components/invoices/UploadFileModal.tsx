import React, { useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { IdleDropzone } from './upload/IdleDropzone';
import { useUploadFile } from '../../modules/invoices/useInvoice';
import { Loader2, FileUp, X, FileText, AlertCircle } from 'lucide-react';
import type { InvoiceQueueItem } from '../../types/invoice';

interface UploadFileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadComplete: (item: InvoiceQueueItem) => void;
    existingFileNames: string[];
    subtaskId: string;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({ 
    open, onOpenChange, onUploadComplete, existingFileNames = [], subtaskId
}) => {
    const uploadMutation = useUploadFile();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal closes/opens
    React.useEffect(() => {
        if (open) {
            setSelectedFile(null);
            setIsUploading(false);
            setError(null);
        }
    }, [open]);

    const handleFilesSelected = useCallback((files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            if (existingFileNames.includes(file.name)) {
                setError(`El archivo "${file.name}" ya ha sido cargado anteriormente.`);
                // Allow selection but show error? Or prevent?
                // Prevent implies clearing selection.
                // Let's clear and show toast or just show error in modal (added state).
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    }, [existingFileNames]);

    const truncateFileName = (name: string, maxLength: number = 40) => {
        if (name.length <= maxLength) return name;
        const extension = name.split('.').pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
        
        // Keep extension, truncate name
        const extLength = extension ? extension.length + 1 : 0;
        const availableNameLength = maxLength - extLength - 3; // 3 for "..."
        
        if (availableNameLength <= 0) return name.substring(0, maxLength) + '...';
        
        return `${nameWithoutExt.substring(0, availableNameLength)}...${extension ? '.' + extension : ''}`;
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const result = await uploadMutation.mutateAsync({ file: selectedFile, subtaskId });
            
            // Create the queue item with 'uploaded' status
            // Use result from backend which is Invoice object
            const newItem: InvoiceQueueItem = {
                id: result.id,
                fileName: result.rawData?.originalFilename || selectedFile.name,
                fileSize: selectedFile.size,
                file: selectedFile, // Optional but useful if we have it here
                previewUrl: result.imageUrl || '', // Use the remotely returned URL (which has SAS)
                status: 'uploaded',
                rawData: result.rawData
            };

            onUploadComplete(newItem);
            onOpenChange(false); // Close immediately on success
        } catch (error) {
            console.error("Upload failed", error);
            setError("Error al subir el archivo. Internet?");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Subir Factura</DialogTitle>
                    <DialogDescription>
                        Carga el archivo para comenzar el proceso.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-2">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-600">
                             <AlertCircle size={16} />
                             {error}
                        </div>
                    )}
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Subiendo a la nube segura...</p>
                        </div>
                    ) : selectedFile ? (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4 w-full">
                            <div className="flex items-center gap-3 w-full">
                                <div className="p-2 bg-white rounded border border-gray-200 text-brand-primary shrink-0">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 break-all">
                                        {truncateFileName(selectedFile.name)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedFile(null)}
                                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
                                    title="Quitar archivo"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 order-2 sm:order-1" 
                                    onClick={() => setSelectedFile(null)}
                                >
                                    Cambiar archivo
                                </Button>
                                <Button 
                                    className="flex-1 gap-2 bg-brand-primary hover:bg-brand-primary/90 order-1 sm:order-2"
                                    onClick={handleConfirmUpload}
                                >
                                    <FileUp size={16} />
                                    Confirmar Subida
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <IdleDropzone onFilesSelected={handleFilesSelected} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
