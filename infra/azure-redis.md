# Azure Cache for Redis

## Overview
Redis is utilized in Eficenza360 for BullMQ worker queues, session caching, and rate limiting. A managed Azure Cache for Redis ensures low-latency state offloading.

## Configuration Blueprint

- **SKU:** Standard (C0 or C1) for Staging, Premium (P1) for Production
- **Redis Version:** 6.x or 7.x
- **High Availability:** Standard replication (Primary/Replica)
- **Security:**
  - Non-TLS port (6379) disabled. Force TLS (6380).
  - VNet Integration via Private Link.
- **Persistence:** RDB enabled for Premium tier in Production.
- **Eviction Policy:** `volatile-lru` or `allkeys-lru`

## Connection String Format
`rediss://<default-user>:<password>@<server-name>.redis.cache.windows.net:6380`

## Next Steps
Resource provisioning via Terraform or ARM/Bicep is pending.
