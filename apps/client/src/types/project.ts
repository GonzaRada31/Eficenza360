
export interface Attachment {
  id: string;
  fileName: string;
  blobName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  sasUrl?: string; // transient
}

export interface SubtaskData {
  text?: string;
  value?: number;
  date?: string;
  selectedOption?: string;
  fileName?: string;
  fileUrl?: string; // Legacy support
  attachments?: Attachment[]; // New array
  // Allow for other dynamic fields and file upload handling
  [key: string]: unknown;
}

export interface Subtask {
  id: string;
  title?: string;
  description: string;
  isCompleted: boolean;
  startDate?: string;
  endDate?: string;
  parentSubtaskId?: string;
  childSubtasks?: Subtask[];
  inputType?:
    | "TEXT"
    | "NUMBER"
    | "DATE"
    | "FILE_UPLOAD"
    | "SELECT"
    | "TABLE"
    | "CHECKLIST"
    | "INVOICE_MANAGER";
  outputContext?: string[];
  inputContext?: string[];
  standard?: string;
  isActive?: boolean;
  deduplicationKey?: string;
  type?: string;
  data?: SubtaskData;
  evidenceUrl?: string;
  workspaceMode?: 'INVOICE' | 'checklist' | 'standard';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  subtasks?: Subtask[];
  startDate?: string;
  endDate?: string;
}

export interface ProjectModule {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  status: string;
  description?: string;
  standard?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  company: {
    name: string;
  };
  tasks?: Task[];
  modules: ProjectModule[];
  stats: {
    progress: number;
    totalTasks: number;
    completedTasks: number;
    nextTask?: Task;
  };
}
