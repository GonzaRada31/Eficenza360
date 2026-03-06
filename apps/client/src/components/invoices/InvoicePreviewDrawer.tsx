import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Zap, Flame, Droplet } from 'lucide-react';

import { useConfirmInvoice } from '../../modules/invoices/useInvoice';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '../ui/sheet.tsx';
import type { InvoiceQueueItem } from '../../types/invoice';
import Swal from 'sweetalert2';

interface InvoicePreviewDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InvoiceQueueItem | null;
    subtaskId: string;
    serviceType?: string;
    onSuccess: () => void;
    allowedServiceTypes?: string[];
}

// Validation Schema
const invoiceSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  vendorTaxId: z.string().optional(),
  totalAmount: z.coerce.number().min(0),
  currency: z.string().default('ARS'),
  consumption: z.coerce.number().optional(),
  unit: z.string().optional(),
  serviceType: z.string().default('ELECTRICITY'), // Relaxed from strict enum to allow incoming props
  periodStart: z.string().optional(), // Date string YYYY-MM-DD
  periodEnd: z.string().optional(),
  clientNumber: z.string().optional(),
  dueDate: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const InvoicePreviewDrawer: React.FC<InvoicePreviewDrawerProps> = ({
    open, onOpenChange, item, subtaskId, serviceType, onSuccess, allowedServiceTypes
}) => {
    const confirmMutation = useConfirmInvoice();

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
        mode: 'onChange',
        defaultValues: {
            currency: 'ARS',
            serviceType: serviceType || 'ELECTRICITY'
        }
    });
    
    // Watch serviceType to update UI state if needed
    const currentServiceType = form.watch('serviceType');

    useEffect(() => {
        if (item && item.extractedData) {
            let defaultType = item.extractedData.serviceType || serviceType || 'ELECTRICITY';
            
            // Enforce single allowed type if present
            if (allowedServiceTypes && allowedServiceTypes.length === 1) {
                defaultType = allowedServiceTypes[0];
            } else if (allowedServiceTypes && allowedServiceTypes.length > 0 && !allowedServiceTypes.includes(defaultType as string)) {
                 // If current default is not in allowed list, pick first allowed
                 defaultType = allowedServiceTypes[0];
            }

            form.reset({
                 ...item.extractedData,
                 serviceType: defaultType as string,
                 currency: (item.extractedData.currency as string) || 'ARS', 
                 unit: (item.extractedData.unit as string) || (defaultType === 'ELECTRICITY' || !defaultType ? 'kWh' : ''),
                 periodEnd: item.extractedData.date ? new Date(item.extractedData.date as string).toISOString().split('T')[0] : '',
             });
        } else if (allowedServiceTypes && allowedServiceTypes.length === 1) {
             // Case where item might not have data but we have strict type
             form.setValue('serviceType', allowedServiceTypes[0]);
             // Trigger unit update roughly
             if (allowedServiceTypes[0] === 'ELECTRICITY') form.setValue('unit', 'kWh');
             if (allowedServiceTypes[0] === 'GAS_NATURAL') form.setValue('unit', 'm3');
        }
    }, [item, form, serviceType, allowedServiceTypes]);

    const handleServiceTypeChange = (type: string) => {
        form.setValue('serviceType', type);
        // Auto-set unit defaults if empty or standard
        const currentUnit = form.getValues('unit');
        if (!currentUnit || ['kWh', 'm3', 'Lt', 'L'].includes(currentUnit)) {
             if (type === 'ELECTRICITY') form.setValue('unit', 'kWh');
             if (type === 'GAS_NATURAL') form.setValue('unit', 'm3');
             if (['DIESEL', 'GASOLINE', 'LPG'].includes(type)) form.setValue('unit', 'L');
             if (type === 'WATER') form.setValue('unit', 'm3');
        }
    };

    const onSubmit = async (data: InvoiceFormValues) => {
    // ... existing onSubmit logic
        if (!item) return;
        try {
            await confirmMutation.mutateAsync({
                ...data,
                imageUrl: item.previewUrl,
                subtaskId: subtaskId,
                source: 'ai',
                aiConfidence: 0.9,
                rawData: item.rawData,
                pendingInvoiceId: item.id
            });
            // ... swal and close
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Factura guardada correctamente',
                showConfirmButton: false,
                timer: 3000
            });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Save failed", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any)?.response?.data?.message || 'No se pudo guardar la factura';
            Swal.fire('Error', msg, 'error');
        }
    };

    if (!item) return null;

    // Helper to determine if PDF
    const isPdf = item.file?.type === 'application/pdf' || 
                  item.fileName?.toLowerCase().endsWith('.pdf') ||
                  (item.rawData as { mimeType?: string })?.mimeType === 'application/pdf';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-4xl sm:w-[800px] flex gap-0 p-0">
                <div className="flex flex-1 h-full">
                    {/* Left: Preview */}
                    <div className="flex-1 bg-gray-100 hidden md:flex items-center justify-center border-r p-4">
                        {isPdf ? (
                            <iframe src={item.previewUrl} className="w-full h-full bg-white shadow-sm" title="PDF Preview" />
                        ) : (
                            <img src={item.previewUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
                        )}
                    </div>

                    {/* Right: Form */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white w-full md:w-1/2">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Validar Factura</SheetTitle>
                            <SheetDescription>Confirma el tipo de servicio y los datos (Versión Actualizada).</SheetDescription>
                        </SheetHeader>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            
                            {/* Service Type Selector */}
                            <div className="space-y-2">
                                <Label>Tipo de Servicio</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(allowedServiceTypes && allowedServiceTypes.length > 0 ? allowedServiceTypes : ['ELECTRICITY', 'GAS_NATURAL', 'WATER', 'GASOLINE', 'DIESEL', 'LPG']).map((allowed) => {
                                        // Map allowed string to component config
                                        const type = allowed as string;
                                        let config = null;
                                        if (type === 'ELECTRICITY') config = { icon: Zap, label: 'Electricidad', style: 'bg-blue-600 hover:bg-blue-700', active: 'default' };
                                        else if (type === 'GAS_NATURAL') config = { icon: Flame, label: 'Gas Natural', style: 'bg-orange-500 hover:bg-orange-600', active: 'default' };
                                        else if (type === 'WATER') config = { icon: Droplet, label: 'Agua', style: 'bg-cyan-600 hover:bg-cyan-700', active: 'default' };
                                        else if (type === 'GASOLINE') config = { icon: Droplet, label: 'Nafta', style: 'bg-amber-600 hover:bg-amber-700', active: 'default' };
                                        else if (type === 'DIESEL') config = { icon: Droplet, label: 'Gasoil', style: 'bg-amber-700 hover:bg-amber-800', active: 'default' };
                                        else if (type === 'LPG') config = { icon: Flame, label: 'GLP', style: 'bg-orange-700 hover:bg-orange-800', active: 'default' };
                                        else if (type === 'FUEL') return null; // Generic placeholder, usually expanded to specific types

                                        if (!config) return null;
                                        const { icon: Icon, label, style } = config;

                                        return (
                                            <Button
                                                key={type}
                                                type="button"
                                                variant={currentServiceType === type ? 'default' : 'outline'}
                                                className={`flex flex-col gap-1 h-14 ${currentServiceType === type ? style : ''}`}
                                                onClick={() => handleServiceTypeChange(type)}
                                            >
                                                <Icon size={16} />
                                                <span className="text-[10px]">{label}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Proveedor <span className="text-red-500">*</span></Label>
                                <Input {...form.register('vendorName')} placeholder="Nombre del proveedor" />
                                {form.formState.errors.vendorName && <p className="text-red-500 text-xs">{form.formState.errors.vendorName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Nro Cliente / Cuenta</Label>
                                <Input {...form.register('clientNumber')} placeholder="Ej. 123456789" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Importe Total</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <Input type="number" step="0.01" className="pl-7" {...form.register('totalAmount')} />
                                    </div>
                                    {form.formState.errors.totalAmount && <p className="text-red-500 text-xs">Requerido (min 0)</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Moneda</Label>
                                    <Input {...form.register('currency')} />
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <Label className="text-brand-primary">Datos de Consumo</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Consumo</Label>
                                        <Input type="number" step="0.01" {...form.register('consumption')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unidad</Label>
                                        <Input {...form.register('unit')} placeholder="kWh / m3" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Inicio Periodo</Label>
                                    <Input type="date" {...form.register('periodStart')} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fin Periodo</Label>
                                    <Input type="date" {...form.register('periodEnd')} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Vencimiento</Label>
                                <Input type="date" {...form.register('dueDate')} />
                            </div>

                            <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-[2]" 
                                    disabled={confirmMutation.isPending}
                                >
                                    <span className={`mr-2 animate-spin ${confirmMutation.isPending ? 'inline-block' : 'hidden'}`}>⏳</span>
                                    Confirmar y Guardar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
