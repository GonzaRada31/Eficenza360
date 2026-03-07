import React, { useState } from 'react';
import { DocumentDropzone } from './DocumentDropzone';
import { computeFileHash } from '../../utils/fileHash';
import { FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { PermissionGate } from '../security/PermissionGate';

interface DocumentUploaderProps {
    entityType: string; // e.g., 'energy_audit', 'carbon_footprint'
    entityId: string;
    onUploadSuccess?: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ entityType: _entityType, entityId: _entityId, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<'IDLE' | 'HASHING' | 'UPLOADING' | 'CONFIRMING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileAccepted = (file: File) => {
        setSelectedFile(file);
        setStatus('IDLE');
        setErrorMessage(null);
        setUploadProgress(0);
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setStatus('IDLE');
        setErrorMessage(null);
        setUploadProgress(0);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            // STEP 1: Hash the file locally (Zero Trust Security)
            setStatus('HASHING');
            await computeFileHash(selectedFile);

            // STEP 2: Get Presigned URL
            setStatus('UPLOADING');
            setUploadProgress(10);
            
            // Expected backend flow:
            // const presignRes = await api.post('/documents/presign', {
            //     filename: selectedFile.name,
            //     size: selectedFile.size,
            //     contentType: selectedFile.type,
            //     entityType,
            //     entityId,
            //     hash: fileHash
            // });
            // const { presignedUrl, documentId } = presignRes.data;

            // --- MOCK API CALL FOR DEVELOPMENT ---
            await new Promise(resolve => setTimeout(resolve, 800));
            // Mock values generated here previously
            // ------------------------------------

            // STEP 3: Upload Directly to Blob Storage (Frontend to Azure/AWS directly)
            // Example of native XHR to track precise progress:
            await new Promise<void>((resolve, _reject) => {
                let currentProgress = 10;
                
                // MOCK UPLOAD PROGRESS
                const interval = setInterval(() => {
                    currentProgress += 15;
                    if(currentProgress >= 90) {
                        clearInterval(interval);
                        setUploadProgress(90);
                        resolve();
                    } else {
                        setUploadProgress(currentProgress);
                    }
                }, 300);

                /**
                 * ACTUAL IMPLEMENTATION WOULD BE:
                 * const xhr = new XMLHttpRequest();
                 * xhr.open('PUT', presignedUrl, true);
                 * xhr.setRequestHeader('Content-Type', selectedFile.type);
                 * xhr.upload.onprogress = (e) => {
                 *   if (e.lengthComputable) {
                 *      const percentComplete = 10 + Math.round((e.loaded / e.total) * 80);
                 *      setUploadProgress(percentComplete);
                 *   }
                 * };
                 * xhr.onload = () => { if (xhr.status === 200) resolve(); else reject('Blob upload failed'); };
                 * xhr.onerror = () => reject('Network error');
                 * xhr.send(selectedFile);
                 */
            });

            // STEP 4: Confirm with Backend
            setStatus('CONFIRMING');
            setUploadProgress(95);

            // ACTUAL IMPLEMENTATION:
            // await api.post('/documents/confirm', {
            //     documentId,
            //     hash: fileHash
            // });

            // MOCK DELAY
            await new Promise(resolve => setTimeout(resolve, 500));

            setStatus('SUCCESS');
            setUploadProgress(100);
            
            if (onUploadSuccess) {
                // Slightly delay the callback so user sees the success state
                setTimeout(() => onUploadSuccess(), 1000);
            }

        } catch (error: any) {
            console.error('Upload failed:', error);
            setStatus('ERROR');
            setErrorMessage(error?.response?.data?.message || error?.message || 'Error desconocido al subir el documento.');
        }
    };

    return (
        <PermissionGate permission="document.upload" fallback={
            <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-500 bg-gray-50">
                Contacte al administrador para subir documentos.
            </div>
        }>
            <div className="space-y-4">
                {!selectedFile || status === 'SUCCESS' ? (
                    <DocumentDropzone 
                        onFileAccepted={handleFileAccepted} 
                        isLoading={status !== 'IDLE' && status !== 'SUCCESS'} 
                    />
                ) : (
                    <div className="bg-white border text-gray-800 border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 shrink-0 bg-brand-primary/10 text-brand-primary flex items-center justify-center rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate" title={selectedFile.name}>
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto mt-4 sm:mt-0">
                            {status === 'IDLE' || status === 'ERROR' ? (
                                <>
                                    <button 
                                        onClick={handleCancel}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleUpload}
                                        className="px-4 py-1.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-md shadow-sm transition-colors"
                                    >
                                        Subir Archivo
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 w-full sm:w-64 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <Loader2 size={16} className="text-brand-primary animate-spin shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                                {status === 'HASHING' && 'Validando...'}
                                                {status === 'UPLOADING' && 'Subiendo a la Nube...'}
                                                {status === 'CONFIRMING' && 'Asentando...'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-900">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="bg-brand-primary h-1.5 rounded-full transition-all duration-300 ease-out" 
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {status === 'SUCCESS' && (
                    <div className="text-sm bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} />
                        Documento inyectado y salvaguardado.
                    </div>
                )}

                {status === 'ERROR' && errorMessage && (
                    <div className="text-sm text-red-600 font-medium text-center">
                        {errorMessage}
                    </div>
                )}
            </div>
        </PermissionGate>
    );
};
