# Stress Test Arquitectónico - Módulo 1 (Auditoría Energética)
**Versión:** 1.0  
**Objetivo:** Romper la arquitectura teórica de la v1.0 revelando cuellos de botella y vulnerabilidades de estado, asumiendo crecimiento hiper-escalado.

---

## 1. Escenarios de Estrés y Fallas Estructurales

### 1.1. Auditoría masiva con 5.000 registros energéticos
- **¿Qué se rompe?:** La Interfaz de Usuario (React) crasheará por el `DOM Node count` (Out-of-memory browser) si carga 5,000 celdas en un Grid tradicional. El Backend sufrirá _timeouts_ si Prisma hace un `include` masivo de relaciones en una sola consulta.
- **¿Qué requiere?:** 
  - *Frontend:* Paginación por cursor y Virtualización (Windowing) absoluta del componente Grid.
  - *Backend:* Paginación en BD y un endpoint de agregación `sum()` para totales, evadiendo transferir arrays inmensos por red.

### 1.2. Dos Auditores editando simultáneamente
- **¿Qué genera inconsistencia?:** El clásico bug "Last Write Wins". Si Auditor A abre el Grid a las 10:00 y Auditor B a las 10:01. Auditor A cambia un consumo a `500` a las 10:05 y guarda. Auditor B, con data rancia, cambia otro campo y guarda a las 10:06. Sobreescribe el cambio `500` del Auditor A a su valor viejo.
- **¿Qué requiere?:** Implementación transversal de **Optimistic Concurrency Control (OCC)**. Prisma debe enviar una columna `@updatedAt` o `version`. Si la mutación llega con un `version` desfasado, la BD debe rechazar el update (`HTTP 409 Conflict`).

### 1.3. Cambio de Factor de Emisión (Global) luego de validación (LOCKED)
- **¿Qué genera inconsistencia?:** Si la BD solo guarda una clave foránea `emissionFactorId` hacia la tabla Maestra de Factores, y el Gobierno cambia el factor nacional para 2026, **las auditorías históricas ya validadas variarán matemáticamente** de forma retroactiva, destruyendo el valor probatorio legal.
- **¿Qué requiere versionado?:** Snapshotting de valores. En el instante de transicionar a `VALIDATED`, se debe clonar el `valor numérico real` del factor al momento de firmar y guardarlo explícitamente en el registro de la auditoría, rompiendo la dependencia relacional rígida.

### 1.4. Reapertura de una auditoría `VALIDATED`
- **¿Qué se rompe?:** La Sincronización Event-Driven. Si la Huella de Carbono (Módulo CO2) ya consumió el total de la Auditoría, y un Tenant Admin "Re-Abre" y borra una factura en el Módulo 1. El Módulo 2 quedará desincronizado (Tendrá CO2 de más).
- **¿Qué requiere?:** Un Protocolo de **Eventos de Compensación (Saga Pattern base)**. Al reabrir, se emite un evento `AuditReopenedEvent`. El módulo de CO2 lo escucha y marca su cálculo anterior como `OBSOLETE` (Soft Delete) esperando la revalidación.

### 1.5. Exportación Masiva (PDF + Excel)
- **¿Qué se vuelve lento?:** El CPU de Node.js (Main Thread) renderizando 50 páginas en Playwright/Puppeteer o PDFKit detendrá _todas_ las peticiones HTTP del resto de usuarios de la API por varios segundos.
- **¿Qué requiere?:** Cola BullMQ (`pdf-generator-queue`). Desvincular el streaming de PDF de los endpoints Express/Nest. Retornar progreso por Websockets/SSE.

### 1.6. Migración Futura a Microservicio (Extracción del Módulo 1)
- **¿Qué se rompe?:** Los "Foreign Keys" forzados (Prisma Relations) en la Base de Datos a nivel motor relacional si dividimos el cluster de bases de datos de EnergyAudits y CarbonFootprint.
- **¿Qué requiere?:** Logical IDs. Todo enlace entre dominios debe realizarse guardando el `string/uuid` del ente forastero, no usando restricciones `FOREIGN KEY REFERENCES` (Soft Links).

---

## 2. Mapa de Riesgos Técnicos no pre-detectados

| Identificador | Clasificación | Factor de Riesgo Descubierto | Mitigación Arquitectónica |
| :---: | :---: | :--- | :--- |
| **R-01** | 🔴 **Crítico** | **Last-write-wins (Sobreescritura Múltiple):** Falta control de concurrencia optimista en el esquema Prisma. | Integrar campo `@updatedAt` usado como `ETag` en las transacciones de Upsert. |
| **R-02** | 🔴 **Crítico** | **Mutación Pasiva de Historia (Legal Leak):** Cálculo en memoria usando variables vivas de entidades conectadas (`EmissionFactors`). | Implementar Tabla `Snapshot` con valores duros copiados al firmar. |
| **R-03** | 🟠 **Alto** | **Caídas de Eventos Asíncronos (Eventual Consistency):** Si se valida ("VALIDATED"), se emite el evento Pub/Sub, pero Redis/Queue falla, Carbono jamás se entera. | Requerir patrón "Transactional Outbox" o reintento garantizado sobre el Event Bus. |
| **R-04** | 🟡 **Medio** | **Carga Polimórfica Inconsistente:** Soft delete de una *EnergyAudit* no oculta en cascada atómica todas sus facturas hijas si no viajan por el middleware adecuado. | Filtro global automático Prisma Extension `deletedAt == null`. |

---

## 3. Conclusión del Stress Test

El Modelo de Datos propuesto en la v1 **NO ESTÁ LISTO** para la Fase 1 de Prisma porque adolece de **Amnesia Probatoria (Risk R-02)** y de **Inocencia Concurrente (Risk R-01)**. Subir la arquitectura original nos llevaría a corrupción de base de datos multi-usuario.

> **Veredicto Técnico Ejecutivo:**  
El diseño fundacional se detiene, requiere una adenda estructural (`Module 1 Versioning & Snapshot Strategy`). El código Prisma solo podrá redactarse insertando campos de versionado (`version Int`), copiando columnas "hard-coded" temporales (`appliedFactorValue Float`) y resolviendo las compensaciones.
