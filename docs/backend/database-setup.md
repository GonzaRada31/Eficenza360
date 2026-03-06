# Database Hardening & SEED Setup (Phase 10)

This system provides safe, idempotent DB setups ensuring an isolation-first B2B platform. It enables rapid tear-downs and rebuilds while shielding sensitive RBAC boundaries.

## Commands Reference

Ensure you are located inside `apps/api/` prior to execution.

1. **`npm run setup:dev`**
   - Ideal for fresh clones.
   - Runs migrations (`prisma migrate dev`), initializes global queue cleanup, and boots the seed file recursively.

2. **`npm run seed`**
   - Invokes `prisma/seed.ts`.
   - Idempotently guarantees `Roles`, `Permissions`, the `eficenza-demo` Tenant, and predefined Demo profiles exist using safe `upsert()` checks.

3. **`npm run reset:data`**
   - Wipes transactional operational rows (e.g. Audits, Invoices, CarbonFootprint queries, Logs).
   - Core boundary data (**Users, Tenants, Roles**) are left strictly intact protecting access boundaries.

4. **`npm run reset:queues`**
   - Communicates with IORedis/BullMQ draining `wait`, `active`, and `failed` DLQ queues seamlessly for tests.
   - Fallback raw-redis purge ensures environments stay deterministic.

### Security Note
- Admin users are hashed with **Argon2id**. 
- Prisma isolation patterns automatically shield cross-contamination among seeded users mapped distinctively to the `tenant-demo` space.
