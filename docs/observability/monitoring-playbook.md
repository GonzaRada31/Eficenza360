# Eficenza 360 - Monitoring Playbook

## 1. Overview
The Monitoring Playbook contains instructions for the Operations team to interpret telemetry data and metrics arriving at the Admin Observability Dashboard.

## 2. Key Dashboards

### System Health
- Consolidates CPU, Memory, and DB Connections into a single Health indicator (Healthy, Warning, Critical).
- **Thresholds**: 
  - CPU > 85% sets Warning. CPU > 95% sets Critical.
  - DB Connections > 80% capacity sets Warning.

### Queue Status (Domain Event Outbox)
- **Pending Events**: Indicates the number of DomainEvents waiting to be picked up by Relay Workers.
- **Processing Rate**: Number of events cleared per second.
- **Action**: If Processing Rate is < Ingestion Rate, auto-scale Worker instances.

### Worker Status
- Status grid of all active BullMQ Workers (Idle, Processing, Stalled, Paused).
- **Stalled Workers**: Usually caused by unhandled Promise rejections or Node.js event loop blocks.

### Billing Pipeline
- Critical metric tracker ensuring invoices, subscriptions, and usage-based MRR calculations run without failure.
- If pipeline status goes RED, execute Revenue Rescue Runbook immediately.

## 3. Telemetry Tags
Every metric emitted includes the following tags for aggregations:
- `tenant_id`: For isolating multi-tenant noisy neighbor issues.
- `service_name`: (e.g., `client`, `api`, `relay-worker`, `billing-cron`).
- `env`: (e.g., `production`, `staging`).
