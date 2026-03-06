/**
 * Computes the SHA-256 hash of a file natively in the browser using the Web Crypto API.
 * This is crucial for verifying file integrity on the backend after a direct-to-blob upload.
 */
export const computeFileHash = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            if (!arrayBuffer) {
                return reject(new Error('Failed to read file as ArrayBuffer'));
            }

            try {
                // Use the native Web Crypto API to hash the buffer
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                
                // Convert buffer to byte array
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                
                // Convert bytes to hex string
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                
                resolve(hashHex);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);

        // Read the file entirely as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
};
