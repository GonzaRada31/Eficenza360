import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';

export interface DocumentDropzoneProps {
    onFileAccepted: (file: File) => void;
    maxSizeMB?: number;
    isLoading?: boolean;
    disabled?: boolean;
}

const ACCEPTED_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg']
};

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({ 
    onFileAccepted, 
    maxSizeMB = 10,
    isLoading = false,
    disabled = false
}) => {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setError(null);

        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError(`El archivo excede el límite de ${maxSizeMB}MB.`);
            } else if (rejection.errors[0].code === 'file-invalid-type') {
                setError('Tipo de archivo no soportado. Use PDF, Excel, CSV o Imágenes.');
            } else {
                setError(rejection.errors[0].message);
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            onFileAccepted(acceptedFiles[0]);
        }
    }, [maxSizeMB, onFileAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxSize: maxSizeMB * 1024 * 1024,
        maxFiles: 1,
        disabled: isLoading || disabled
    });

    return (
        <div className="w-full">
            <div 
                {...getRootProps()} 
                className={`
                    relative bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                    flex flex-col items-center justify-center min-h-[200px]
                    ${(isLoading || disabled) ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200' : 'cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary/30'}
                    ${isDragActive ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-300'}
                    ${error ? 'border-red-300 bg-red-50/50' : ''}
                `}
            >
                <input {...getInputProps()} />
                
                <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-brand-primary text-white' : 'bg-white text-brand-primary shadow-sm'}`}>
                    <UploadCloud size={32} />
                </div>
                
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {isDragActive ? 'Suelte el archivo aquí...' : 'Haga clic o arrastre un archivo'}
                </h4>
                
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                    Documentos seguros (PDF), Planillas (XLSX, CSV) o Imágenes (PNG, JPG). Hasta {maxSizeMB}MB.
                </p>

                {error && (
                    <div className="mt-2 text-xs font-medium text-red-600 flex items-center justify-center gap-1 bg-red-100 px-3 py-1.5 rounded-lg border border-red-200">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};
