import React from 'react';
import { useGetInvoices, type Invoice } from '../../modules/invoices/useInvoice';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Eye, AlertCircle, CheckCircle, BrainCircuit, Zap, Flame, Droplet, Box } from 'lucide-react';
// Import Badge component
import { Badge } from '../ui/badge.tsx';

interface InvoiceListProps {
    subtaskId: string;
    refreshTrigger: number;
    onView: (id: string, invoice: Invoice) => void; // Pass full object to avoid refetching for now
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ subtaskId, refreshTrigger, onView }) => {
    const { data: invoices, isLoading, isError, error, refetch } = useGetInvoices(subtaskId);

    // React to refreshTrigger
    React.useEffect(() => {
        refetch();
    }, [refreshTrigger, refetch]);

    const getServiceIcon = (type?: string) => {
        switch (type) {
            case 'GAS': return <Flame size={16} className="text-orange-500" />;
            case 'FUEL': return <Droplet size={16} className="text-amber-600" />;
            case 'WATER': return <Droplet size={16} className="text-blue-400" />;
            case 'OTHER': return <Box size={16} className="text-gray-500" />;
            case 'ELECTRICITY': 
            default: return <Zap size={16} className="text-blue-600" />;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando facturas...</div>;
    }

    if (isError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error al cargar facturas.</p>
                <p className="text-xs mt-2 text-gray-500">
                    {err?.response?.data?.message || err?.message || 'Error desconocido'}
                </p>
                <p className="text-xs text-gray-400">Status: {err?.response?.status}</p>
            </div>
        );
    }

    if (!invoices || invoices.length === 0) {
        return <div className="p-8 text-center text-gray-500">No hay facturas registradas.</div>;
    }

    return (
        <div className="w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-right">Consumo</TableHead>
                        <TableHead className="text-right">Costo</TableHead>
                        <TableHead className="text-center">IA Stats</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(invoices) ? invoices.map((inv: Invoice) => (
                        <TableRow key={inv.id} className="hover:bg-gray-50/50">
                            <TableCell>
                                {inv.processingStatus === 'COMPLETED' ? (
                                    <Badge key="completed" variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 gap-1">
                                        <CheckCircle size={12} /> Procesado
                                    </Badge>
                                ) : (
                                    <Badge key="pending" variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200 gap-1">
                                        <AlertCircle size={12} /> Pendiente
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">
                                {inv.periodEnd ? new Date(inv.periodEnd).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getServiceIcon(inv.serviceType)}
                                    <span>{inv.vendorName || 'Desconocido'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {inv.consumption ? `${inv.consumption.toLocaleString()} ${inv.unit || ''}` : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {inv.totalAmount ? `$${inv.totalAmount.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                                {inv.source === 'ai' && (
                                    <div className="flex items-center justify-center gap-1 text-xs text-brand-primary" title="Processed by AI">
                                        <BrainCircuit size={14} />
                                        {inv.aiConfidence ? `${(inv.aiConfidence * 100).toFixed(0)}%` : ''}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => onView(inv.id, inv)}>
                                    <Eye size={16} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-red-500">
                                {(() => {
                                    console.error('InvoiceList Error: invoices is not an array', invoices);
                                    return 'Error: Formato de datos inválido';
                                })()}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
