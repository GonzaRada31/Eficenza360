# REST API Modules (`apps/api/src/modules`)

This directory comprises all standard HTTP Controllers and B2B Domain logic acting as boundaries mapping Prisma Transactions.

Modules follow a typical Clean Architecture path:
`Controller → DTO Validation Pipe → Guards (Auth/Permission) → Services (TenantAware Prisma)`. 

Note: Domain transactions generally finish synchronously by pushing a side-effect representation onto the `DomainEventOutbox`. This guarantees fast response loops freeing Node HTTP threads.
