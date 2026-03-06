# Decisión de Infraestructura: Async Event-Driven Architecture

## 1. Opciones Analizadas

- **Opción A:** EventEmitter interno (NestJS) + BullMQ
  - *Pros:* Rápido de implementar.
  - *Contras:* Si el proceso de Node crashea milisegundos después de que Prisma haga el COMMIT de validación, el evento en BullMQ jamás se encola. **(Pérdida de evento irrecuperable)**.
- **Opción B:** Redis Pub/Sub nativo
  - *Contras:* Fire-and-forget. Si el consumidor (worker) está caído durante el "Pub", el evento se evapora en la nada. Totalmente inaceptable para facturación y reportes ESG legales.
- **Opción C:** Transactional Outbox Pattern (PostgreSQL + BullMQ Relay)
  - *Pros:* El evento se inserta en la misma DataBase Local Transaction (`Prisma.$transaction`) que el Snapshot. Atomicidad 100% garantizada por ACID. Si la app muere, el evento sigue en DB pendiente de envío.

## 2. Veredicto Técnico: Opción C (Outbox Pattern)
Para cumplir los rigurosos estándares de certificación B2B, se **OBLIGA** el uso del **Outbox Pattern**. Es matemáticamente imposible perder un evento si este reside en la misma transacción que muta el dominio principal.

---

## 3. Justificación Estructural de Tabla `DomainEventOutbox`

**"¿Necesitamos tabla DomainEventOutbox?"**
**SÍ, ABSOLUTAMENTE.** Es el pilar de la resiliencia en arquitecturas distribuidas. Si omitimos esto, romperemos la "Garantía de Dual-Write".

### Schema Mínimo Requerido (Prisma Modeled):

```prisma
model DomainEventOutbox {
  id            String   @id @default(uuid())
  tenantId      String   @db.Uuid
  eventType     String   @db.VarChar(100) // Ej: "ENERGY_AUDIT_VALIDATED"
  payload       Json     @db.JsonB        // Contrato estricto v1
  status        OutboxStatus @default(PENDING)
  retryCount    Int      @default(0)
  createdAt     DateTime @default(now())
  processedAt   DateTime?
  errorReason   String?  @db.Text

  @@index([tenantId])
  @@index([status, createdAt]) // Crucial para el Polling Worker que barre pendientes
}

enum OutboxStatus {
  PENDING
  PROCESSED
  FAILED      // Pasado al Dead Letter Queue lógico
}
```

---

## 4. Flujo Asíncrono Completo (Diagrama Textual)

### Phase A: El Originador (Sincrónico)
1. Usuario pulsa "Validar". API ejecuta `POST /validate`.
2. Ocurre `Prisma.$transaction`:
   - OCC sobre `EnergyAudit`.
   - Generación Bulk Hash (`EnergyAuditSnapshot`).
   - Generación de fila en `DomainEventOutbox` (payload=`ENERGY_AUDIT_VALIDATED`).
3. Database `COMMIT`. (Garantía Exactly-Once de guardado del evento).
4. Respuesta HTTP 200 al Frontend. Usuario ve éxito, sin esperar el cálculo grueso de Huella.

### Phase B: El Relay / Worker (Asíncrono)
1. **Outbox Relay (Cron o BullMQ Producer):** 
   - Barre la tabla `DomainEventOutbox` buscando resoluciones `PENDING`.
   - Empuja a la cola rápida de Redis/BullMQ.
   - Si Redis cae, no pasa nada; los eventos siguen en `PENDING` en PostgreSQL.
2. **Event Consumer (Carbon Footprint Worker):**
   - Extrae mensaje de BullMQ.
   - **Check Idempotency:** Verifica si la clave `eventId` ya existe en su propia tabla de estado `CarbonFootprintJob`. Si existe, ignora el mensaje (Evita Dobre Cálculo).
   - Genera los cálculos pesados leyendo el Snapshot en DB.
   - Crea `CarbonFootprintReport`.
   - Marca en API el DomainEventOutbox originador como `PROCESSED`.
3. **Dead Letter Strategy:**
   - Si el worker de cálculo falla (excepción, bug, división por cero), BullMQ re-intenta el job usando `Exponential Backoff`. 
   - A los 5 fallos consecutivos, el status en PostgreSQL de la Outbox pasa a `FAILED` para análisis humano (DLQ Support) alertando a Sentry.

---

## 5. Riesgos y Mitigaciones Estratégicas

| Riesgo Planteado | Respuesta Estructural / Mitigación |
| :--- | :--- |
| **Worker Calculation Crash** | Si el consumidor cae a la mitad de un recálculo, la transacción de Huella se revierte y BullMQ no recibe el ACK. A los minutos, el Job vuelve a activarse en BullMQ (Retry). |
| **Redis Crash** | Si Redis (BullMQ Broker) se corrompe, los eventos nuevos vivos no se pierden; se acumulan con status `PENDING` en nuestra tabla permanente `DomainEventOutbox` de Postgres. Cuando Redis revive, el Relay los reconduce solos. |
| **Doble Validación (UI Bug)** | Imposible por Fase 1. La transacción chocaría bloqueada por OCC (`Update affectedRows: 0`) o por restricción de código local de State Machine antes de poder forjar un insert falso al Outbox. |
| **Fallo en Cálculo de Huella** | Si un factor de emisión falta y el sistema da error, la Outbox se setea en `FAILED` (Dead Letter Queue format). El CTO puede reparar la fórmula en código y re-despachar el status a `PENDING` alterando solo la flag con UI administrativa, forzando de vuelta el recalculado. |
| **Double Execution (Pérdida de ACK)** | El worker finaliza todo el cálculo y guarda, pero cae justo antes de mandar el ACK a BullMQ. BullMQ asume fallo y manda el evento *de nuevo* a otro worker. **Mitigación obligatoria:** El consumer DEBE inyectar el guardado del `CarbonFootprintReport` MÁS el registro de `eventId_processed` en la MISMA transacción. Así el re-intento posterior morirá por "Idempotency Key Ya Registrada" ignorando repetir el trabajo y finalizando con SILENT_ACK. |

---

## 6. VEREDICTO FASE 2 DISEÑO

✔ **ARQUITECTURA LISTA PARA IMPLANTACIÓN**
El modelo Outbox garantiza consistencia atómica sin Single Points of Failure, preservando la Inmutabilidad, Recuperabilidad y Auditabilidad financiera que requiere Eficenza 360.
