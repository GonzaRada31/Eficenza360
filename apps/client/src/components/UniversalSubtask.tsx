import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { getSubtaskRenderer } from './data-collection/SubtaskRendererRegistry';
import type { Subtask, SubtaskData, Attachment } from '../types/project';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Paperclip, FileText, Eye, Trash2 } from 'lucide-react';
import { InvoiceManager } from './invoices/InvoiceManager';
import { SubtaskTitle } from './ui/SubtaskTitle';
import { AttachmentButton } from './ui/AttachmentButton';
import { GenericUploadModal } from './ui/GenericUploadModal';
import { useAttachments } from '../hooks/useAttachments';
import { Plus } from 'lucide-react';

interface UniversalSubtaskProps {
  subtask: Subtask;
  onToggle: (id: string, isCompleted: boolean) => void;
  onAddSubtask: (parentId: string) => void;
  onUpdateData?: (id: string, data: SubtaskData) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  level: number;
  children?: React.ReactNode;
  sharedDataMap?: Record<string, Subtask[]>;
}

export const UniversalSubtask: React.FC<UniversalSubtaskProps> = ({
  subtask,
  onToggle,
  onAddSubtask,
  onUpdateData,
  onToggleActive,
  level,
  children,
  sharedDataMap
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const { deleteFile } = useAttachments();
  const isActive = subtask.isActive ?? true;
  // STRICT ARCHITECTURE: Only check workspaceMode. No fallbacks.
  const workspaceMode = subtask.workspaceMode || 'standard'; 
  
  const sharedResources = sharedDataMap ? sharedDataMap[subtask.id] : undefined;

  const handleUploadComplete = (attachment: Attachment) => {
    const currentAttachments = subtask.data?.attachments || [];
    // Fix: Backend response lacks ID, generate one for client-side tracking
    const newAttachment = { ...attachment, id: attachment.id || crypto.randomUUID() };
    
    const newData = {
      ...subtask.data,
      attachments: [...currentAttachments, newAttachment]
    };
    onUpdateData?.(subtask.id, newData);
    setShowUpload(false); 
  };

  const handleDeleteAttachment = async (attachmentId: string, blobName: string) => {
      const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: "Esta acción eliminará el archivo permanentemente.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) return;

      try {
          await deleteFile(blobName);
          // Update local state
          const currentAttachments = subtask.data?.attachments || [];
          const newData = {
              ...subtask.data,
              attachments: currentAttachments.filter(a => a.id !== attachmentId)
          };
          onUpdateData?.(subtask.id, newData);
          
          Swal.fire(
              '¡Eliminado!',
              'El archivo ha sido eliminado.',
              'success'
          );
      } catch (err) {
          console.error("Failed to delete attachment", err);
          Swal.fire(
              'Error',
              'Hubo un problema al eliminar el archivo.',
              'error'
          );
      }
  };



  const renderContent = () => {
    // 1. Data Collection Registry Check
    const CustomRenderer = getSubtaskRenderer(subtask.deduplicationKey);
    if (CustomRenderer) {
        return (
            <div className="mt-4">
                <CustomRenderer 
                    subtask={subtask} 
                    onUpdateData={onUpdateData ?? (() => {})} 
                />
            </div>
        );
    }

    // 2. Invoice Mode
    if (workspaceMode === 'INVOICE') {
      const serviceType = 
          subtask.title?.toLowerCase().includes('gas natural') ? 'GAS_NATURAL' :
          subtask.title?.toLowerCase().includes('gasoil') ? 'DIESEL' :
          subtask.title?.toLowerCase().includes('diesel') ? 'DIESEL' :
          subtask.title?.toLowerCase().includes('nafta') ? 'GASOLINE' :
          subtask.title?.toLowerCase().includes('gasolina') ? 'GASOLINE' :
          subtask.title?.toLowerCase().includes('glp') ? 'LPG' :
          subtask.title?.toLowerCase().includes('combustible') ? 'FUEL' :
          subtask.title?.toLowerCase().includes('gas') ? 'GAS_NATURAL' :
          subtask.title?.toLowerCase().includes('agua') ? 'WATER' :
          subtask.title?.toLowerCase().includes('water') ? 'WATER' : 'ELECTRICITY';
      
      const allowedServiceTypes = (subtask.data as SubtaskData & { allowedServiceTypes?: string[] })?.allowedServiceTypes;

      return (
        <div className="mt-2 pl-4 border-l-2 border-brand-primary/20">
             <InvoiceManager 
                subtaskId={subtask.id} 
                serviceType={serviceType}
                allowedServiceTypes={allowedServiceTypes}
             />
        </div>
      );
    }

    // 3. Checklist Mode
    if (workspaceMode === 'checklist') {
        return (
             <div className="mt-2 pl-4">
                {subtask.inputType === 'CHECKLIST' && (
                     <div className="space-y-1">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="rounded text-brand-primary focus:ring-brand-primary"
                                defaultChecked={(subtask.data?.value as number) === 1}
                                onChange={(e) => onUpdateData?.(subtask.id, { ...subtask.data, value: e.target.checked ? 1 : 0 })}
                            />
                            <span>Marcar como verificado</span>
                        </label>
                    </div>
                )}
             </div>
        );
    }

    // 4. Standard/Default Mode (Technical Editor + Attachments)
    return (
      <div className="mt-3 space-y-4 pl-2">
        {/* Technical Text Editor */}
        <div className="relative">
             <textarea 
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary/20 min-h-[80px] p-3 leading-relaxed" 
                placeholder="Ingrese detalles técnicos, observaciones o notas..."
                defaultValue={subtask.data?.text}
                onBlur={(e) => onUpdateData?.(subtask.id, { ...subtask.data, text: e.target.value })}
            />
            <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">Markdown supported</div>
        </div>

        {/* Attachments Section */}
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50/50">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <Paperclip size={12} /> Documentación Adjunta
            </h4>
            
            {/* List */}
            <div className="space-y-2 mb-3">
                {subtask.data?.attachments?.map((file) => (
                    <div key={file.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className="text-gray-400" />
                            <span className="truncate max-w-[200px] font-medium text-gray-700">{file.fileName}</span>
                            <span className="text-gray-400 text-[10px]">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <div className="flex items-center gap-1">
                             {file.sasUrl && (
                                <a href={file.sasUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors" title="Ver archivo">
                                    <Eye size={14} />
                                </a>
                             )}
                             {/* Delete Button */}
                             {file.blobName && (
                                 <button 
                                     onClick={() => handleDeleteAttachment(file.id, file.blobName)}
                                     className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                                     title="Eliminar adjunto"
                                 >
                                     <Trash2 size={14} />
                                 </button>
                             )}
                        </div>
                    </div>
                ))}
                
                {/* Legacy fileUrl support */}
                {!subtask.data?.attachments?.length && subtask.data?.fileName && (
                     <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className="text-gray-400" />
                            <span className="truncate max-w-[200px] font-medium text-gray-700">{subtask.data.fileName}</span>
                            <span className="text-gray-400 text-[10px]">(Legacy)</span>
                        </div>
                         {subtask.data.fileUrl && (
                                <a href={subtask.data.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors">
                                    <Eye size={14} />
                                </a>
                         )}
                    </div>
                )}

                {!subtask.data?.attachments?.length && !subtask.data?.fileName && !showUpload && (
                    <div className="text-xs text-gray-400 italic pl-1">No hay documentos adjuntos.</div>
                )}
            </div>

            {/* Upload Action */}
                <div className="mt-2">
                    <AttachmentButton onClick={() => setShowUpload(true)} />
                </div>

            <GenericUploadModal 
                open={showUpload}
                onOpenChange={setShowUpload}
                onUploadComplete={handleUploadComplete}
                subtaskId={subtask.id}
            />
        </div>

        {/* Dynamic Inputs (Select/Date/Number) preserved for specific data needs */}
        {subtask.inputType === 'NUMBER' && (
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    className="w-32 text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary/20" 
                    placeholder="0.00" 
                    defaultValue={subtask.data?.value}
                    onBlur={(e) => onUpdateData?.(subtask.id, { ...subtask.data, value: parseFloat(e.target.value) })}
                />
                <span className="text-xs text-gray-500">unidades</span>
            </div>
        )}
         {subtask.inputType === 'DATE' && (
            <input 
                type="date" 
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary/20" 
                defaultValue={subtask.data?.date}
                onBlur={(e) => onUpdateData?.(subtask.id, { ...subtask.data, date: e.target.value })}
            />
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${!isActive ? 'opacity-50 grayscale' : ''} mb-2`}>
        <div className="flex items-start gap-2 hover:bg-gray-50 p-2 rounded-lg group relative transition-colors border border-transparent hover:border-gray-100">
            {/* Indent / Expand */}
            <div style={{ marginLeft: `${level * 16}px` }} className="flex-shrink-0 pt-1">
                 <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-gray-600 transition-colors">
                     {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                 </button>
            </div>

            {/* Status Checkbox */}
            <button 
                onClick={() => onToggle(subtask.id, !subtask.isCompleted)}
                className={`flex-shrink-0 mt-0.5 transition-colors ${subtask.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
            >
                {subtask.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>

            {/* Header Content */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                     <SubtaskTitle 
                        title={subtask.title || 'Sin título'} 
                        isCompleted={subtask.isCompleted} 
                    />
                    {subtask.standard && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-medium">
                            {subtask.standard}
                        </span>
                    )}
                </div>
                {subtask.description && (
                     <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{subtask.description}</p>
                )}
                
                {/* Shared Resources Warning - PORTED FROM RECURSIVE LIST */}
                {sharedResources && sharedResources.length > 0 && (
                    <div className="mt-1 p-2 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-800">
                        <div className="font-semibold flex items-center gap-1 mb-1">
                            🔗 Datos compartidos disponibles:
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5">
                            {sharedResources.map(res => (
                                <li key={res.id}>
                                    <span className="font-medium">{res.title}:</span> {res.data?.fileName ? (
                                        <a href={res.data.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-900 ml-1">
                                            {res.data.fileName}
                                        </a>
                                    ) : (
                                        <span className="italic opacity-70 ml-1">Sin archivo ({(res.data && JSON.stringify(res.data)) || 'vacío'})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Render Expandable Content Body */}
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded && isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {renderContent()}
                </div>
            </div>

             {/* Actions */}
             <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-start pt-1">
                {/* Active Toggle - RESTORED */}
                {onToggleActive && (
                    <button
                        onClick={() => onToggleActive(subtask.id, !isActive)}
                        className={`p-1 rounded ${isActive ? 'text-gray-400 hover:text-gray-600' : 'text-red-400 hover:text-red-600'}`}
                        title={isActive ? "Desactivar tarea" : "Activar tarea"}
                    >
                        <div className="w-3.5 h-3.5 border rounded-full flex items-center justify-center border-current">
                            {!isActive && <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                        </div>
                    </button>
                )}

                <button 
                    onClick={() => onAddSubtask(subtask.id)}
                    className="p-1 text-gray-400 hover:text-brand-primary rounded"
                    title="Agregar subtarea"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
        
        {/* Children Recursion */}
        {isExpanded && children}
    </div>
  );
};
