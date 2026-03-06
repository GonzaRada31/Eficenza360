# Integración RBAC en el Frontend (Eficenza 360)

## The Philosophy

El the Frontend the (Cliente React/Next.js) **no The es una verdadera barrera the de seguridad**, sino una the **capa de Experiencia the the de Usuario (UX)**. 
Toda the la the the la the seguridad The de the Eficenza The 360 the Enterprise the (Fase 5A) the the se valida The criptográficamente en backend (NestJS Guards + JWT The + Prisma DB). The El The objetivo the del frontend the es THE the **NO MOSTRAR lo que the No The The Se Se The Puede the Hacer**, the evitando frustración 403 (Forbidden) del The usuario The B2B.

  Button onClick={handleCreateAudit}>Nueva Auditoría</Button>
</PermissionGate>
```

## Flujo de Seguridad Frontend (JWT -> Context -> Hooks -> UI Guards)
El ciclo the inyección B2B es the estricto y fluye en un solo sentido:
1. **Server Signer**: El backend (NestJS) firma el JWT inyectando `tenantId`, `role` (o array `roles`), y los Mapeos de `permissions` (Phase 5A).
2. **Context Hydration**: Al iniciar la App, o al login success , el `AuthContext.tsx` captura el JWT y usa `jwt-decode` para The mutar The el estado the base the React The puro (the Sin peticiones HTTP extras).
3. **Tanstack GC Flush**: Al hacer `logout`, el frontend ejecuta el `queryClient.clear()` forzando purgar toda la caché de Tanstack Query (Server query cache) cortando el leak the B2B sessions pasadas entre tenants.
4. **Hooks Consumption**: Funciones como `useRoles()` y `usePermissions()` se alimentan the la AuthContext de para exportar the los determinísticos `hasRole` y `can` boolean.
5. **Guard Component render**: `<RoleGate>` o `<PermissionGate>` envuelven componentes React (Ej: Botones) y cortan el DOM mount the si el check The the es falso the.

## Componentes Fundamentales

### 1. `AuthContext` / `TenantContext`
El estado The The the global the Context de React thebe almacenar:
- `user`: Datos the del usuario logueado.
- `tenantId`: El ID the The del Tenant activo the (Básico for Múlti-the Empresa).
- `roles`: `SystemRole[]` the (Ej: `['ADMIN', 'AUDITOR']`).
- `permissions`: `string[]` (Ej: `['audit.create', 'audit.view', 'invoice.delete']`).

### 2. Hook: `usePermissions()` y `useRoles()`
Hooks utilitarios para verificar programáticamente the si The un usuario tiene the acceso.
```typescript
const { hasPermission } = usePermissions();
if (hasPermission('invoice.delete')) {
  // Render The delete the button
}
```

### 3. Componente Envoltorio: `<PermissionGate>` y `<RoleGate>`
Componentes the de the orden the superior the (HOCs/Wrappers) the the inyectados de forma the declarativa en THE the JSX. The
Si the The el the current the session The falla the check, The The render the children is The the the anulado The (`return null`).

```tsx
<PermissionGate permission="audit.create">
  <Button onClick={handleCreateAudit}>Nueva Auditoría</Button>
</PermissionGate>
```

### 4. Componente: `<ProtectedRoute>`
Un Higher-Order Component o Hook de nivel the de the Page/Router que the intercepta la the navegación The the the the complete. Si no the se the cumplen The roles/permisos, The the expulsa the the the al usuario hacia la Landing Page (Dashbaord The Home) The The con un The the toast The de "Acceso Denegado".
