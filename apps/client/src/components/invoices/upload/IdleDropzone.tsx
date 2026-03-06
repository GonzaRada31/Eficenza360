import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface IdleDropzoneProps {
    onFilesSelected: (files: File[]) => void;
}

export const IdleDropzone: React.FC<IdleDropzoneProps> = ({ onFilesSelected }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFilesSelected(acceptedFiles);
        }
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'application/pdf': [], 'image/*': [] },
        multiple: false,
        noClick: true,
        noKeyboard: true
    });

    return (
        <div 
            {...getRootProps()} 
            onClick={open}
            className="relative flex-1 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors border-gray-200 flex flex-col items-center justify-center outline-none"
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                    <UploadCloud className="w-16 h-16 text-blue-500 mb-4" />
                    <p className="text-xl font-semibold text-blue-600">Suelta los archivos aquí</p>
                </div>
            ) : (
                <>
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                        Arrastra facturas aquí
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        o haz clic para seleccionar (PDF, PNG, JPG)
                    </p>
                </>
            )}
        </div>
    );
};
