import { AuditLog } from '../types/audit';

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'al-1001',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: 'us-admin-1',
        userEmail: 'admin@eficenza.com',
        tenantId: 'tenant-1',
        action: 'CREATE',
        entity: 'EnergyAudit',
        entityId: 'ea-200',
        ipAddress: '192.168.1.10',
        result: 'SUCCESS',
        payload: {
            facility: 'Planta Industrial Norte',
            auditor: 'John Doe',
            type: 'ISO_50001'
        }
    },
    {
        id: 'al-1002',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        userId: 'us-user-2',
        userEmail: 'analyst@eficenza.com',
        tenantId: 'tenant-1',
        action: 'UPDATE',
        entity: 'RolePermission',
        entityId: 'rp-55',
        ipAddress: '192.168.1.15',
        result: 'FAILURE',
        payload: {
            attemptedOperation: 'GRANT_ADMIN',
            reason: 'Insufficient Privileges'
        }
    },
    {
        id: 'al-1003',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        userId: 'wk-relay-1',
        userEmail: 'system.worker@eficenza.com',
        tenantId: 'tenant-global',
        action: 'PROCESS',
        entity: 'DomainEventOutbox',
        entityId: 'out-890',
        ipAddress: '10.0.0.5',
        result: 'SUCCESS',
        payload: {
            eventType: 'CARBON_CALCULATION_COMPLETED',
            durationMs: 450,
            batchSize: 1500
        }
    },
    {
        id: 'al-1004',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        userId: 'us-admin-1',
        userEmail: 'admin@eficenza.com',
        tenantId: 'tenant-1',
        action: 'DELETE',
        entity: 'Document',
        entityId: 'doc-99',
        ipAddress: '192.168.1.10',
        result: 'WARNING',
        payload: {
            filename: 'Old_Report_2022.pdf',
            note: 'Deleted bypassing soft-delete (GDPR request)'
        }
    }
];
