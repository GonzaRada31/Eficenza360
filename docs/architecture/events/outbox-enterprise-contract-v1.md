# PRE-SCHEMA VALIDATION CONTRACT: OUTBOX HARDENING

## 1️⃣ Estado PROCESSING — Riesgo de Evento Zombie
**Mecanismo de Detección:** Un evento está *Zombie* si su estado es `PROCESSING` pero ha pasado el umbral de su Timeout de procesamiento (Ej 5 min).
- **Esquema DB Requerido:** Se agrega el campo `lockedAt DateTime?` a la tabla `DomainEventOutbox`.
- **Lógica de Rescate (Puramente SQL):**
  El Relay Node ejecutará periódicamente el recate de forma determinista y atómica:
  ```sql
  UPDATE "DomainEventOutbox"
  SET status = 'PENDING', "lockedAt" = NULL, "retryCount" = "retryCount" + 1
  WHERE status = 'PROCESSING' 
    AND "lockedAt" < NOW() - INTERVAL '5 minutes';
  ```
  *Sin cargas de arrays en la RAM del servidor Node. Total DB-Side.*

## 2️⃣ Idempotencia del Worker de Huella
La tabla de trazabilidad en el dominio del consumidor registrará fielmente la ejecución:

```prisma
model CarbonFootprintProcessedEvent {
  eventId     String   @id @db.Uuid
  tenantId    String   @db.Uuid
  auditId     String   @db.Uuid
  snapshotId  String   @db.Uuid
  processedAt DateTime @default(now())

  @@index([tenantId, auditId])
}
```
*Esto responde: Qué evento originó (eventId), sobre qué contexto (audit/snapshot) y para quién (tenantId).*

## 3️⃣ Purga Nocturna — Seguridad Legal
La tabla tendrá un índice compuesto obligatorio para prevenir Table Scans durante purgas o consultas del Relay:
- `@@index([status, createdAt])` (Obligatorio general)
- `@@index([status, lockedAt])` (Para purga de Zombies ágil)
- **Política de FAILED**: Los eventos `FAILED` formarán el *Dead Letter Log*. Permanecen infinitamente hasta acción administrativa humana. **NUNCA** se purgan por antigüedad en la DB operativa viva.

## 4️⃣ Inserción del Evento en Transacción `validateAudit`
Orden Transaccional (Strict Order):
```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. OCC Lock & Mute Status
  // 2. Crear Snapshot Father
  // 3. Crear SnapshotRecords en Chunks Cursor-Based
  
  // 4. (NUEVO) Crear DomainEventOutbox Record
  // Payload MÍNIMO JSONB (tenantId, auditId, snapshotId, year...)
  await tx.domainEventOutbox.create({ ... })
});
// 5. COMMIT Total Automático
```

## 5️⃣ Enum Definitivo de Estados
Se creará estrictamente este Enum en Prisma, prohibiendo sentencias intermedias ambiguas.
```prisma
enum OutboxStatus {
  PENDING
  PROCESSING
  PROCESSED
  FAILED
}
```

---

**Veredicto Oficial Pre-Esquema:**
✔ **AUTORIZADO ESCRIBIR SCHEMA.PRISMA**
La abstracción propuesta cumple con los requerimientos B2B SaaS masivos para los próximos 5 años (Zero Zombie Lock, Audit-ready Consumer Log, Fast-Index Purge).
