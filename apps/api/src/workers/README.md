# Background Workers (`apps/api/src/workers`)

This directory houses the background processes consuming payloads from BullMQ (Redis). These scripts are intentionally stripped of `Express.js/Nest Web Server` dependencies allowing them to be fully segregated across Kubernetes worker instances or invoked locally purely under Node via `npm run workers` utilizing `main.worker.ts`.

Key Rule: All logic executed MUST cross-check signatures dynamically against `IdempotencyValidator` to stop repeating network failures.
