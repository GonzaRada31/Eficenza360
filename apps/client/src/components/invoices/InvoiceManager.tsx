import { InvoiceList } from './InvoiceList';
import { UploadFileModal } from './UploadFileModal';
import { ReviewList } from './upload/ReviewList';
import type { InvoiceQueueItem } from '../../types/invoice';
import { InvoicePreviewDrawer } from './InvoicePreviewDrawer';
import { useGetInvoiceSummary, useGetInvoices, useAnalyzeInvoice, useConfirmInvoice, type ConfirmInvoiceDto } from '../../modules/invoices/useInvoice';
import { ManualEntryModal } from './ManualEntryModal';
import { Loader2, Plus } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';

interface InvoiceManagerProps {
    subtaskId: string;
    serviceType: string;
    allowedServiceTypes?: string[];
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({ subtaskId, serviceType, allowedServiceTypes }) => {
    // ... existing state ...
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    
    // Review item for the Drawer
    const [reviewItem, setReviewItem] = useState<InvoiceQueueItem | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Manual Entry state
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualEntryItem, setManualEntryItem] = useState<InvoiceQueueItem | null>(null);
    
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetInvoiceSummary(subtaskId);
    const { data: invoices, refetch: refetchInvoices } = useGetInvoices(subtaskId);

    // Local state for transient UI status (analyzing, error)
    const [itemStates, setItemStates] = useState<Record<string, Partial<InvoiceQueueItem>>>({});

    const processingQueue = useMemo(() => {
        if (!invoices) return [];
        
        // Filter pending items
        const pending = invoices.filter(inv => inv.status === 'PENDING_REVIEW' || inv.processingStatus === 'PENDING'); // Adjust condition as needed
        
        return pending.map(inv => {
            const localState = itemStates[inv.id] || {};
            // Map DB Invoice to Queue Item
            return {
                id: inv.id,
                fileName: inv.rawData?.originalFilename || 'Sin nombre',
                fileSize: undefined, 
                previewUrl: inv.imageUrl || '',
                status: 'uploaded', // Default start state for pending items
                rawData: inv.rawData,
                extractedData: inv.rawData, // In case analysis was saved
                ...localState // Override with local state (e.g. status: 'analyzing', extractedData)
            } as InvoiceQueueItem;
        });
    }, [invoices, itemStates]);

    const existingFileNames = useMemo(() => 
        invoices?.map(i => i.rawData?.originalFilename).filter((name): name is string => !!name) || [], 
    [invoices]);

    const handleUploadComplete = useCallback(() => {
        refetchInvoices();
    }, [refetchInvoices]);

    const handleItemUpdate = useCallback((id: string, updates: Partial<InvoiceQueueItem>) => {
        setItemStates(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    }, []);

    const handleReview = (item: InvoiceQueueItem) => {
        setReviewItem(item); // Set the item to be reviewed
        setIsDrawerOpen(true); // Open the drawer
    };

    const handleReviewSuccess = () => {
        setIsDrawerOpen(false);
        // Retain reviewItem so the drawer doesn't crash/return null while animating out
        setRefreshTrigger(prev => prev + 1); // Trigger list refresh
        refetchSummary();
        refetchInvoices(); // Remove confirmed item from queue
    };
    
    const analyzeMutation = useAnalyzeInvoice();
    const confirmMutation = useConfirmInvoice();

    const handleAnalyze = async (item: InvoiceQueueItem) => {
        // Fork logic based on serviceType
        const isAIEnabled = serviceType === 'ELECTRICITY' || serviceType === 'GAS' || serviceType === 'GAS_NATURAL';

        if (!isAIEnabled) {
             // Open Manual Modal
             setManualEntryItem(item);
             setIsManualModalOpen(true);
             return;
        }

        handleItemUpdate(item.id, { status: 'analyzing' });
        
        try {
            const result = await analyzeMutation.mutateAsync(item.previewUrl);
            handleItemUpdate(item.id, { 
                status: 'ready_for_review', 
                extractedData: result.extractedData,
                rawData: result.extractedData 
            });
        } catch (error) {
            console.error("Analysis failed", error);
            handleItemUpdate(item.id, { status: 'error', errorMessage: 'Error en análisis IA' });
        }
    };
    
    const handleManualSave = async (id: string, data: Record<string, unknown>) => {
         try {
            // Confirm/Update invoice with manual data
            const payload: ConfirmInvoiceDto = {
                imageUrl: manualEntryItem?.previewUrl || '', // Should exist
                subtaskId: subtaskId,
                serviceType: serviceType, // Base type, or override from data
                pendingInvoiceId: id,
                ...data
            };

            await confirmMutation.mutateAsync(payload);
            
            // Success
            handleItemUpdate(id, { status: 'confirmed' }); // Or whatever status means done
            setRefreshTrigger(prev => prev + 1);
            refetchSummary();
            refetchInvoices();
         } catch (error) {
             console.error("Manual Save Failed", error);
             // handleItemUpdate(id, { status: 'error' }); // Maybe keep manual modal open on error?
         }
    };
    
    const handleView = (id: string) => {
        // TODO: Adapt Drawer to show existing invoice
        console.log("View invoice:", id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Gestión de Facturas</h3>
                    <p className="text-sm text-gray-500">
                        {serviceType} - Historial y Validación
                    </p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)} className="gap-2 shadow-sm bg-brand-primary hover:bg-brand-dark text-white">
                    <Plus size={16} />
                    Cargar Factura
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-xs font-medium uppercase">Consumo Total</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                        {isSummaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.totalConsumption?.toLocaleString() ?? 0}
                    </div>
                 </div>
                 <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-xs font-medium uppercase">Costo Total</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                         {isSummaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `$${summary?.totalCost?.toLocaleString() ?? 0}`}
                    </div>
                 </div>
                 <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-xs font-medium uppercase">Emisiones</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                        -- tCO2e {/* Todo: Add emissions to summary endpoint */}
                    </div>
                 </div>
                 <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-xs font-medium uppercase">Facturas Proc.</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                        {isSummaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary?.invoiceCount ?? 0}
                    </div>
                 </div>
            </div>

            {/* Active Processing Queue */}
            <ReviewList 
                queue={processingQueue} 
                serviceType={serviceType}
                onAnalyze={handleAnalyze}
                onReview={handleReview}
                onReset={() => console.log("Reset not implemented")}
                onAddMore={() => {
                    // Ideally we open the modal again or handle direct upload here
                    setIsUploadOpen(true);
                }}
            />

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                     <span className="text-sm font-medium text-gray-700">Historial de Periodos</span>
                </div>
                <div className="p-0">
                    <InvoiceList subtaskId={subtaskId} onView={handleView} refreshTrigger={refreshTrigger} />
                </div>
            </div>

            {/* Modals & Drawers */}
            <UploadFileModal 
                open={isUploadOpen} 
                onOpenChange={setIsUploadOpen} 
                onUploadComplete={handleUploadComplete}
                existingFileNames={existingFileNames}
                subtaskId={subtaskId}
            />

            <InvoicePreviewDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                item={reviewItem}
                subtaskId={subtaskId}
                serviceType={serviceType}
                onSuccess={handleReviewSuccess}
                allowedServiceTypes={allowedServiceTypes}
            />
            
            <ManualEntryModal 
                open={isManualModalOpen} 
                onOpenChange={setIsManualModalOpen} 
                item={manualEntryItem} 
                serviceType={serviceType}
                onSave={handleManualSave}
            /> 
        </div>
    );
};
