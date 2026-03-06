import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import type { Attachment } from '../types/project';

export const useAttachments = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    const uploadFile = async (file: File, subtaskId: string): Promise<Attachment> => {
        setIsUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('subtaskId', subtaskId);

            const response = await api.post('/attachments/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return response.data as Attachment;
        } catch (err) {
            console.error('Upload Error', err);
            if (isMounted.current) setError('Error al subir archivo');
            throw err;
        } finally {
            if (isMounted.current) setIsUploading(false);
        }
    };

    const getSasUrl = async (blobName: string): Promise<string> => {
        try {
            // blobName might contain slashes. If using wildcard route:
            // const encodedBlobName = encodeURIComponent(blobName);
            // However, our backend wildcard handles raw path if not encoded too aggressively, 
            // but typical axios/browser behavior encodes slashes in path params unless careful.
            // Let's rely on the wildcard controller logic: /attachments/sas/tenant/task/file
            
            // Construct path manually to ensure it hits the wildcard
            const response = await api.get(`/attachments/sas/${blobName}`);
            return response.data.sasUrl;
        } catch (err) {
            console.error('SAS Error', err);
            throw err;
        }
    };

    const deleteFile = async (blobName: string): Promise<void> => {
        // blobName likely contains slashes 'tenant/task/file'.
        // We need to encode it properly if using path param, or just pass it to standard delete
        // Our backend wildcard route expects /attachments/encodedBlobName
        
        try {
            await api.delete(`/attachments/${encodeURIComponent(blobName)}`);
        } catch (err) {
            console.error('Delete Error', err);
            throw err;
        }
    };

    return {
        uploadFile,
        deleteFile, 
        getSasUrl,
        isUploading,
        error
    };
};
