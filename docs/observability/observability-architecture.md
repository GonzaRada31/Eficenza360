# Phase 7 — Observability & Monitoring Architecture

## 1. Executive Summary
Eficenza 360 is advancing into Phase 7, introducing a comprehensive Enterprise-grade Observability & Monitoring Layer. This architecture enables handling **10,000+ tenants** and **millions of billing/audit events** per month by implementing Centralized Logging, System Metrics, Distributed Tracing, Alerting, and an Admin Observability Dashboard.

## 2. Logical Components Architecture Diagram

```mermaid
graph TD
    Client[Next.js Client] --> API[NestJS API Gateway / Backend]
    API --> Worker[Relay Workers / BullMQ]
    
    subgraph Observability Layer
        LogAgg[Centralized Logging System]
        MetricAgg[Metrics & Telemetry Aggregator]
        Tracer[Distributed Tracing Engine]
        AlertMgr[Alert Manager & SLA Monitor]
    end
    
    API -.->|Structured JSON Logs| LogAgg
    Worker -.->|Worker Status & Payload Logs| LogAgg
    
    API -.->|API Latency & HTTP Metrics| MetricAgg
    Worker -.->|Queue Size, CPU, Memory| MetricAgg
    
    API -.->|Trace ID Injection| Tracer
    Worker -.->|Span Contexts| Tracer
    
    MetricAgg --> AlertMgr
    LogAgg -.->|Error Rate Thresholds| AlertMgr
    AlertMgr -->|Webhooks / PagerDuty / Slack| OpsTeam((Ops Team))
    
    subgraph Dashboard UI
        SystemHealth[SystemHealthCard]
        QueueStatus[QueueStatusPanel]
        WorkerStatus[WorkerStatusTable]
        ErrorRate[ErrorRateChart]
    end
    
    Admin[Tenant / Global Admin] --> Dashboard UI
    MetricAgg --> Dashboard UI
```

## 3. Centralized Logging (Structured JSON)
Logs stringified to JSON using correlation IDs across services.
- **Levels**: `debug`, `info`, `warn`, `error`, `fatal`.
- **Fields**: `traceId`, `tenantId`, `userId`, `context`, `latencyMs`, `endpoint`.

## 4. Metrics & Telemetry
- **System Metrics:** CPU usage, Memory limits, Prisma DB connection pool sizes.
- **Business Metrics:** MRR pipeline, Domain Events Processed, Queue Backlogs.
- **Latency Tracking:** API HTTP response times (p95, p99).

## 5. Distributed Tracing
- Propagation of `x-trace-id` on HTTP headers.
- Context injection into BullMQ `job.opts.traceId`.

## 6. Alerting Rules
- **Error Rate:** > 1% in API responses over 5 mins.
- **Queue Backlog:** > 5,000 pending domain events in Outbox.
- **Billing Webhook:** 3 consecutive failures.
- **SLA Degradation:** API p95 Latency > 800ms.

## 7. Audit Integration
Any automated recovery or critical operational alert emitted by the `AlertMgr` acts as a domain entity modifying system state and thus MUST stream an `AUDIT_EVENT` to the Audit Log.
