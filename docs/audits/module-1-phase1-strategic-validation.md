# Validación Estratégica Pre-Fase 2 (Módulo 1)

## Modo: Estabilización Final

### 1️⃣ Validación Transaccional del Snapshot

Actualmente, el método `validateAudit` utiliza una **Transacción Interactiva** (`this.prisma.$transaction(async (tx) => { ... })`).
- **Composición de la Transacción**:
  1. Ejecuta el `updateMany` con el check de versión OCC (Lock lógico de la Auditoría).
  2. Crea el `EnergyAuditSnapshot` padre.
  3. Ejecuta el `findMany` de los `EnergyRecords` (Cuidado: esto carga memoria).
  4. Ejecuta un `createMany` bulk-insert de los miles de clonados `EnergyAuditSnapshotRecord`.
- **Riesgo de Half-Snapshot**: Nulo. Al ser una transacción de Prisma bajo Postgres (BEGIN ... COMMIT), si el registro 4.998 falla (por constraint o type error), Postgres rechaza toda la mutación, ejecutando un `ROLLBACK`. Ni el cambio local de status ni el snapshot parcial persistirán.
- **Riesgo de Deadlock**: Bajo a nivel registro, pero **Medio-Alto a nivel CPU/Memoria de Node**. La transacción iterativa bloquea la conexión del pool mientras Node.js procesa el array de 5.000 items y los mapea, reteniendo el lock en Postgres mucho más tiempo del necesario.

### 2️⃣ Riesgo de Contención por OCC

- **¿3 usuarios editando registros distintos de la misma auditoría?**
  - **Resultado**: Cero colisión. El OCC está granularizado al nivel *registro de energía* (`EnergyRecord`), no de la cabecera. Pueden ocurrir inserciones/updates paralelos sin problemas.
- **¿3 usuarios editando el mismo registro?**
  - **Resultado**: Contención limpia. El primero en llegar incrementará la versión a `2`. Los otros dos requests, al tratar de usar `version: 1` chocarán contra el array vacío de `affectedRows` y lanzarán `OCCConflictException` (HTTP 409).
- **¿Falsa colisión / Lock Excess?**
  - Todo update o validación final utiliza la heurística granular perfecta. Solo el status general de la auditoría eleva la versión del Entity padre en el proceso de "Cerrar".


### 3️⃣ Costo Real de Snapshot (5.000 registros)

Actualmente, el proceso carga el array completo de 5,000 registros en la RAM de V8:
```typescript
const records = await tx.energyRecord.findMany({ ... }) // <- Memoria Lineal O(N)
await tx.energyAuditSnapshotRecord.createMany({ data: records.map(...) })
```
- **Riesgos**:
  - Un insert de 5.000 objetos complejos dentro de una Interactive Transaction agotará el timeout por defecto de Prisma (5 segundos) si la base de datos no es ultrarrápida.
  - Provocará una pausa de Garbage Collection (GC) en Node, afectando a otros inquilinos (Tenants).
- **Conclusión Técnica**:
  - Para 5,000 archivos, **es obligatorio implementar Chunking interno dentro del bloque `$transaction`**. Un bucle for-loop procesando lotes de 500 registros.

### 4️⃣ Preparación para Fase 2 (Eventos Asíncronos)

La tabla `EnergyAuditSnapshot` posee:
- `createdAt` ✅
- `tenantId` ✅
- `originalAuditId` (`auditId`) ✅
- `status` congelado ✅
- `isoStandardVersion` (normativa) ✅

El esquema Prisma está **estructuralmente completo**. El sistema se encuentra lógicamente apto para emitir `ENERGY_AUDIT_VALIDATED` junto con su `snapshotId` utilizando la arquitectura estandar de EventEmitter.

---

## ✖ Veredicto Final: Ajuste adicional necesario (Micro-Fix)

Las barreras OCC y Multi-tenant son teóricamente infalibles.
Sin embargo, **se detecta riesgo crítico de Timeout / OOM (Out Of Memory) en la Transacción de Creación Masiva (Snapshot) para 5.000 records.**

**Requisito Bloqueante antes de Fase 2**:
- Implementar **Paginación iterativa (Chunking)** dentro del método `validateAudit`. El `findMany` y `createMany` de records clonados debe realizarse en lotes pre-determinados de `500` items para evitar la saturación del Event Loop y de la Interactive Transaction Timeout.
