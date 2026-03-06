# Plan de Acción - Preparación a Producción (CI/CD)
**Versión:** 1.0

Las siguientes tareas estructuradas garantizan un pase a producción _Zero-Downtime_, resiliente y completamente automatizado (GitOps).

## Fase 1: Dockerización y Pipelines (CI)

### Tarea 1.1: Dockerfiles Multi-Stage de Producción
**Objetivo:** Aislar los binarios para ser ejecutables en cualquier Nube sin dependencias globales (`node_modules` ajenos al proyecto).
- [ ] Crear `apps/api/Dockerfile` optimizado construyendo la app, empaquetando el binario Prisma (Linux glibc/musl) y purgando dependencias dev.
- [ ] Crear `apps/client/Dockerfile` basado en `nginx:alpine` para servir la carpeta estática del SPA de `Vite` con las reglas de react-router (fallback a `index.html`).

### Tarea 1.2: Infraestructura CI (Verde) en GitHub Actions
**Objetivo:** Evitar que código roto sea fusionado a ramas principales.
- [ ] Configurar `.github/workflows/ci.yml`.
- [ ] Ejecutar `turbo run lint build test` en paralelo, bloqueando la *Pull Request* si algo rompe el sistema.

---

## Fase 2: Estrategia CD y Orquestación

### Tarea 2.1: Pre-Boot Sequence y Manejo Inteligente de Container
**Objetivo:** Prevenir que la APP inicie antes que la Base de Datos.
- [ ] Corregir `"start:prod"` en `apps/api/package.json` a: `npx prisma migrate deploy && node dist/main`. 
*(Importante: `migrate deploy` es imperativo, NUNCA usar `migrate dev` en producción).*

### Tarea 2.2: Implementación de Puntos de Salud (Health Checks)
**Objetivo:** Informar al orquestador Cloud si el contendor está saludable.
- [ ] Utilizar `@nestjs/terminus` para crear el controlador `/api/health`.
- [ ] Asegurar los monitores internos `PrismaHealthIndicator` y validación de conectividad al Storage Blob (Azure).

---

## Fase 3: Operaciones Nube (Día 2) y Backups

### Tarea 3.1: Configuración de Entornos Staging vs Production
**Objetivo:** Tener un clon 1:1 de producción aislado y privado para QA.
- [ ] Separar la administración de variables en Doppler, AWS Secrets Manager o GitHub Environments con _Secrets_. (Sustituir `.env` crudos en disco).

### Tarea 3.2: Backups B2B DCR (Disaster Recovery)
**Objetivo:** Nunca perder historial corporativo clave (Emisiones registradas).
- [ ] Delegar el PITR (Point-In-Time) a la plataforma subyacente de la Base de datos (ej. Azure Postgres Flexible Server Backup con retención de 30 días). Retirar este manejo de la Capa de Lógica.
