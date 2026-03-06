# Arquitectura de Plataforma: Eficenza 360

## 1. Visión General
Eficenza 360 es una plataforma SaaS B2B Enterprise diseñada para gestionar auditorías energéticas, huella de carbono y cumplimiento ESG. Su arquitectura está orientada a eventos, es altamente resiliente y garantiza aislamiento multi-tenant estricto.

## 2. Core Platform Modules (Módulos Base)
- **Identity & Access Management (IAM)**: Control de roles, permisos granulares (Matriz de Permisos), autenticación corporativa y aislamiento por `tenantId`.
- **Tenant Management**: Administración de subscripciones, configuraciones globales por empresa y branding.
- **Workflow Engine & State Machine**: Gestión de estados (Draft, Validated, Canceled) con control de concurrencia optimista (OCC) mediante versionado de entidades.

## 3. ESG Modules (Módulos de Negocio)
- **Energy Audit (Módulo 1)**: Auditorías energéticas inmutables mediante Snapshotting. Registros históricos en tablas separadas.
- **Carbon Footprint**: Cálculo de huella de carbono impulsado por una arquitectura *Event-Driven* orientada a dominio.
- **Compliance & Reporting**: Generación de reportes de cumplimiento basados en normativas internacionales (ISO 50001, GHG Protocol).

## 4. Analytics
- **Dashboards Operativos**: Visibilidad en tiempo real de consumos y progreso de metas.
- **Data Warehouse Integration**: Preparación de datos para inteligencia de negocios y extracción a herramientas de Business Intelligence (BI).

## 5. Shared Infrastructure
- **Base de Datos Relacional (Postgres 15+)**: Modelado con Prisma ORM. Tablas segregadas y constraint P2002 para garantizar el *Exact-Once Delivery*.
- **Message Broker & Task Queue (Redis + BullMQ)**: Cola de trabajos asíncronos para tareas pesadas y comunicación inter-servicios.
- **Outbox Relay Worker (Standalone)**: Microservicio en NestJS que actúa como relé transaccional, leyendo la tabla `DomainEventOutbox` con locks (`FOR UPDATE SKIP LOCKED`) y transformando registros en jobs de BullMQ.
