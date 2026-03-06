# Auditoría Capa de Datos y Persistencia - Eficenza 360
**Versión:** 1.0  
**Fecha:** 2026-03-03

---

## 1. Estado Actual del Modelo Físico y Prisma Schema

El esquema relacional diseñado mediante Prisma ORM para PostgreSQL es sólido en términos de estructuración pura. El árbol jerárquico (`Tenant -> Project -> Module -> Task -> Subtask`) refleja con total fidelidad las necesidades del negocio expuestas en los servicios.

### 1.1. Normalización y Coherencia
- El schema y los DTOs (`ConfirmInvoiceDto`, esquemas Prisma) están en un >95% de sincronía, un nivel excelente para proyectos en fase intensa de desarrollo.
- Enum Types (`ServiceType`, `TaskType`, `CarbonScope`) se usan acertadamente para evitar *magic strings* en bases de datos.

### 1.2. Claves Compuestas (Multi-Tenant + Deduplicación)
La estrategia de usar constraints compuestos `@@unique([tenantId, projectId, deduplicationKey])` en la tabla `Task` y `ProjectModule` es una de las mejores medidas implementadas. Esto transfiere la responsabilidad de evitar duplicados garantizados a la base de datos de manera atómica (A nivel PostgreSQL).

### 1.3. Índices Base
Prácticamente todas las tablas tienen su índice base sobre `@@index([tenantId])` y `@@index([deletedAt])`. Esto ayuda a búsquedas simples.

---

## 2. Hallazgos y Riesgos Críticos (Cuello de Botella)

A continuación, los mayores riesgos hallados a nivel arquitectónico de la base de datos previstos ante crecimiento masivo (10x+ datos) o alta concurrencia.

| Riesgo Detectado | Nivel de Criticidad | Descripción Técnica |
| :--- | :---: | :--- |
| **Consultas Expansivas (Deep Includes / OOM Risk)** | **Crítica** | En `projects.service.ts` (`findAll`), las consultas realizan inclusiones anidadas hasta 3 niveles de profundidad (`modules` -> `tasks` -> `subtasks`). Con miles de subtasks, Prisma generará un JSON masivo en memoria Node.js y en Query Postgres, provocando *Out Of Memory (OOM)* en el servidor o timeouts. Falta paginación restrictiva. |
| **Race Conditions en Operaciones Lógicos (Create)** | **Alta** | En lugar de apoyarse en un puro `upsert` o un `create` atrapando los errores de Constraint (P2002), en `projects.service.ts` se observa el antipatrón de leer primero (`findFirst`) y luego crear. En solicitudes concurrentes exactas, ambas leerán `null` e intentarán Crear, resultando una de ellas en fallo 500 para el usuario. |
| **Índices Aislados No-Compuestos** | **Media** | Mantener un índice para `tenantId` y otro para `deletedAt` por separado obligará al motor a resolver con intersección de conjuntos de bitmaps (*Bitmap And*). A largo plazo, en tablas gigantes, será más lento que un índice compuesto `@@index([tenantId, deletedAt])`. |
| **Cascada de Soft-Delete Programático** | **Media** | No existe `onDelete: Cascade` real para la eliminación lógica (Soft-delete). Se delega al código transaccional (revisado en `projects.service.ts` método `removeTask`). Cualquier omisión en un servicio nuevo dejará sub-ítems huérfanos que el front-end considerará "activos" porque su `deletedAt` sigue nulo. |
| **Riesgo de Duplicidad de Facturas** | **Media** | A diferencia de los Módulos/Tareas, la tabla `Invoice` NO tiene clave compuesta de deduplicación natural `@@unique([tenantId, vendorTaxId, clientNumber, periodStart])`. Se confía enteramente a la IA o subidas manuales redundar datos, exponiéndose a cálculos duplicados de Huella de Carbono. |

---

## 3. Preparación para Cálculo y Reportes
- En `carbon-calculation.service.ts` el uso de `this.prisma.carbonRecord.upsert(...)` es **excelente y transaccional**, eludiendo las *race-conditions*.
- Sin embargo, para **reportes complejos BI** (ej: emisiones totales por planta, por mes, cruzado con gastos), a futuro la arquitectura puramente relacional obligará a escanear millones de filas `ActivityData`. Se recomienda en el roadmap planear una vista materializada (Materialized Views) de PostgreSQL para datos estadísticos en base mensual, mitigando la carga en el master DB.
