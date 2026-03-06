# Matriz de Priorización para Producción
**Versión:** 1.0

Este documento clasifica la deuda técnica y los requerimientos arquitectónicos en orden estricto de resolución basado en el Riesgo Vital para el SaaS.

---

## 🔴 CRÍTICO (Bloquean Producción Inmediatamente)
*Deben remediarse en la Fase 1 o el servidor se caerá/corromperá datos a la primera semana.*

| ID | Riesgo / Ítem | Impacto Operativo | Esfuerzo | Dependencias |
| :--- | :--- | :--- | :---: | :--- |
| **C-01** | **Reemplazo de Logs Síncronos (`fs.appendFileSync`)** | Caída del Servidor (NodeJS Event Loop Blocked). | Bajo | Ninguna |
| **C-02** | **Implementación estricta de DTOs en Controladores** | Mass Assignment, inyección de campos (`tenantId` fake). | Medio | Ninguna |
| **C-03** | **Prisma Queries sin Restricción (OOM Risk)** | Servidor agotará la memoria RAM devolviendo Data Trees masivos. | Medio | DTOs Backend |
| **C-04** | **SAS Tokens a 15 Minutos + Validación `fail-fast` Env Vars**| Fuga persistente de reportes privados, crash tardío en runtime. | Bajo | Ninguna |
| **C-05** | **Race Conditions en Facturas y Proyectos (Unique Constraints)** | Inconsistencia en métricas CO2, duplicación en base de datos. | Medio | DTOs, Prisma Schema |

---

## 🟠 ALTO (Deben resolverse antes del Escalado B2B)
*La app puede vivir sin esto unos días con pocos usuarios, pero morirá al primer mes de crecimiento.*

| ID | Riesgo / Ítem | Impacto Operativo | Esfuerzo | Dependencias |
| :--- | :--- | :--- | :---: | :--- |
| **A-01** | **Infraestructura CI/CD y Dockerfiles Multi-stage** | Despliegue manual propenso a errores humanos y downtime. | Alto | Pipeline Remoto |
| **A-02** | **Colas y Workers Asíncronos (BullMQ para OCR/CO2)** | Timeout HTTP, mala UX, saturación de CPU de API principal. | Alto | Redis, Nuevos Módulos |
| **A-03** | **Hardening de Seguridad (Helmet + `@nestjs/throttler`)** | Vulnerabilidad de fuerza bruta, abuso de Storage (Multer sin mime-type limit). | Medio | Ninguna |
| **A-04** | **Desacoplamiento Frontend (Romper Componentes Dios)** | Mala experiencia de usuario (lentitud), re-renders colapsantes en React. | Alto | Nuevos Custom Hooks |

---

## 🟡 MEDIO (Mejoras Estructurales B2B)
*Necesario para estatus Enterprise y Mantenibilidad a largo plazo.*

| ID | Riesgo / Ítem | Impacto Operativo | Esfuerzo | Dependencias |
| :--- | :--- | :--- | :---: | :--- |
| **M-01** | **Implementación Logger Estructurado (Pino / Datadog)** | Falta de observabilidad y trazabilidad (dificultad para debuggear bugs en prod). | Medio | C-01 Resuelto |
| **M-02** | **Salud de Infraestructura (Terminus Health-Checks)** | Imposibilidad para el Load Balancer de detectar APIs caídas o bases colgadas. | Bajo | Ninguna |
| **M-03** | **Panel Frontend Dividido por RBAC Estricto** | Confusión del "Usuario Cliente" viendo paneles de Tenant Admin. | Medio | DTOs de Autenticación |

---

## 🟢 BAJO (Optimizaciones Futuras - Post Go-Live)
*Características avanzadas que agregan gran valor o resiliencia 10x posterior.*

| ID | Riesgo / Ítem | Impacto Operativo | Esfuerzo | Dependencias |
| :--- | :--- | :--- | :---: | :--- |
| **B-01** | **Arquitectura de Microservicios Híbrida (Eventos Nativos)** | Preparación abstracta para el Marketplace B2B y Plugins de Reportología ISO. | Alto | A-02 BullMQ |
| **B-02** | **Virtualización (Windowing) en Grillas Frontend** | Scroll infinito en lista de facturas u auditorías sin usar Memoria RAM del Browser. | Medio | M-03 finalizado |
