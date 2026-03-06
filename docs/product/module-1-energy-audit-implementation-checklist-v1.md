# Checklist de Implementación Técnica - Módulo 1 (Energy Audit)
**Versión:** 1.0  

De acuerdo al *Enterprise Development Manifesto*, estas fases se cumplirán inexorablemente de atrás hacia delante y desde el Core Lógico hasta el UI Visual.

---

## Ficha de Ejecución 1: "Data Layer & Core Services" (Backend Fundacional)

### 1️⃣ Prisma Schema (Entity Modeling)
- [ ] Definir Enums seguros: `AuditStatus` (DRAFT, IN_PROGRESS, UNDER_REVIEW, VALIDATED, LOCKED), `EnergyRecordType` (INVOICE, GRID, MEASUREMENT).
- [ ] Agregar tabla `EnergyAudit` vinculada a `Company` y obligadamente a `tenantId`.
- [ ] Agregar tabla `EnergyRecord` asegurando el constraint único: `@@unique([tenantId, deduplicationKey])`.
- [ ] Agregar tabla `EnergyRecordHistoryLog` para trazabilidad de cambios (Auditoría pasiva).
- [ ] Crear Migración Prisma controlada y correr `migrate dev`.

### 2️⃣ Data Transfer Objects (DTOs) Estrictos
- [ ] Importar libreria y crear `CreateEnergyAuditDto`. Impedir `tenantId` inyección.
- [ ] Crear `UpdateAuditStatusDto` asegurando mediante Validator Custom/Regex que la transición de Fases Finite-State-Machine es legal (ej. No de `DRAFT` directo a `VALIDATED`).
- [ ] Crear `BulkUpsertEnergyRecordsDto` implementando arreglo validado (`@ValidateNested({ each: true }) @Type(() => EnergyRecordItemDto)`).

### 3️⃣ Servicios Multi-Tenant y Guardias
- [ ] Construir `EnergyAuditService`. En todos los métodos de búsqueda inyectar `tenantId` estricto en el objeto `where: {}`.
- [ ] Desarrollar lógica de `Transitions` que congele (lance `BadRequestException`) si se intenta hacer `.update` en un `EnergyRecord` donde el Audit principal tiene status `VALIDATED` o superior.

---

## Ficha de Ejecución 2: "Domain Events & Integrations" (Desacople)

### 1️⃣ Pub/Sub Emisión asíncrona
- [ ] Instalar `@nestjs/event-emitter`.
- [ ] Al ejecutar método `approveAudit()` en el Servicio, luego de confirmar commit en Base de Datos, lanzar `this.eventEmitter.emit('audit.validated', payload)`.
- [ ] Testear mediante logger que el módulo oyente (futuramente CarbonFootprint) capte el JSON sin trabar el Return HTTP de éxito (200 OK) emitido al frontend del auditor.

---

## Ficha de Ejecución 3: UI, Escalabilidad y UX Corporativa (Frontend)

### 1️⃣ Infraestructura de Fetching (React Query)
- [ ] Setear hooks globales inmutables mutadores (ej. `useInvalidateAuditQuery`).
- [ ] Prohibido encadenar Contexts; toda data del backend viaja cifrada por caché SWR (`@tanstack/react-query`).

### 2️⃣ Componentización Atómica del Workflow
- [ ] Crear componente `AuditStatusBadge` (UI presentacional condicional de colores).
- [ ] Crear componente `UploadEvidenceDropzone` englobando manejo de API Multer/Azure Blob. Emitiendo el evento _onUploadSuccess_ sin almacenar base64 en memoria de React (causante de lag previos).
- [ ] Desarrollar componente de Celdas estilo Hojas de calculo (`DataGrid/SpreadsheetComponent`) utilizando librerias aglo-eficientes (ej: `react-data-grid`) para soportar carga manual de métricas en celdas (Gasoil, Leña, Medidores), previniendo el "God Object" que rompió el performance anterior.

---

## Ficha de Ejecución 4: Pruebas y Aceptación Formal (QA)

### 1️⃣ End-to-End Test (E2E)
- [ ] Simular carga de `Tenant Admin`: Intentar transicionar de `UNDER_REVIEW` (Debe pasar).
- [ ] Simular carga de `Customer User`: Intentar borrar un `EnergyRecord` cuyo Estado es `VALIDATED`. NestJS DEBE retornar HTTP 403 Forbidden.
- [ ] Intentar enviar Array de 100 `EnergyRecords` conteniendo 5 IDs duplicados. La API y Base de Datos debe ignorar los 5 conflictivos y continuar los 95 correctos (Upsert Atómico y Robusto).
