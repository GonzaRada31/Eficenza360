import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

// Assuming you have an api client instance or use axios directly with base URL
// const apiClient = axios.create({ baseURL: '/api' });
// But for now I will use relative paths or assume proxy/CORS setup.

export interface InvoiceItem {
  description?: string;
  amount?: number;
  quantity?: number;
  unitPrice?: number;
  [key: string]: unknown;
}

export interface InvoiceData {
  imageUrl: string;
  extractedData: {
    vendorName?: string;
    vendorTaxId?: string; // CUIT
    totalAmount?: number;
    currency?: string;
    date?: string;
    items?: InvoiceItem[];
    rawData?: Record<string, unknown>;
  };
}

export interface ConfirmInvoiceDto {
  imageUrl: string;
  subtaskId: string;
  vendorName?: string;
  vendorTaxId?: string;
  totalAmount?: number;
  currency?: string;
  consumption?: number;
  unit?: string;
  serviceType: string;
  periodStart?: string;
  periodEnd?: string;
  clientNumber?: string;
  dueDate?: string;
  source?: string;
  aiConfidence?: number;
  rawData?: Record<string, unknown>;
  pendingInvoiceId?: string;
}

export interface Invoice {
  id: string;
  subtaskId: string;
  vendorName: string | null;
  vendorTaxId: string | null;
  totalAmount: number | null;
  currency: string;
  consumption: number | null;
  unit: string | null;
  serviceType: string;
  periodStart: Date | string | null;
  periodEnd: Date | string | null;
  status: string;
  processingStatus: string;
  source: string;
  aiConfidence: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  rawData?: { originalFilename?: string; mimeType?: string; [key: string]: unknown };
}

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ file, subtaskId }: { file: File; subtaskId: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subtaskId', subtaskId);
      
      const response = await api.post<Invoice>('/invoices/upload-only', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
};

export const useAnalyzeInvoice = () => {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await api.post<{ extractedData: InvoiceData['extractedData'] }>('/invoices/analyze', { imageUrl });
      return response.data;
    },
  });
};

// ... (existing exports)

export interface InvoiceSummary {
  totalConsumption: number;
  totalCost: number;
  invoiceCount: number;
  lastUpdated: string;
}

export const useGetInvoices = (subtaskId: string) => {
    return useQuery<Invoice[]>({
        queryKey: ['invoices', subtaskId],
        queryFn: async () => {
             const response = await api.get<Invoice[]>(`/invoices/subtask/${subtaskId}`);
             return response.data;
        },
        enabled: !!subtaskId
    });
};

export const useGetInvoiceSummary = (subtaskId: string) => {
    return useQuery({
        queryKey: ['invoice-summary', subtaskId],
        queryFn: async () => {
             const response = await api.get<InvoiceSummary>(`/invoices/subtask/${subtaskId}/summary`);
             return response.data;
        },
        enabled: !!subtaskId
    });
};

export const useConfirmInvoice = () => {
  return useMutation({
    mutationFn: async (data: ConfirmInvoiceDto) => {
      const response = await api.post('/invoices/confirm', data);
      return response.data;
    },
  });
};
