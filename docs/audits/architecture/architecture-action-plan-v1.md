# Plan de Acción - Mejoras Arquitectónicas Eficenza 360
**Versión:** 1.0

Las siguientes tareas están diseñadas para ser implementadas de forma progresiva, garantizando la estabilidad de la plataforma y eliminando deuda técnica sistémica.

## Fase 1: Prevención Crítica (Alta Prioridad)

### Tarea 1.1: Aislamiento Multi-Tenant Estricto Automático
**Objetivo:** Evitar cualquier posible filtración de información entre clientes ocasionada por un error humano (olvido de `where: { tenantId }`).
- [ ] Incorporar Prisma Client Extension o Middleware (en un PR/Commit dedicado).
- [ ] Interceptar en tiempo de ejecución (`$allModels.$allOperations`) e inyectar automáticamente el `tenantId` en base al contexto actual de la solicitud async (AsyncLocalStorage con `ClsService` o similar, o pasándolo modificado explícitamente).
- [ ] Eliminar la necesidad de declarar `tenantId` en los métodos de todos los `Service` capa por capa.

### Tarea 1.2: Hardening de API (Seguridad Perimetral)
**Objetivo:** Proteger los endpoints públicos e internos ante uso malintencionado.
- [ ] Instalar `helmet` como middleware global en `main.ts`.
- [ ] Instalar `@nestjs/throttler` e implementarlo de manera global (por ej: límite de 100 peticiones / minuto por IP).
- [ ] Configurar configuración CORS robusta utilizando variables de entorno en lugar de arrays duros para orígenes conocidos.

---

## Fase 2: Robustez Operacional (Preparación para Producción)

### Tarea 2.1: Logging Estructurado (Adiós a disco local)
**Objetivo:** Adoptar formato de logs para integración con herramientas de monitoreo (AWS CloudWatch / Datadog).
- [ ] Eliminar escrituras a disco en `AllExceptionsFilter.ts` (`fs.appendFileSync`).
- [ ] Instalar paquete `nestjs-pino` y `pino-http`.
- [ ] Reemplazar la instanciación principal en `main.ts` y configurar a nivel global en `AppModule` para imprimir logs en formato de un solo nivel (JSON).
- [ ] Estandarizar mensajes de error del bloque `catch` para incluir la traza original y no solo HTTP-friendly string en los metadatos de Pino.

---

## Fase 3: Salud del Código & Escalamiento Técnico

### Tarea 3.1: Patrón de Errores Tipados
**Objetivo:** Eliminar throw directos de clases genéricas y estandarizar dominio.
- [ ] Crear dominios de error basados en clases hijas (`ProjectNotFoundError`, `TenantMismatchError`).
- [ ] En Swagger (DTOs), reflejar fuertemente la estructura del Error (Código, Mensaje, Contexto).

### Tarea 3.2: Limpieza de TS Ignores
**Objetivo:** Recuperar la predictibilidad y estricto tipado del compilador.
- [ ] Revisión exhaustiva del archivo `projects.service.ts` y relacionados.
- [ ] Sustituir `@ts-ignore` por el casteo correcto en queries complejas o en ordenamiento (e.g. validando campos inexistentes en query explícita vs implícita en Prisma).

### Tarea 3.3: Integridad Referencial Idempotente Garantizada
**Objetivo:** Soportar resiliencia en transacciones.
- [ ] Validar que todos los procesos de Background (Jobs, Scripts, Seeders) envíen el Payload con `deduplicationKey` y que el engine de Prisma lo resuelva a nivel relacional de BD implementado a través de `upsert`.
