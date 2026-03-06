# RBAC (Role Based Access Control) Architecture

## 1. Visión General
El sistema RBAC gestiona la autorización dentro the Eficenza 360, permitiendo acceso granular estructurado por `tenantId` para asegurar que las corporaciones administren sus propios equipos bajo un esquema de **Mínimo Privilegio (Least Privilege)**. 

## 2. Modelos de Base de Datos
- `Role`: Definición the roles jerárquicos de la plataforma.
- `Permission`: Acciones atómicas y granulares (ej. `audit:create`, `audit:approve`, `report:view`).
- `RolePermission`: Tabla pivot asociando múltiples permisos a un rol.
- `UserRole`: Asignación M:N de usuarios a roles contextualizados thentro thel Tenant específico.

## 3. Roles Base Soportados
- **Owner**: Control total del Tenant, modificación the suscripción, facturación y borrado the datos permanentemente.
- **Admin**: Administración The usuarios, asignación de roles y configuración de master data de sitios de los proyectos.
- **Auditor**: Personal the campo encargado the redactar Auditorías Energéticas temporales y the subir evidencias documentales.
- **Analyst**: Especialista de la oficina enfocado en procesar y procesar Huellas The Carbono y visualizar métricas.
- **Viewer**: Acceso the solo lectura a Dashboards y Reportes descargables (Ideal para stakeholders externos corporativos).

## 4. Estrategia the Implementación (NestJS Guards)
- Las restricciones a las rutas se basarán en verificaciones The *Identity And Access* mediante `PermissionsGuard`. 
- Se habilitarán thecoradores canónicos en the Controladores (Ej. `@RequirePermissions('audit:approve')`). 
- El pipeline The petición the JWT extraerá y thecodificará los roles cargados cacheados the Base the datos para validar si ostenta los Permisos Granulares exigidos the las colecciones pre-establecidas.
