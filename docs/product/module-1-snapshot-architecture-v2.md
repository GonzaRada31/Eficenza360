# Snapshotting y Matriz de Defensibilidad Legal (Diseño Resiliente v2)
**Versión:** 2.0  
**Enfoque:** Inmutabilidad Probatoria ISO 50001 / GHG Protocol.

Para garantizar que Eficenza 360 no sufra _Amnesia Probatoria_ o alteraciones silenciosas por cambios normativos mundiales, el Módulo 1 operará bajo la siguiente arquitectura dura.

---

## 1. Snapshotting Obligatorio (El Modelo Formal)

### 1.1. Evento Disparador (Trigger)
El snapshotting **NO** ocurre retrospectivamente ni por "cronjobs". Ocurre estrictamente y atómicamente y de forma sincrónica durante la transición de la API de `UNDER_REVIEW` hacia `VALIDATED`.

### 1.2. Entidades Congeladas (Deep Freeze)
Cuando una Auditoría entra a `VALIDATED`:
- **El `EnergyRecord` (Consumos raw):** Pasa a ser inviolable vía backend (Bloqueo transaccional de Updates/Deletes mediante Interceptores de estado).
- **El Factor de Emisión (Magia Negra Eliminada):** 
  - *Diseño Roto v1:* `EnergyRecord -> pertenece a -> EmissionFactor (Id: 1)`
  - *Diseño Resiliente v2:* Al validar, se interroga al catálogo. Si el Factor ID 1 dicta `0.28 kgCO2e/kWh`, se crea automáticamente una fila en la tabla maestra (o en los mismos campos del Módulo 2) llamada `appliedEmissionFactorValue = 0.28` e `appliedEmissionFactorSource = "DEFRA 2026"`. **Se rompe el enlace relacional (Foreign Key)** para el cálculo final.
- **La Fórmula y Totales:** El backend suma todos los registros y guarda en una tabla de agregación `AuditAggregationSnapshot` los totales procesados (Ej: `totalElectricityKwh = 5400`), congelando físicamente la sumatoria en una fila. No se vuelve a calcular de los registros base una vez validado.

### 1.3. Naturaleza del Snapshot
- El snapshot **ES INMUTABLE**. No existe en la base de datos ningún endpoint `PATCH /snapshots/:id`. 
- **Si hay un error humano tras validar:** Se debe ejecutar el flujo formal de Re-Apertura (SAGA_REOPEN_AUDIT), que invalida el snapshot existente (`status = OBSOLETE`), e incrementa la versión de la auditoría madre (`EnergyAudit_v2`), para exigir firmas nuevas y un snapshot naciente. El viejo sobrevive como historia probatoria (Soft Delete + Obsolete state).

---

## 2. Legal Defensibility Matrix (Simulación Legal ISO)

| Evento Hípotetico Externo/Interno | Comportamiento del Sistema v2 | Escudo Legal / Defensa Técnica |
| :--- | :--- | :--- |
| **Cambia la Normativa ISO (o GHG Protocol altera un peso)** | La plataforma actualiza el Catálogo de Factores global. | Las auditorías previas (`VALIDATED`/`LOCKED`) apuntan a sus `appliedEmissionFactorValue` (Snapshots crudos interned). Su resultado en toneladas de Carbono permanece idéntico. Solo afectará auditorías futuras o en `DRAFT`. |
| **Intento de `DELETE` de una factura de un mes VALIDATED** | Backend aborta transacción (`HTTP 403 Forbidden - Estado Incompatible`). | No hay huecos en la capa de UI. Aunque un hacker se salte el Frontend (Bot API), el `EnergyAuditService` tira excepción si verifica estado `>= VALIDATED`. |
| **Auditor Lider detecta un cero extra en el consumo 3 meses después** | Auditor presiona "Reabrir Auditoría". Debe llenar campo obligatorio "Motivo". | La iteración V1 del Audit (y su Snapshot) se marca como `OBSOLETE`. Se crea la iteración V2 apuntando a los mismos `EnergyRecords` (habilitados para editar). Queda trazabilidad 100% visible del error. |
| **¿Se puede reabrir una auditoría `LOCKED`?** | **Absolutamente NO.** | `LOCKED` es el sello hermético de cierre de año fiscal ESG. Todo parche de años anteriores debe hacerse como "Ajuste Compensatorio" en la auditoría del año actual (Bajo contabilidad estándar). |

---

## 3. Performance + Escalabilidad Remasterizada (Re-Test)

### 3.1. Pruebas Extremas Definidas
- **Volumen:** 5,000 registros x 200 auditorías por Tenant x 50 Tenants = **50,000,000 de Registros Atómicos en la tabla `EnergyRecord`.**
- **Complejidad de Exportación:** 1 PDF inmenso consolidando las 200 auditorías de un cliente anual.

### 3.2. Estrategia Operativa Acordada (El Blindaje)
1. **Índices Obligatorios Prisma:** 
   `@@index([tenantId, auditId, status])`. Ninguna query tocará la tabla de auditorías sin buscar primero el `tenantId` agrupado, mitigando el Seq Scan en PostgreSQL.
2. **Background Jobs Indiscutibles:**
   - La operación de transicionar de `UNDER_REVIEW` -> `VALIDATED` requiere iterar sobre todos los records, copiando Factores y levantando totalizadores. Para clientes industriales con 10,000 inputs, esto romperá el Timeout de la API HTTP Gateway (habitualmente 30 segundos).
   - **Solución Dificil pero Enterprise:** El endpoint responde `HTTP 202 Accepted (Validación en proceso)`. Un `Worker` de Redis/BullMQ hace la rutina de _Deep Freeze_ y clonado en background, terminando con una notificación WebSocket (o SSE) de "Auditoría Confirmada al 100%".
3. **Paginación Absoluta:**
   - Ningún JSON response en `GET /audit/:id/records` devolverá la propiedad `data: [...]` con tamaño superior a 100 objetos. La Virtualización frontend irá escupiendo `skip` y `take` de a 100 bajo demanda (Infinity Scroll API).
