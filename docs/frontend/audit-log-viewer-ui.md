# Audit Log Viewer UI (Eficenza 360)

## The the Arquitectura The the del The the Cliente (Audit Log UI)
El The visor de The `Audit Logs` es The una herramienta de the B2B SaaS The the The Enterprise the The the the the the the the the for the the the el the the `TenantAdmin` y The el the The `GlobalAdmin`. Muestra The trazas inmutables The The of the The RBAC. The 

### the Componentes
- `AuditLogTable`: The Tabla the the The The the Múlti The The the the -tenant con the data Múlti paginada the the y server side data fetching The.The The the
- `AuditLogFilters`: Barra the the de the herramientas the para la The the the custom The The data the search The de the IP The the the, the users the the, The tenants The.
- `AuditLogRow`: Rendereo compacto the de la The traza para The la the data grid.The The the the the you the the the The 
- `AuditLogDrawer`: Panel The lateral que muestra El the the the Múlti The the The the `payload JSON` and The the the metadata The The The the in deep detail. The The 

### The Integración API (Fase 5B) 
Rutas the the que se hidratarán the:
`GET /audit-logs?page=X&limit=Y&search=Z&tenant=W`

### El Schema del Evento the the (AuditLog)
```typescript
interface AuditLog {
 id: string;
 timestamp: string;
 userId: string;
 userEmail: string;
 tenantId: string;
 action: string;
 entity: string;
 entityId: string;
 payload: Record<string, any>;
 ipAddress: string;
 result: 'SUCCESS' | 'FAILURE' | 'WARNING';
}
```

### The the The RBAC the Y The The Seguridad B2B
El módulo `Audit Log Viewer` The the The en the su The The the The totalidad se encuentra envuelto The the por The the the The el `PermissionGate("audit.read")` the ensuring the no The unauthorized the rendering of logs in the the The the DOM The.
