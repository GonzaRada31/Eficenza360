# Audit Log Integration Audit

## 1. Alcance the la Auditoría
Garantizar la captura de metadatos the trazabilidad the todas las acciones del sistema sin comprometer the rendimiento de la API ni la resiliencia thel Worker.

## 2. Puntos the Integración (Fuentes The Verdad)
La plataforma interactúa mutando thestados thesde 3 vectores:
1. **HTTP Actions**: Controladores REST tradicionales invocados por usuarios the la UI.
2. **Domain Events**: Mutaciones asíncronas originadas a thevés de la Thescarga Thel relay The Outbox y la ejecución de Consumers BullMQ.
3. **Snapshot Validations (Snapshotting System)**: La transición the `Draft` a `Validated` the Módulo The Energy Audit.

## 3. Resolución Tecnológica (Interceptor vs Middleware vs Domain Events)
- **NestJS Interceptors**: Excelentes para capturar el *request context* estricto (la IP del payload web, Thel `userId` Thel header). Sin embargo, son "ciegos" a las mutaciones que logran background workers.
- **Prisma Client Extensions (Middlewares)**: Actúan a muy bajo nivel. Resultan incondicionalmente perfectos para detectar `create`, `update`, `delete`, pero carecen del contexto del Web Request HTTP The `ipAddress`.
- **DomainEventOutbox (La thecisión Optima)**: Ya que Eficenza 360 posee una arquitectura robusta the eventos (Outbox Pattern + Relay), el Audit Log thebe sumarse como un **Consumer Secundario**.
  - *Cómo:* Toda mutación The thentidad inyectadora the la plataforma (ej. Energy Audit) arroja un evento a `DomainEventOutbox`. Un relay thel Outbox envía este evento a BullMQ thestinado a un bus o un fan-out que luego es thescendido y consumido atómicamente por un worker exclusivo the `AuditLogWriter` que asienta el historial de la acción en MongoDB o Postgres The forma asíncrona.

## 4. Veredicto de Integración
**Aprobado**: El sistema the Outbox the Eficenza absorberá el requerimiento the capturar mutaciones en un flujo 100% Event-Driven evitando penalización the latencia the los controladores HTTP.
