# Arquitectura y Diseño Módulo 1: Auditoría Energética (ESG Ready)
**Versión:** 1.0  
**Status:** Aprobación Pendiente

---

## 1. Objetivo Corporativo del Módulo
El **Módulo de Auditoría Energética** es el cimiento transaccional de la plataforma. Su finalidad no es "guardar números", sino actuar como el Sistema GRC (Governance, Risk, and Compliance) donde se asienta la veracidad probatoria del inventario energético de un cliente corporativo.

- **Propósito Técnico:** Ingestar, tipar, calcular y bloquear datos crudos (Facturas, Medidores, Excel) de forma estructurada e idempotente.
- **Propósito ESG (Environmental, Social, and Governance):** Cumplir con los principios de Precisión, Completitud y Auditabilidad del GHG Protocol y la norma ISO 50001. Todo dato debe ser trazable hacia una Evidencia Documental (PDF/Foto).
- **Relación con Módulo Huella de Carbono:** Funciona como el "Trigger" y "Fuente de Verdad" (Scope 2 Principal). Un mes auditado y Validado de Electricidad se traduce y exporta automáticamente en Toneladas de CO2e.
- **Multitenancy Estricta:** Todas las operaciones de tablas están atadas inquebrantablemente al identificador compuesto único de la Consultora (`tenantId`) y de la Empresa Auditada (`companyId`).

---

## 2. Estructura de Tareas y Origen de Datos

Las Auditorías se segmentan operativamente así:

| Macro-Categoría (Task) | Subcategoría (Subtask) | Tipo Input | Mecanismo | Validación Requerida | Impacto Huella (CO2e) |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Grid 1: Facturación (Scope 2)** | Electricidad | Invoice / OCR | Carga Masiva PDF + Corrección Manual | 🛑 Estricta (Auditor) | **Alto** (Scope 2) |
| **Grid 1: Facturación (Scope 2)** | Gas Natural | Invoice / OCR | Carga Masiva PDF + Corrección Manual | 🛑 Estricta (Auditor) | **Alto** (Scope 1 Fijo) |
| **Grid 2: Combustibles** | Diésel, Nafta, GNC | Data Grid | Captura de Comprobantes, Remitos (Manual/Excel) | 🟡 Media | **Alto** (Scope 1 Móvil/Fijo) |
| **Grid 3: Renovables / Propios** | Paneles Solares, Biomasa | Data Grid / Texto | Auto-generación in situ | 🟡 Media | Bajo/Nulo (Evita CO2) |
| **Grid 4: Site Assets** | Motores, Calderas, HVAC | Text / List / Metadata | Levantamiento de chapa característica | 🟢 Informativa | Cero (Sirve para métrica de eficiencia futura) |

*(💡 Nota Técnica: Distinción crítica entre un "Invoice" (Factura leída por Azure) y un "Data Grid" (Planilla tipo Excel montada en Frontend donde el usuario escribe consumos a base de remitos de surtidor).*

---

## 3. Modelo Analítico de Base de Datos (Conceptual)

Para aislar facturas procesadas de tablas de auditoría en borrador, definimos:

- **Entity: `EnergyAudit`** (El paraguas mensual o anual. Ej. "Auditoría Planta Pilar 2026"). Contiene el `statusWorkflow` global.
- **Entity: `EnergyAuditTask`** (Catergorización funcional. Ej. "Consumos de Red").
- **Entity: `EnergyAuditSubtask`** (Ej. "Facturas EDENOR Mes de Julio").
- **Entity: `EnergyRecord`** (El Atomo). Contiene magnitudes: `valor` (Numérico), `unidad` (kWh, m3, Lts), `costo_monetario`.
  - Relation: `EnergyRecord` pertenece a 1 `EnergyAuditSubtask`.
- **Entity: `InvoiceSource`** (Vinculación opcional a lectura de Azure). 
  - Relation 1-to-1 con `EnergyRecord` (Si el registro nació de un OCR).
- **Entity: `EvidenceAttachment`** (URLs firmadas en Azure con TTL/Access-Tiers). Toda factura es Evidencia, pero no toda Evidencia es una Factura (ej. foto de chapa de un motor).
- **Entity: `AuditLogActivity`** (Trazabilidad). Registro inalterable guardando quién modificó el `EnergyRecord` del ID X pasando de valor Y a Z.

---

## 4. WorkFlow (Finite State Machine) y Lógica de Bloqueos

Diseñado para soportar auditores externos bajo estándares _"Four-Eyes Principle"_.

1. **`DRAFT` (Borrador):** Propiedades mutables. Carga libre por el Cliente o el Consultor. Nada viaja al Módulo CO2.
2. **`IN_PROGRESS`:** Revisión continua. 
3. **`UNDER_REVIEW` (En Revisión Técnica):** El Cliente/Junior Consultor eleva a su Supervisor/Auditor Lider (Role: Auditor / Tenant Admin). El payload principal (EnergyRecords) se congela en Frontend (Disabled Input). Sólo se admiten comentarios.
4. **`REJECTED` (Rechazado):** El Auditor devuelve la Tarea. Se desbloquea para escritura informando el motivo (ej. "Mala lectura OCR de la factura").
5. **`VALIDATED` (Validado):** **Estado Terminal**. Congelamiento Estricto (Deep Freeze Db Level). Dispara **Eventos Asíncronos** (Pub/Sub) que le comunican al "Módulo Huella de Carbono" que procese los _EnergyRecords_ generados para pasarlos a Toneladas Equivalentes (tCO2e).
6. **`LOCKED` (Sistema):** Traba inquebrantable que salta cuando termina el año de reporte. Impide incluso que un _Tenant Admin_ manipule data de años declarados.

---

## 5. Dinámica de Cálculo y Exportación (Event-Driven)

1. En la Auditoría, todo se asienta en unidad en bruto (Kwh, m3). 
2. El "Consumo Total" de un `Grid` es un `reducer` in-memory.
3. **Pase a Huella de Carbono:** Al transicionar al estado `VALIDATED`, el módulo "Auditoría" publica un Evento de Dominio. 
   El "Módulo Carbono" lo escucha, toma la métrica (ej: 10,000 kWh), busca el "Factor de Emisión" congelado para la red eléctrica de ese país en ese mes específico (Ej: Argentina, Julio 2026 = 0.28 kgCO2e/kWh), clona la trazabilidad y estampa el documento resultante en `CarbonFootprintInventory`. 
   *(Evitamos cruzar tablas constantemente; aplicamos CQRS conceptual)*.

---

## 6. Portales Analíticos (Dashboards de Modulo)

**Panel del Auditor**
- Data-grid al estilo Prisma Studio o Excel integrado (Ag-Grid / React Data Grid), priorizando alta densidad de información. 
- Filtros rápidos `?status=UNDER_REVIEW`.
- Badge intermitente si la Suma Matemática entre Totales de Factura no da igual a Subtotales Leídos (Inconsistencia algorítmica).

**Panel de Usuario Final (Cliente/Planta)**
- Dashboard pasivo "Progreso x Categoría" (Barras % de avance).
- Call to Actions gigantes: `Upload Pendiente: Faltan Facturas Agua Septiembre`.
- Restricción DTO total sobre cambios al estado del _Workflow_ (Un cliente no puede auto-Validarse).
