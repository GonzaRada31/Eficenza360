export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  action: string;
  entity: string;
  entityId: string;
  payload: Record<string, unknown>;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export interface AuditLogFiltersData {
    dateRange?: [string, string];
    user?: string;
    action?: string;
    entity?: string;
    tenant?: string;
    search?: string;
    result?: string;
}

export interface PaginatedAuditLogs {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
