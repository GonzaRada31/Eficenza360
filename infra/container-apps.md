# Azure Container Apps

## Overview
Eficenza360 will utilize Azure Container Apps (ACA) as the compute backbone for both the NestJS API and the built Frontend Web App. ACA is built on AKS (Kubernetes) and KEDA, providing serverless scaling (scale-to-zero) and robust event-driven background processing capability.

## Configuration Blueprint

- **Environment:** ACA Managed Environment (internal VNet or custom VNet)
- **Log Analytics:** Embedded for real-time observability and traces.
- **Containers:**
  - **Eficenza API (NestJS):**
    - Target Port: 3000
    - CPU/Mem: 1.0 CPU / 2.0 Gi
    - Scaling: 1 to 5 replicas based on HTTP concurrency or CPU load.
    - Environment Variables injected via Secrets/KeyVault.
  - **Eficenza Web (Nginx/React):**
    - Target Port: 80
    - CPU/Mem: 0.5 CPU / 1.0 Gi
    - Scaling: 1 to 10 replicas based on HTTP traffic.
  - **Eficenza Workers (BullMQ):**
    - Same API image, alternate command (`worker.js` if split).
    - Scaling: KEDA scalar bound to Redis queue length.

## Next Steps
Deploy initial un-bound ACA apps using CI/CD pushed images. Attach VNet linking to PostgreSQL and Redis.
