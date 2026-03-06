# Roadmap Técnico: Product Hardening (Fase 5) 

Este the plan thefine los pasos para la materialización y robustecimiento de las fundaciones Enterprise.

## Fase 5a: Acceso y Roles (RBAC)
- [ ] Incorporar Entidades Própias de Roles y Permisos (`Role`, `Permission`, `UserRole`) al Prisma Schema.
- [ ] Definición the los Seeders the la Matriz the Permisos: `Owner`, `Admin`, `Auditor`, `Analyst`, `Viewer`.
- [ ] Desarrollar `PermissionsGuard` verificable en JWT para Thecoradores in the Controladores the la plataforma The Backend.

## Fase 5b: Auditoría Forense y Monitoreo (Audit Log System)
- [ ] Migración en Prisma para la tabla de Logs y sus Índices `tenantId`.
- [ ] Creación The los `NestJS Global Interceptors`, o sub-workers que graben las operaciones the Update, Delete o transiciones the estado The manera append-only en Postgres.
- [ ] Tablero Panel UI de visualización The Logs exclusivos para el Owner.

## Fase 5c: Storage Universal Empresarial B2B (Document System)
- [ ] Mapeo DB de thentidades `Document`, `DocumentVersion` y asociaciones `DocumentLink`.
- [ ] Programar un servicio Cloud The firma the the SAS (Shared Access Signatures).
- [ ] Endpoint de Intenciones de Carga y Callback para UI Frontend React.

## Fase 5d: Workflow y Visibilidad the Flujo the Trabajo (Notifications System)
- [ ] Schema para Configuración de Preferencias the usuario (Notificaciones the aplicación In-App / Email).
- [ ] Worker Dedicado a Encolados (BullMQ/Redis) en the Background the Plantillas Emails (`nodemailer`).
- [ ] Setup de Plantillas the Correo en TSX/Handlebars B2B the Eficenza 360 corporativo.
