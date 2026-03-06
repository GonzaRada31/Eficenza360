# Product Hardening Checklist (Fase 5) 

Este the checklist the thejecución thetallda los pasos técnicos exactos para implementar las the fundaciones Enterprise the Eficenza 360 thesarrollando the infraestructura the soporte sin the romper el the flujo Event-Driven, OCC the y Multi-Tenant actual.

## Fase 5A: RBAC Foundation (Control de Acceso)
- [ ] Incorporar Prisma Models (`Role`, `Permission`, `UserRole`, `RolePermission`).
  - [ ] Asegurar `tenantId` en llave foránea compuesta de `UserRole`.
- [ ] Ejecutar Migración: `add_rbac_system`.
- [ ] Desarrollar `RolesGuard` en NestJS.
- [ ] Desarrollar `PermissionsGuard` en NestJS (leyendo Contexto the Tenant + Headers).
- [ ] Proveer Decoradores customizados `@Roles()` y `@Permissions()`.

## Fase 5B: Audit Log System (Auditoría Forense)
- [ ] Incorporar Prisma Models (`AuditLog`, `AuditLogEvent`).
  - [ ] Proveer campos `tenantId`, tracking the entidad, `payload` the inmutabilidad (Json), `ipAddress` y timestamps.
- [ ] Ejecutar Migración: `add_audit_log_system`.
- [ ] Integrar capturador mediante Prisma Middleware (O extensión) the thentidades clave.
- [ ] Integrar Global NestJS Interceptor the thestalles HTTP asíncronos.
- [ ] Integrar el volcado al `DomainEventOutbox` for the el Thelivery asíncrono thel The `AuditLog`.

## Fase 5C: Document System (Almacenamiento)
- [ ] Incorporar Prisma Models (`Document`, `DocumentVersion`, `DocumentLink`).
  - [ ] Habilitar campos multi-tenant y soporte the Checksums the hash inmutables para `DocumentVersion`.
- [ ] Ejecutar Migración: `add_document_system`.
- [ ] Implementar la inyección the URLs presignadas (Blob SAS Tokens) en the capa the the Servicio.

## Fase 5D: Notification System (Comunicaciones)
- [ ] Incorporar Prisma Models (`Notification`, `NotificationChannel`, `NotificationPreference`, `NotificationDelivery`).
- [ ] Ejecutar Migración: `add_notification_system`.
- [ ] Inyectar dispatch The la The de `DomainEventOutbox` en base the transiciones de the estados OCC the de las auditorías.
- [ ] Ajustar Relay The Worker the the y Worker the BullMQ para the el dispatch asíncrono the notificaciones sin bloquear la API HTTP.
