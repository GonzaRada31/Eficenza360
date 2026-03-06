# Registro de Decisiones Arquitectónicas (Decision Log)
Este documento funge como un ADR (Architecture Decision Record). Todo giro arquitectónico grande, elección de frameworks clave o reestructuracion del producto debe formalizarse aquí, respondiendo el **contexto** y el **por qué**.

---

## Estructura de Registro

**ID de Decisión:** ADR-XXX
**Fecha:** YYYY-MM-DD
**Decisión:** [Resumen de lo adoptado]
**Contexto:** [¿Cuál era el problema o la encrucijada?]
**Consecuencias:** [Beneficios ganados vs Proséticos perdidos / Trade-offs]

---

## Log Histórico

### ADR-001: Adopción del Patrón Multi-Tenant por Discriminador Lógico (`tenantId`)
**Fecha:** 2026-03-03
**Decisión:** Implementar la arquitectura SaaS de multitenancy mediante Discriminador Lógico (Pool único de bases de datos, con la columna `tenantId` en cada tabla), descartando la Base de Datos o Esquema Múltiple (Schema-per-tenant).
**Contexto:** Eficenza 360 apunta a escalar a un volumen masivo de múltiples consultoras de todos los tamaños. Levantar un sub-esquema nuevo por cada free plan encarecía la infraestructura en fase temprana.
**Consecuencias:** 
- *Pro:* Despliegues más rápidos de base de datos, migraciones simples en un hilo, estructura monolítica inicial muy manejable.
- *Contra:* Mayor riesgo humano si un programador olvida adjuntar la restricción `tenantId` en un Query Prisma filtrando Data.
- *Mitigación:* Dependencia absoluta de los Guardias de NestJS y requerimiento obligatorio del atributo en todos los Services.

### ADR-002: Inicialización de Turborepo
**Fecha:** 2026-03-03
**Decisión:** Utilizar el ecosistema de Turborepo para envolver NestJS, Prisma y Vite React en un formato de Monorepo (apps/api, apps/client, packages/database).
**Contexto:** Se requiere compartir validaciones de tipos (TypeScript Type Sharing) explícitas entre cliente y API, logrando una "End-to-end Type Safety". 
**Consecuencias:**
- Mayor cohesión al estandarizar comandos y variables en un solo repositorio de Git. 
- Permite caché de *builds* acelerando el CI/CD fuertemente.
