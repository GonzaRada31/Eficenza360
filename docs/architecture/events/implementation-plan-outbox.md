# IMPLEMENTATION PLAN: FASE 2 OUTBOX PATTERN

Este documento define la inserción en código del Contrato Enterprise de Eventos Asíncronos.  
**Objetivo:** Transcribir el modelo Outbox a Prisma, modificar el servicio de validación de auditoría, y preparar el esqueleto del Consumer Idempotente.

## Cambios Propuestos

### 1️⃣ Database (Prisma Schema)

#### [MODIFY] `apps/api/prisma/schema.prisma`
1.  **Nuevo Enum:**
    ```prisma
    enum OutboxStatus {
      PENDING
      PROCESSING
      PROCESSED
      FAILED
    }
    ```
2.  **Nueva Tabla Originadora (`DomainEventOutbox`):**
    -   `id` (UUID), `tenantId` (UUID)
    -   `eventType` (String "ENERGY_AUDIT_VALIDATED")
    -   `payload` (JsonB)
    -   `status` (OutboxStatus @default(PENDING))
    -   `retryCount` (Int @default(0))
    -   `lockedAt` (DateTime? - Para mecanismo *Zombie Lock*)
    -   `errorReason` (String?)
    -   `createdAt`, `updatedAt`, `processedAt`
    -   Índices: `@@index([tenantId])`, `@@index([status, createdAt])`, `@@index([status, lockedAt])`.
3.  **Nueva Tabla Consumidora (`CarbonFootprintProcessedEvent`):**
    -   `eventId` (String UUID @id) -> Idempotency Key!
    -   `tenantId`, `auditId`, `snapshotId` (Strings UUID)
    -   `processedAt` (DateTime @default(now()))
    -   Índice: `@@index([tenantId, auditId])`

### 2️⃣ NestJS Module (Energy Audit Base)

#### [MODIFY] `apps/api/src/modules/energy-audit/energy-audit.service.ts`
1.  **Modificar:** Método `validateAudit`.
2.  **Acción:** Inyectar el insert de `DomainEventOutbox` *antes* del cierre incondicional de `$transaction()`.
    -   No crear modelo detallado aún, tan solo pasar `eventId: randomUUID()`, `auditId`, `snapshotId` al JsonB `payload`.

## Plan de Verificación

1.  **Prisma Verification:**
    -   `npx prisma format`
    -   `npx prisma validate`
    -   `npx prisma db push` (Sobre DB Local de testeo) para validar la salud de los Enums y compuestos de Index B-Tree.
2.  **Build Verification:**
    -   `nest build api` (Para garantizar que Nest no se rompa por la importación de nuevos Types generados).
3.  **No Logic Execution yet:**
    -   La inserción de `validateAudit` se evaluará *luego* de que el CTO apruebe la estructura de tabla. En esta instancia, probaremos puramente que Prisma Schema no rompa las Relational Clauses existentes ni genere Drop Tables irreversibles.
