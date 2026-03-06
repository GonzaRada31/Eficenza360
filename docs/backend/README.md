# Backend Systems Documentation

The core API of Eficenza operates securely under strict Multi-Tenant and Event-Driven definitions. Review the subsequent documents to learn more about localized abstractions.

## Contents
- **`architecture.md`**: Broad overview detailing precisely how NestJS, AsyncLocalStorage, Prisma, and OpenTelemetry link up.
- **`database-setup.md`**: Rules explaining the Safe Seed parameters allowing local testing.
- **`event-architecture.md`**: Insights into the Outbox Relay + BullMQ retry implementation.
