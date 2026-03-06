# CHANGELOG

## [Unreleased] - Implementation Phases 8 through 10

### Fase 10 - Database Hardening & Seed System
- **Added:** `reset-data.ts` and `reset-queues.ts` scripts to orchestrate safe purges allowing localized test scaffolding.
- **Added:** A unified `prisma/seed.ts` system generating idempotent `tenant.admin` profiles mappings explicitly bounded inside the `eficenza-demo` Tenant boundary.
- **Added:** `package.json` configurations abstracting complex dev-workflows entirely (`setup:dev`).

### Fase 9 - Event Processing Architecture
- **Added:** `OutboxRelayWorker` directly probing `DomainEventOutbox` over secure PostgreSQL table locks (`SKIP LOCKED`).
- **Added:** BullMQ configurations connecting domains (`audit`, `carbon`, `document`) utilizing Backoff Retry schemas.
- **Added:** A distinct `IdempotencyValidator` intercepting processing loops against the `EventProcessingLog` table shielding workers from Double-Execution faults.
- **Added:** OpenTelemetry traces calculating Queue Latency metrics implicitly exported to `/metrics`.

### Fase 8E - Controllers & DTO Validation
- **Added:** `AllExceptionsFilter` acting as a global net translating raw Prisma exceptions (`P2002`) into secure normalized HTTP outputs.
- **Added:** Complex Data Validation pipelines (DTOs) employing `class-validator` arrays resolving nested Sub-Domain structures (like Activities mapped inside calculations).
- **Added:** Complete automated Swagger generation (`/api/docs`).

### Fase 8D - Domain Services Development
- **Added:** Robust B2B Sub-Domain Modules matching Business requirements (Energy Audits, OCC Carbon Engine scaling complex Activity vectors, Document Versioning schemas linking with AWS S3 adapters).
- **Security:** Injected `tenantClient` logic deep inside services removing the need to append `tenantId` manually inside Prisma `$transaction` clauses.

### Fase 8C - IAM & Tenant Lifecycle
- **Added:** Argon2id secured Authenticators generating strictly scoped JSON Web Tokens enriched with dynamic Permissions strings mapping directly from the DB.
- **Added:** Tenant Provisioning schemas triggering external Domain Events (`TENANT_CREATED`).

### Fase 8 - Backend Skeleton Overview
- **Added:** Foundational NestJS structures standardizing Dependency Injections mapping across custom Interceptors predicting multi-cluster horizontal scaling.
