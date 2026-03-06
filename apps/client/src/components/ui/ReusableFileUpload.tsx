import React, { useState, useRef } from 'react';
import { useAttachments } from '../../hooks/useAttachments';
import { UploadCloud, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Attachment } from '../../types/project';

interface ReusableFileUploadProps {
    subtaskId: string;
    onUploadComplete: (attachment: Attachment) => void;
    onCancel?: () => void;
}

export const ReusableFileUpload: React.FC<ReusableFileUploadProps> = ({ subtaskId, onUploadComplete, onCancel }) => {
    const { uploadFile, isUploading, error } = useAttachments();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        // Basic validation (can extend later)
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            const attachment = await uploadFile(selectedFile, subtaskId);
            
            // CRITICAL: Call parent callback LAST and do not touch local state afterwards.
            // The parent (UniversalSubtask) will likely unmount us immediately.
            // If we try to setSelectedFile(null) here, we risk a "React state update on unmounted component"
            // or worse, a race condition in fiber commit phase leading to 'removeChild' error.
            onUploadComplete(attachment);
            
            // Do NOT reset selectedFile here. Let the unmount happen cleanly.
        } catch (err) {
             console.error('Upload component error:', err);
            // Error is handled by hook/UI display
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-in fade-in zoom-in duration-200">
            {!selectedFile ? (
                // DROPZONE STATE
                <div 
                    className={`relative border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center transition-colors
                        ${dragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-300 hover:border-gray-400 bg-white'}
                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input 
                        ref={inputRef}
                        type="file" 
                        className="hidden" 
                        onChange={handleChange}
                        disabled={isUploading} 
                    />
                    
                    <UploadCloud className={`mb-3 ${dragActive ? 'text-brand-primary' : 'text-gray-400'}`} size={32} />
                    
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Arrastra y suelta tu archivo aquí
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                        o abre el explorador de archivos
                    </p>
                    
                    <button 
                        onClick={() => inputRef.current?.click()}
                        className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                    >
                        Seleccionar archivo
                    </button>

                    {onCancel && (
                        <button onClick={onCancel} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
            ) : (
                // CONFIRMATION STATE
                <div className="bg-white border border-gray-200 rounded-md p-4">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <File size={20} />
                        </div>
                        <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</h4>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500" disabled={isUploading}>
                            <X size={16} />
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded mb-3">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <button 
                            onClick={() => setSelectedFile(null)} 
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800"
                            disabled={isUploading}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleUpload}
                            disabled={isUploading}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded shadow-sm transition-colors
                                ${isUploading ? 'opacity-70 cursor-wait' : ''}
                            `}
                        >
                            {isUploading ? (
                                <>Subiendo...</>
                            ) : (
                                <><CheckCircle2 size={14} /> Confirmar subida</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
