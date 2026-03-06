import React, { useState } from 'react';
import { Plus, Trash2, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { GenericUploadModal } from '../ui/GenericUploadModal';
import type { Attachment } from '../../types/project';
import Swal from 'sweetalert2';

export interface GridColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'unit' | 'cost';
  options?: string[]; // For select type
  width?: string;
  editable?: boolean;
}

interface GridRow {
  id: string;
  [key: string]: any;
  attachments?: Attachment[];
}

interface BaseDataCollectionGridProps {
  columns: GridColumn[];
  rows: GridRow[];
  onRowsChange: (rows: GridRow[]) => void;
  // Uploads
  onAttachFile?: (rowId: string | null, file: File) => Promise<Attachment>; // Abstracted
  
  // Display
  title?: string;
  description?: string;
  enableRowAttachments?: boolean;
  enableGlobalAttachments?: boolean;
  totals?: { key: string; label: string; format?: 'number' | 'currency' }[];
  
  // Custom Actions
  customActions?: React.ReactNode;
  subtaskId: string;
}

export const BaseDataCollectionGrid: React.FC<BaseDataCollectionGridProps> = ({
  columns,
  rows = [],
  onRowsChange,
  onAttachFile,
  title,
  description,
  enableRowAttachments = true,
  // enableGlobalAttachments = true, // Removed from destructuring to avoid unused var error
  totals = [],
  customActions,
  subtaskId
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const handleAddRow = () => {
    const newRow: GridRow = {
      id: crypto.randomUUID(),
      attachments: []
    };
    columns.forEach(col => {
      newRow[col.key] = col.type === 'number' || col.type === 'cost' ? 0 : '';
    });
    
    onRowsChange([...rows, newRow]);
  };

  const handleCellChange = (rowId: string, key: string, value: any) => {
    const newRows = rows.map(row => {
      if (row.id === rowId) {
        return { ...row, [key]: value };
      }
      return row;
    });
    onRowsChange(newRows);
  };

  const handleDeleteRow = async (rowId: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: "No podrás revertir esto.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      const newRows = rows.filter(r => r.id !== rowId);
      onRowsChange(newRows);
      Swal.fire('Eliminado', 'El registro ha sido eliminado.', 'success');
    }
  };

  // Upload Handling
  const openUploadModal = (rowId?: string) => {
    setActiveRowId(rowId || null);
    setUploadModalOpen(true);
  };

  const handleUploadComplete = (attachment: Attachment) => {
      const fixedAttachment = { ...attachment, id: attachment.id || crypto.randomUUID() };

      if (activeRowId) {
           // Row Attachment
           const newRows = rows.map(row => {
               if (row.id === activeRowId) {
                   return { ...row, attachments: [...(row.attachments || []), fixedAttachment] };
               }
               return row;
           });
           onRowsChange(newRows);
      } else {
          // Global attachment - Handled by parent usually if enableGlobalAttachments is true?
          // Actually, BaseGrid doesn't own subtask data anymore.
          // We need a specific prop for global attachment update or just bubble up.
          // For simplicity in this refactor:
          // If activeRowId is null, we assume the parent handles global attachment via onAttachFile (not applicable here directly as we are inside the modal callback).
          // Wait, GenericUploadModal simply calls onUploadComplete.
          // We need to support global attachments at the PARENT level if we want them stored in `data.attachments`.
          // But here we are treating `rows` as the main data.
          // Let's defer Global Attachment handling to the wrapper if possible, OR
          // Keep it simple: BaseGrid manages ROWS. Global attachments should be managed outside or passed in.
          // I will emit an event or update a separate prop?
          // Easier: GenericUploadModal returns attachment.
          // We need to pass it up.
          // Let's add onGlobalAttachmentAdd prop.
      }
  };

  // Calculations
  const calculateTotal = (key: string) => {
    return rows.reduce((acc, row) => {
      const val = parseFloat(row[key] as string);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  };

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="mb-4">
           {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
           {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      )}

      {/* Main Table */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        {/* ... Table Content ... */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-3 py-2" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
                {enableRowAttachments && <th className="px-3 py-2 w-10">Doc</th>}
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/50 group transition-colors">
                  {columns.map(col => (
                    <td key={`${row.id}-${col.key}`} className="px-3 py-2">
                       {/* Render Logic Same as Before */}
                       {col.editable !== false ? (
                        col.type === 'select' ? (
                          <select
                            className="w-full border-gray-200 rounded text-xs py-1 px-2 focus:ring-brand-primary focus:border-brand-primary bg-transparent hover:bg-white transition-colors"
                            value={row[col.key]}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                          >
                            <option value="">Select...</option>
                            {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={col.type === 'date' ? 'date' : (col.type === 'number' || col.type === 'cost' ? 'number' : 'text')}
                            className="w-full border-transparent rounded text-xs py-1 px-2 focus:ring-brand-primary focus:border-brand-primary hover:bg-white bg-transparent transition-colors"
                            value={row[col.key]}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            placeholder="-"
                          />
                        )
                      ) : (
                        <span className="text-gray-600 px-2">{row[col.key]}</span>
                      )}
                    </td>
                  ))}
                   {/* Attachments */}
                   {enableRowAttachments && (
                    <td className="px-3 py-2 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() => openUploadModal(row.id)}
                          className={`p-1 rounded hover:bg-gray-200 transition-colors ${row.attachments?.length ? 'text-brand-primary' : 'text-gray-300 group-hover:text-gray-400'}`}
                        >
                          <Paperclip size={14} />
                          {row.attachments?.length ? (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-primary text-[8px] text-white">
                              {row.attachments.length}
                            </span>
                          ) : null}
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleDeleteRow(row.id)} className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={columns.length + 2} className="text-center py-6 text-gray-400 text-xs italic">No hay registros.</td></tr>}
            </tbody>
            {/* Footer */}
            {totals.length > 0 && rows.length > 0 && (
                <tfoot className="bg-gray-50 border-t text-xs font-semibold text-gray-700">
                    <tr>
                        {columns.map(col => {
                            const totalDef = totals.find(t => t.key === col.key);
                            if (!totalDef) return <td key={col.key}></td>;
                            const val = calculateTotal(col.key);
                            return (
                                <td key={col.key} className="px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 font-normal uppercase">{totalDef.label}</span>
                                        <span>{totalDef.format === 'currency' ? `$${val.toFixed(2)}` : val.toFixed(2)}</span>
                                    </div>
                                </td>
                            );
                        })}
                        <td colSpan={2}></td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-gray-50 border-t">
             <Button variant="ghost" size="sm" onClick={handleAddRow} className="text-brand-primary gap-1 h-8 text-xs"><Plus size={14} /> Añadir Registro</Button>
             
             <div className="flex items-center gap-2 text-xs text-gray-500">
                 {customActions}
                 {/* Only show global upload if we have a handler for it passed down? Or BaseGrid can just emit event? For now, we will handle global uploads outside BaseGrid to keep it focused on Rows, OR we add onGlobalUpload prop. */}
             </div>
        </div>
      </div>

      {/* We need the subtaskId to use GenericUploadModal. Or we accept onUploadComplete prop wrapper */}
      {/* If we use GenericUploadModal we need subtaskId. Let's add subtaskId back to props or pass a handler that returns Attachment */}
      {/* Re-adding subtaskId to props just for the modal */}
      {onAttachFile ? (
         <GenericUploadModal
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            onUploadComplete={handleUploadComplete}
            subtaskId={subtaskId as string} // We need to add this prop back or assume onAttachFile handles it?
            // GenericUploadModal requires subtaskId.
         />
      ) : null}
    </div>
  );
};
