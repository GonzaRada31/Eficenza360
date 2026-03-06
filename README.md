# Eficenza 360

## Enterprise B2B SaaS Platform

Eficenza 360 is a fully scalable, enterprise-grade B2B SaaS designed for industrial and mining operations. It specializes in **Energy Auditing**, **Carbon Footprint Calculation**, **Document Management**, and automatic **Usage-Based Billing**.

## Architecture Overview
The platform embraces a **Modular Monolith** pattern transitioning securely to Microservices using an Event-Driven backbone.

- **Multi-Tenant Isolation**: Strict Zero-Data Leakage constraints pushed deep into the ORM (Prisma) using Node `AsyncLocalStorage`. Transactions and queries are natively bounded by `tenantId`.
- **Event-Driven Backpacking**: We employ the **Outbox Pattern** (`DomainEventOutbox`). Synchronous business transactions dump events securely into the DB. An independent worker relays these payloads selectively to external Queues guaranteeing Idempotency.
- **RBAC**: Zero Trust models strictly governed by JWT, Custom `@Permissions` decorators, and unified NestJS Guards mapping dynamic user roles (`admin.system`, `auditor`, `tenant.admin`).

## Tech Stack
- **Backend:** NestJS, TypeScript, PostgreSQL (Prisma ORM)
- **Queues:** Redis & BullMQ
- **Observability:** OpenTelemetry pre-configured to export `/metrics` to Prometheus.
- **Frontend:** React, Next.js App Router, Tailwind, TanStack Query.
- **Storage:** S3-Compatible Blob Storage utilizing direct Presigned URLs.

## Development Guide
Follow these steps to bootstrap the backend locally:

1. Clone and ensure Node 20+ & Docker.
2. Duplicate `.env.example` to `.env` inside `/apps/api`.
3. Start backing services (DB, Redis): `docker-compose up -d`.
4. From `/apps/api`, cleanly mount the schema and seed isolated demo data: 
   ```bash
   npm run setup:dev
   ```
5. Ignite the API HTTP node:
   ```bash
   npm run dev
   ```
6. (Optional) Run domain-workers in an independent terminal to consume the event queues:
   ```bash
   npm run workers
   ```

## Key Available Scripts (`/apps/api`)
- `npm run setup:dev` - Wipes state safely, migrates Schema, and boots `prisma/seed.ts`.
- `npm run reset:data` - Obliterates operational data (Audits, Documents) maintaining original Users and Roles.
- `npm run reset:queues` - Purges the BullMQ state freeing memory from dead jobs.
