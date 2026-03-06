export interface InvoiceQueueItem {
  id: string;
  file?: File;
  fileName: string;
  fileSize?: number;
  previewUrl: string; // Blob URL
  status: 'uploaded' | 'staged' | 'queued' | 'analyzing' | 'ready_for_review' | 'confirmed' | 'saved' | 'error';
  extractedData?: Record<string, unknown>; // We'll type this strictly later
  rawData?: Record<string, unknown>;
  errorMessage?: string;
}
