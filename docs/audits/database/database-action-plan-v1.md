# Plan de Acción - Base de Datos Eficenza 360
**Versión:** 1.0

Este plan detalla técnica y sistemáticamente cómo resolver la deuda y escalar el almacenamiento para los requerimientos de la plataforma (multi-tenant, deduplicación, grandes volúmenes).

## Fase 1: Remediación Crítica (Estabilidad)

### Tarea 1.1: Refactorización de Consultas Profundas (Deep Includes)
**Objetivo:** Evitar colapsar la memoria del servidor de NodeJS (OOM) en un escenario 10x.
- [ ] En `/projects/projects.service.ts` -> `findAll`, eliminar la inclusión profunda `.include({ modules: { tasks: { subtasks: true } } })`.
- [ ] Modificar el listado de proyectos para que devuelva solo agregados (`_count: { tasks, modules }`) o datos someros del Project.
- [ ] Asegurarse de que el frontend disponga de un endpoint en cascada/lazy-loading para obtener módulos y tareas únicamente cuando el usuario entre al detalle del Proyecto.

### Tarea 1.2: Resolución de Race Conditions (Idempotencia Fuerte)
**Objetivo:** Eliminar fallos 500 por colisión concurrente y sustituirlos por operaciones atómicas.
- [ ] En `/projects/projects.service.ts`, migrar la lógica de "Leer si existe DeduplicationKey -> Crear si no" por la función nativa `upsert` de Prisma, o implementar un bloque `try-catch` que verifique un error código `P2002` (Unique Constraint failed) y en tal caso retornar silenciosamente el recurso creado o recuperarlo.

---

## Fase 2: Escalamiento del Esquema (Optimizaciones DB)

### Tarea 2.1: Índices Compuestos para Multi-tenant Frecuente
**Objetivo:** Evitar chequeos de Bitmap Scan pesados ante alto volumen de datos.
- [ ] En `schema.prisma`, sustituir las ocurrencias de:
  ```prisma
  @@index([tenantId])
  @@index([deletedAt])
  ```
  por un índice compuesto que soporte ambas filtraciones concurrentes (la consulta más usada por el RBAC):
  ```prisma
  @@index([tenantId, deletedAt])
  ```
- [ ] Aplicar este índice compuesto a tablas pesadas: `CarbonRecord`, `ActivityData`, `Invoice`, `Task`, `Subtask`.

### Tarea 2.2: Constraints Únicos para Facturación (Evitar Doble Inserción)
**Objetivo:** Impedir contaminación de métricas de CO2 porque un usuario subió dos veces la factura de la misma empresa proveedora para el mismo mes.
- [ ] En `schema.prisma`, añadir una restricción lógica temporal o una Foreign Constraint virtual (si los datos vienen de Azure OCR) en el modelo `Invoice` que impida la inserción de: `[tenantId, vendorTaxId, periodStart, periodEnd]`.
- [ ] En caso de imposibilidad técnica por OCR errático, incorporar un "Warning Flag" de duplicidad probable generado por backend vía un Job recurrente.

---

## Fase 3: Integridad Logica (Middleware y Borrados)

### Tarea 3.1: Prisma Extension para Soft Delete Global
**Objetivo:** Delegar automágicamente la filtración continua de datos eliminados.
- [ ] Adicional a la extensión requerida en la Fase 1 arquitectónica (para el Multi-Tenant `tenantId`), configurar Prisma Client Extensions para alterar los `findMany`, `findFirst` de forma tal que siempre se inyecte subyacentemente `where: { deletedAt: null }`.
- [ ] Esto depurará del código base cientos de líneas manuales, disminuyendo riesgos de fuga de registros purgados.
