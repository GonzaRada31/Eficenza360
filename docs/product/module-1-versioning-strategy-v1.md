# Gobernanza de Versionado y Auditoría Legal - Módulo 1
**Versión:** 1.0  
**Enfoque:** Evitar repudio probatorio y garantizar inmutabilidad ISO 50001.

---

## 1. El Dilema del Snapshot y la Inmutabilidad

Un registro de carbono (`tCO2e`) en el sistema no es un cálculo en vivo o una "Vista SQL". **El cálculo debe ser una fotografía indeleble.**

### 1.1. ¿Qué se versiona y qué se "Snapshea"?
- **La Auditoría Completa (Audit):** Sí, recibe versiones macro (v1, v2, v3). 
- **Registros Individuales:** Sólo se guardan en el Log Histórico (Audit Trail `AuditLogActivity` = "Menganito cambió Consumo 50 a Consumo 100").
- **Cálculos y Factores de Emisión:** Sufren **Snapshot Obligatorio** al pasar al estado `VALIDATED`. Se clona el valor aritmético estático al récord transaccional de huella (ej. `snapshottedEmissionFactorValue: 0.28`). De este modo la base de datos es inmune a las actualizaciones normativas globales del año entrante.

---

## 2. Definición Jurídica de la Máquina de Estados

La transición de estados representa bloqueos de campo a nivel Bases de Datos, verificados directamente en los interceptores de NestJS (Los DTOs y _PartialTypes_ en Frontend no son suficientes).

| Estado | Quién Puede Cambiarlo | Campos Mutables permitidos | Restricciones de Sistema |
| :--- | :--- | :--- | :--- |
| **DRAFT** | Cualquiera con acceso al `Project` | Todos los registros libres. | Ninguna. |
| **UNDER_REVIEW** | Auditor Jr -> Tenant Admin | **Ninguno**. (Bloqueo Parcial). | Sólo se permiten mutar `comentarios` o `aprobaciones internas`. Cero inputs numéricos alterables. |
| **REJECTED** | Tenant Admin | Retorna a DRAFT virtualmente. | Requiere adjuntar obligatoriamente el JSON con el motivo de rechazo en el log. |
| **VALIDATED** | Tenant Admin / Consultor Sr | **ABSOLUTAMENTE NINGUNO**. (Deep Freeze) | Desencadena Sagas/Eventos de cálculo final en background. |
| **LOCKED** | Sistema (Cierre Anual Cronjob) | - | Indeleble. Ni siquiera puede ser "Re-Abierto". Queda sellado legalmente. |

---

## 3. Protocolo Legal de "Rollback" (Reapertura de VALIDATED)

Una auditoría `VALIDATED` puede haber emitido un reporte público que el cliente ya entregó a sus accionistas. Corregir una auditoría validada sin dejar rastro es manipulación fraudulenta.

**Secuencia de Re-Apertura:**
1. **Petición Fuerte:** Solo un `Tenant Admin` puede pulsar "Reabrir Auditoría".
2. **Registro Obligado:** Debe completar un _Prompt_ obligatorio explicando el motivo del error técnico (ej. "Lectura de OCR defectuosa en mes Abril, el cliente nos notificó un ajuste de tarifa").
3. **Mecanismo Saga:**
   - La API muta el estado a `IN_PROGRESS`. 
   - La columna `version` de la entidad Audit sube (`v1` -> `v2`).
   - El sistema emite por el Event Bus Interno el aviso: `ENERGY_AUDIT_REVERTED_TO_DRAFT`.
   - El Módulo dependiente (Huella de Carbono) caza el evento, ubica todas las toneladas de CO2 previamente inyectadas por ese *AuditID*, y ejecuta un `softDelete` marcándolas como `OBSOLETE_DUE_TO_ROLLBACK`.
4. De este modo, la plataforma mantiene un cordón de confianza forense invulnerable.
