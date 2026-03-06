import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { InvoiceQueueItem } from '../../types/invoice';
import { Loader2 } from 'lucide-react';

interface ManualEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InvoiceQueueItem | null;
  serviceType: string;
  onSave: (id: string, data: Record<string, unknown>) => Promise<void>;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  open,
  onOpenChange,
  item,
  serviceType,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    periodStart: '',
    periodEnd: '',
    totalAmount: '',
    consumption: '',
    unit: 'm3', // default
    vendorName: '',
    fuelType: '', // For Combustibles
    serviceCategory: '', // For Other
  });

  useEffect(() => {
    if (open && item) {
       // Initialize/Reset form
       setFormData({
            periodStart: '',
            periodEnd: '',
            totalAmount: '',
            consumption: '',
            unit: serviceType === 'FUEL' || serviceType === 'GASOLINE' || serviceType === 'DIESEL' ? 'liters' : 
                  serviceType === 'GAS_NATURAL' ? 'm3' : 'units',
            vendorName: '',
            fuelType: serviceType === 'DIESEL' ? 'DIESEL' : serviceType === 'GASOLINE' ? 'GASOLINE' : '', 
            serviceCategory: serviceType === 'OTHER' ? 'GENERAL' : '',
       });
    }
  }, [open, item, serviceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    try {
      // Construct payload compatible with backend expected structure
      const payload = {
        ...formData,
        // Map types if necessary or pass specific fields
        serviceType: formData.fuelType || serviceType, // Use specific fuel type if selected
        source: 'manual',
      };
      
      await onSave(item.id, payload);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save manual data', error);
    } finally {
      setLoading(false);
    }
  };

  const isFuel = serviceType === 'FUEL' || serviceType === 'DIESEL' || serviceType === 'GASOLINE';
  const isOther = serviceType === 'OTHER';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Completar Datos Manualmente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            
            {/* Type Selection for Fuels */}
            {isFuel && (
                <div className="space-y-2">
                    <Label>Tipo de Combustible</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.fuelType} 
                        onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    >
                        <option value="" disabled>Seleccione combustible</option>
                        <option value="GASOLINE">Nafta / Gasolina</option>
                        <option value="DIESEL">Gasoil / Diesel</option>
                    </select>
                </div>
            )}

            {isOther && (
                 <div className="space-y-2">
                    <Label>Categoría / Descripción</Label>
                    <Input 
                        value={formData.serviceCategory}
                        onChange={e => setFormData({...formData, serviceCategory: e.target.value})}
                        placeholder="Ej. Leña, Carbón..."
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Input 
                        type="date" 
                        required 
                        value={formData.periodStart}
                        onChange={e => setFormData({...formData, periodStart: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Fecha Fin/Carga</Label>
                    <Input 
                        type="date" 
                        required 
                        value={formData.periodEnd}
                        onChange={e => setFormData({...formData, periodEnd: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Consumo</Label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            step="0.01" 
                            required 
                            className="flex-1"
                            value={formData.consumption}
                            onChange={e => setFormData({...formData, consumption: e.target.value})}
                        />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Unidad</Label>
                    <Input 
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                        placeholder="Unidad"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Importe Total</Label>
                 <Input 
                    type="number" 
                    step="0.01" 
                    required 
                    prefix="$"
                    value={formData.totalAmount}
                    onChange={e => setFormData({...formData, totalAmount: e.target.value})}
                />
            </div>
            
            <div className="space-y-2">
                <Label>Proveedor</Label>
                 <Input 
                    value={formData.vendorName}
                    onChange={e => setFormData({...formData, vendorName: e.target.value})}
                />
            </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand-primary text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
