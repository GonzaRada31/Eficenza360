# Auditoría Backend (NestJS + Prisma) - Eficenza 360
**Versión:** 1.0  
**Fecha:** 2026-03-03

---

## 1. Estado Actual de la Arquitectura

El backend está construido sobre NestJS con una clara división de módulos lógicos (`iam`, `projects`), aplicando correctamente el patrón de Controladores (enrutamiento) y Servicios (lógica de negocio). La integración fundamental con Prisma permite tipado fuerte.

### 1.1. Seguridad Multi-Tenant
- ✅ La inyección de `tenantId` desde el `JwtAuthGuard` hacia el `Request` del usuario es la práctica correcta.
- ✅ Los Controladores obligan a pasar el `req.user.tenantId` a los servicios para las operaciones DML, impidiendo fugas de datos inter-empresa si se manipulan los parámetros URL.

---

## 2. Riesgos Críticos Detectados

A continuación, los problemas arquitectónicos que impedirían salir a producción de forma segura:

| Riesgo Detectado | Nivel | Descripción Técnica y Consecuencias |
| :--- | :---: | :--- |
| **Falsa Validación de DTOs en Runtime** | **Crítica** | En `projects.controller.ts`, endpoints como `create` o `update` usan tipos generados por Prisma (`Prisma.ProjectUncheckedCreateInput`). Como estos son `interfaces` o `types` de TypeScript (y no `clases` con decoradores `class-validator`), **no existen en tiempo de ejecución**. Al tener el `ValidationPipe` en `main.ts` con `whitelist: true`, este despoja todo el payload recibido, o peor aún, si falla y desactiva el whitelist dejará pasar cualquier ataque por inyección masiva (Mass Assignment). |
| **Operaciones I/O Síncronas Bloqueantes** | **Alta** | En `all-exceptions.filter.ts`, se utiliza explícitamente `fs.appendFileSync` para loggear errores. NodeJS es Single-Thread; al usar una función de archivo sincrónica, **todas las peticiones HTTP concurrentes de otros usuarios quedan congeladas** mientras el disco duro escribe el log. En un pico de tráfico, tirará abajo el servidor. |
| **Falta de Preparación para Jobs Intensivos** | **Media** | Endpoints de carga como parsing OCR (facturas energéticas) carecen de integración con un Message Broker (como `BullMQ` + `Redis`). Si 50 usuarios suben facturas grandes simultáneamente, los cálculos en el hilo principal bloquearán la aplicación completa (Denegación de Servicio - DoS). |
| **Ausencia de Hardening HTTP y Rate Limiter** | **Media** | `main.ts` no implementa librerías esenciales de NestJS como `helmet` (para securizar cabeceras DNS, XSS, Sniffing de Mimetypes) ni un mitigador de fuerza bruta `@nestjs/throttler`. |
| **Logging No-Estructurado (Mala Observabilidad)** | **Baja** | Los logs actuales son texto plano concatenado con `\n`. En herramientas modernas como Datadog o ELK, se necesita JSON Indexable para poder cruzar variables genéricas (`tenantId`, `traceId`) y encontrar errores rápidamente. |

---

## 3. Conclusión

El core transaccional está bien planteado en estructura, pero presenta brechas importantes en la validación de entrada (DTOs omitidos) y en la estrategia asíncrona (escribe síncronamente a disco y procesa cálculos pesados in-place). Afortunadamente, al ser NestJS, la refactorización arquitectónica requerida es altamente soportada por la comunidad a través de decoradores declarativos.
