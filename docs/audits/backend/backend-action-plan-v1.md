# Plan de Acción - Backend Eficenza 360
**Versión:** 1.0

Las siguientes tareas subsanan métricas de seguridad perimetral, DTOs y preparan el ecosistema Node.js para computación asíncrona de alto volumen e integrabilidad continua.

## Fase 1: Sellado de Inputs y Vulnerabilidades

### Tarea 1.1: Migración a DTOs de Class Validator Estrictos
**Objetivo:** Evitar fallos de Runtime de validación y ataques de Asignación Masiva.
- [ ] En `/modules/projects/`, crear la carpeta `/dto` e implementar `CreateProjectDto`, `UpdateProjectDto`, `CreateTaskDto`, etc., empleando clases con decoradores (`@IsString()`, `@IsOptional()`).
- [ ] Refactorizar `projects.controller.ts` reemplazando los `Prisma.*CreateInput` con las nuevas clases.
- [ ] Asegurarse de quitar `deduplicationKey` y `tenantId` de los DTOs expuestos al cliente; deben ser inyectados/controlados por el servidor estrictamente.

### Tarea 1.2: Endurecimiento (Hardening) de API (Seguridad)
**Objetivo:** Cumplir lineamientos OWASP básicos.
- [ ] Instalar e integrar `helmet` en `main.ts` (`app.use(helmet())`).
- [ ] Instalar `@nestjs/throttler` e importarlo globalmente en el `AppModule` para mitigar ataques DDoS (ej: Ttl 60s, limit: 100 requests por IP).

---

## Fase 2: Robustez de Errores y Observabilidad

### Tarea 2.1: Refactorización Asíncrona de Logs (Evitar Event Loop Blocking)
**Objetivo:** Prevenir caídas del sistema por culpa del I/O de disco.
- [ ] En `all-exceptions.filter.ts`, reemplazar `fs.appendFileSync` por librerías asíncronas (`fs.promises.writeFile(..., { flag: 'a' })`) o un stream manejado.
- [ ] Reemplazar la concatenación de strings por un objeto JSON estructurado que incluya obligatoriamente el `req.user.tenantId` (si existe dentro del error).

### Tarea 2.2: Transición a Logger Estructurado (Pino)
**Objetivo:** Empezar a mandar métricas claras a monitoreos Cloud.
- [ ] Implementar `nestjs-pino` para unificar todos los logs internos de Nest.
- [ ] Desactivar los `Logger` console nativos en producción.

---

## Fase 3: Preparación Arquitectónica Escalable (Roadmap Inmediato)

### Tarea 3.1: Infraestructura de Background Jobs (BullMQ)
**Objetivo:** Desacoplar cálculos de CO2 pesados y parser de PDFs largos del hilo principal de las solicitudes HTTP.
- [ ] Instalar dependencias `@nestjs/bull`, `bullmq` y un Redis local (o Azure Cache).
- [ ] Levantar un `QueueModule` para registrar colas pesadas: `invoice-parser` y `mass-carbon-calc`.
- [ ] Crear *Consumers* (Workers) independientes que procesen la lógica separadamente, retornando un "Estado: Pendiente" inmediato en la Rest API a nivel Frontend.
