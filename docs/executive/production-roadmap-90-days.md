# Roadmap 90 Días hacia Producción
**Versión:** 1.0  
**Objetivo:** Transición Segura de Prototipo a Enterprise B2B.

Este plan técnico describe la ejecución secuencial de refactorizaciones y devops necesarias para abrir la plataforma al público sin riesgo legal ni operativo.

---

## Mes 1: Estabilización Arquitectónica (Fase 1)
*Enfoque puramente backend y base de datos. Ningún feature visual nuevo.*

- [ ] **Semana 1: Fixes Críticos de API**
  - Eliminar validaciones fantasmas: Implementar DTOs estrictos en todos los controllers principales (`Projects`, `Invoices`).
  - Reducir el TTL de Azure SAS a 15 Minutos en `AttachmentsService`.
- [ ] **Semana 2: Integridad de Base de Datos**
  - Agregar Unique Constraints a `Project`, `Invoice` cruzando `tenantId` + `deduplicationKey`.
  - Revisión exhaustiva de Queries Prisma para colocar paginación obligatoria y limpiar los deep `include`.
- [ ] **Semana 3: Observabilidad Inicial**
  - Reemplazar script síncrono `fs.appendFileSync` por `nestjs-pino` asíncrono.
  - Fail-Fast Config: Implementar esquema de validación `Joi` en el `ConfigModule`.
- [ ] **Semana 4: Auditoría de Fixes**
  - Correr Test Suites End-to-End sobre el flujo de Ingreso de Factura y Creación de Proyecto.

---

## Mes 2: Robustez Enterprise (Fase 2)
*Enfoque en Infraestructura, Despliegue y UX de alto rendimiento.*

- [ ] **Semana 1: Dockerización**
  - Creación de `Dockerfile` multi-stage para NestJS API.
  - Creación de `Dockerfile` nginx para React SPA.
- [ ] **Semana 2: Canal de Integración Continua (CI)**
  - Configuración de GitHub Actions (Lint, Typecheck de Turborepo, y Tests automatizados en cada Pull Request).
- [ ] **Semana 3: Computación Asíncrona (Eventos)**
  - Levantar instancia Redis.
  - Configurar BullMQ en NestJS. Mover toda lógica de parseo de Facturas al Background Worker.
- [ ] **Semana 4: Refactor Frontend Crítico**
  - Destruir el "God Object" `ProjectDetailsPage`.
  - Implementar virtualización de React (`react-window` o `react-virtuoso`) para listas de subtareas.

---

## Mes 3: Hardening + Pre-Producción y Go Live Controlado (Fase 3 y 4)
*Enfoque en Seguridad perimetral y Rollout a Beta Testers.*

- [ ] **Semana 1: Hardening API**
  - Instalación global de `Helmet`.
  - Implementación de `@nestjs/throttler` (Rate Limiting) para login e ingesta de datos.
- [ ] **Semana 2: CD y Health checks**
  - Implementar `/api/health` con `@nestjs/terminus`.
  - Crear workflow de autodespliegue (CD) contra Staging (Azure Container Apps / ECS) acoplado a la rama `main`.
- [ ] **Semana 3: Pruebas de Carga (Stress Testing)**
  - Ejecutar tests de K6 simulando a 100 tenant admins subiendo 500 facturas concurrentes para probar el Worker de BullMQ.
- [ ] **Semana 4: Go Live V1.0**
  - Activar retención PITR de Base de Datos.
  - Apertura de URLs a Consultoras fundadoras (Beta). Monitoreo hiper-vigilante de logs de Datadog/Pino.
