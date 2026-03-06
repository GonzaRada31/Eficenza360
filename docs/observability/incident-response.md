# Incident Response Workflow

## 1. Incident Classification

| Severity | Description | Target Response Time (SLA) | Escalate To |
|:---|:---|:---|:---|
| **SEV-1** | Total system outage, Multi-tenant DB crash, Billing pipeline blocked. | < 5 mins | CTO, Lead Platform Engineer |
| **SEV-2** | Sub-system failure (e.g., Workers stalled), high error rate on critical path. | < 15 mins | SRE, Platform Engineer |
| **SEV-3** | Elevated latency, single-tenant isolated issue, non-critical bugs. | < 1 hour | Support, DevOps |

## 2. Response Workflow

### Step 1: Detect & Triage
- Incident triggered via **Alert Manager** (PagerDuty/Slack).
- Acknowledge alert in the system.
- Determine incident Severity (SEV-1/2/3).
- Create Incident Bridge (Meet/Slack channel).

### Step 2: Investigate
- Check **Admin Observability Dashboard**.
- Analyze `APIResponseLatencyChart` and `ErrorRateChart`.
- Identify the failing service, check Centralized Logs for `traceId`.
- Search the `tenant_id` if it's an isolated occurrence.

### Step 3: Mitigate
- Implement temporary fix (e.g., increase DB pool limit, scale out relay-workers, disable faulty feature flag).
- If OCC (Optimistic Concurrency Control) loop is failing, pause affected queue.
- Mitigation does NOT mean permanent code fix. Goal is restoring SLA.

### Step 4: Validate
- Monitor `SystemHealthCard` and `QueueStatusPanel` in real-time.
- Confirm SLA is restored and `Error Rate` falls back below 1%.

### Step 5: Post-Mortem & Audit
- Root Cause Analysis (RCA) document must be generated within 24 hours.
- Verify that the Audit Log captured the manual mitigation actions (e.g., if a global admin flushed a queue, it must exist in `AuditLogTable`).
