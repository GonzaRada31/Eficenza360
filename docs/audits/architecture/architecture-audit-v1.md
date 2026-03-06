# Auditoría Arquitectónica Integral (Nivel Enterprise) - Eficenza 360
**Versión:** 1.0  
**Fecha:** 2026-03-03

---

## 1. Estado Actual

Eficenza 360 se estructura como un monorepo (Turborepo) compuesto por:
- **Backend (`apps/api`)**: NestJS, PostgreSQL + Prisma ORM.
- **Frontend (`apps/client`)**: React + Vite, React Router, React Query, Axios.

### 1.1. Arquitectura General y Modularidad
- El backend está fuertemente tipado y dividido en módulos de negocio claros (`iam`, `projects`, `invoice`, `carbon-footprint`, `activity-data`).
- El frontend utiliza `React Query` mediante hooks personalizados (ej. `useInvoice`, `useAttachments`), lo que denota una excelente separación de estado de servidor y UI.
- Se respeta en gran medida el principio de responsabilidad única (SOLID), delegando lógica de negocio a servicios (`*.service.ts`) y control de red a controladores.

### 1.2. Aislamiento Multi-Tenant
- Nivel de base de datos: Prisma Schema incluye la relación `tenantId` en la amplia mayoría de los modelos (`Company`, `Project`, `Task`, `Invoice`, etc.).
- Nivel de código: El aislamiento es **manual**. Los controladores inyectan o extraen el `tenantId` y lo pasan explícitamente a cada función del servicio, donde se agrega al `where` de Prisma.

### 1.3. Manejo de Errores y Logging
- Existe un filtro global `AllExceptionsFilter` que atrapa todos los errores no controlados.
- Las trazas se muestran en consola y se guardan localmente simulando un log en `error.log` mediante `fs.appendFileSync`.
- No hay integración de un logger estructurado JSON nativo (ej. Pino, Winston) preparado para ingestión (Datadog/ELK).

### 1.4. Seguridad General
- Autenticación controlada vía JWT y Passport (`IamModule`).
- Ausencia de protecciones básicas corporativas como Helmet (cabeceras seguras) y Rate Limiting.
- Faltan políticas estrictas de CORS para producción (actualmente abierto o restringido a localhost en algunos entornos).

### 1.5. Idempotencia en la Creación de Recursos
- Servicios críticos (como la creación de módulos y tareas referenciadas por plantillas) incorporan la noción de `deduplicationKey`. Este es un enfoque altamente robusto para evitar duplicidad, aunque por ahora no es transversal en todo el sistema y se apoya en búsquedas (findFirst) previas a las escrituras en código en lugar de Constraints de base de datos en algunos endpoints rápidos.

---

## 2. Riesgos Detectados

| Riesgo / Práctica a Mejorar | Nivel de Criticidad | Descripción y Consecuencia |
| :--- | :---: | :--- |
| **Fuga de Datos Multi-Tenant (Cross-Tenant Data Leak)** | **Alta** | Depender de que los desarrolladores recuerden agregar `tenantId` en todos los `where` de Prisma es frágil. Un olvido expondrá datos de otra empresa. |
| **Write-Log Distribuido / Stateful Storage** | **Alta** | Usar `fs.appendFileSync('error.log')` rompe los principios "12-Factor App" y bloquea la escalabilidad horizontal pura, causando latencia o fallos si las instancias del microservicio están en contenedores efímeros o serverless. |
| **Ausencia de Hardening HTTP** | **Media** | No disponer de Rate Limiting ni de Helmet expone la API a ataques de fuerza bruta y vulnerabilidades comunes de cabeceras web (XSS, Clickjacking prevenidos por defecto por Helmet). |
| **Estrategia de Soft-Delete Incompleta** | **Media** | Las eliminaciones en cascada son parcialmente manuales o dependen de cómo el frontend filtra las relaciones, en algunos casos se han dejado sentencias `@ts-ignore` donde los tipos chocan. |

---

## 3. Recomendaciones Concretas (Roadmap Enterprise)

1. **Prisma Client Extensions para RLS (Row-Level Security) Lógico:**
   - Implementar Middleware o Prisma Extension que aplique un `where: { tenantId }` de manera automática a *todas* las consultas, garantizando aislamiento transparente sin importar si el desarrollador omitió la condición.
2. **Implementación de Logging Estructurado & Centralizado:**
   - Reemplazar el logger por defecto y los archivos de disco local por `nestjs-pino`.
   - Formatear la salida en JSON para integrar con Datadog, CloudWatch AWS o un stack ELK.
3. **Reforzamiento de Seguridad Web:**
   - Instalar e integrar `helmet` en `main.ts`.
   - Implementar `@nestjs/throttler` de manera global para evitar abuso de API y scrapping de endpoints.
4. **Idempotencia vía Constraints en Base de Datos:**
   - Llevar todas las llaves de deduplicación a nivel de Constraint compuesto explícito (`@@unique([tenantId, deduplicationKey])`) en todos los modelos relevantes, como facturas y proyectos en Prisma schema.
5. **Erradicación de Deuda Técnica (`@ts-ignore`):**
   - Limpiar el código base de aserciones TypeScript que omiten reglas, creando tipos puente (DTOs intermedios) o mapeando correctamente los modelos de Prisma al cliente.
