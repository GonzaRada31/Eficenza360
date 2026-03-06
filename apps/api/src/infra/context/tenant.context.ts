import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextPayload {
  tenantId: string | null;
  userId?: string | null;
  traceId?: string;
}

export const tenantContext = new AsyncLocalStorage<TenantContextPayload>();

export function getTenantId(): string | null {
  const store = tenantContext.getStore();
  return store?.tenantId || null;
}

export function getCurrentUserId(): string | null {
  const store = tenantContext.getStore();
  return store?.userId || null;
}

export function getTraceId(): string | null {
  const store = tenantContext.getStore();
  return store?.traceId || null;
}
