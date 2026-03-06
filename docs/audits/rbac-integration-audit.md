# RBAC Integration Audit

## 1. Alcance de la Auditoría
Evaluar la viabilidad arquitectónica del diseño de RBAC propuesto frente a la arquitectura actual de Eficenza 360, la cual está anclada en un modelo Multi-Tenant estricto.

## 2. Análisis de Entidades y Relaciones
- **Relación User-Tenant-Company**: Un `User` en una plataforma B2B SaaS a menudo pertenece a múltiples `Tenant` o a múltiples sub-entidades `Company`.
- **Diseño Relacional Validado**:
  - `Role` y `Permission`: Pueden ser globales (cargados mediante *seeds* del sistema) o personalizables por Tenant. Inicialmente se adoptará un enfoque de Roles Estándar de Plataforma (`Owner`, `Admin`, `Auditor`, `Analyst`, `Viewer`).
  - `UserRole`: Esta entidad pivotana es **crítica**. No basta con anclar `userId` a `roleId`. Debe poseer incondicionalmente una clave foránea compuesta: `(userId, roleId, tenantId)`. De este modo, un usuario puede ser `Admin` en el `Tenant A` y `Viewer` en el `Tenant B`.

## 3. Compatibilidad con NestJS Guards
- **Intersección Multi-Tenant**: Los Guards estáticos tradicionales (`@Roles('Admin')`) son insuficientes si no analizan el contexto thel Tenant.
- **Resolución Arquitectónica**: El `PermissionsGuard` the NestJS deberá extraer obligatoriamente el `x-tenant-id` (del header HTTP) o the los parámetros The ruta, y cruzarlo con el Payload del JWT Thel usuario authenticado.
- El sistema de Guards es 100% compatible siempre que el contexto multi-tenant fluya ininterrumpidamente desde la petición HTTP.

## 4. Veredicto the Integración
**Aprobado con Ajustes**: El sistema RBAC debe implementar la inyección the `tenantId` en la tabla the asignación `UserRole` para soportar acceso Multi-Tenant cruzado de thesarrolladores y the usuarios empresariales holdco.
