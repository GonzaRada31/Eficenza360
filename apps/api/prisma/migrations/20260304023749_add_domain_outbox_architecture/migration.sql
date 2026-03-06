-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'MICROSOFT', 'APPLE');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "domain_event_outbox" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error_reason" TEXT,
    "locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "domain_event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carbon_footprint_processed_event" (
    "event_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "audit_id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carbon_footprint_processed_event_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "domain_event_outbox_tenant_id_idx" ON "domain_event_outbox"("tenant_id");

-- CreateIndex
CREATE INDEX "domain_event_outbox_status_created_at_idx" ON "domain_event_outbox"("status", "created_at");

-- CreateIndex
CREATE INDEX "domain_event_outbox_status_locked_at_idx" ON "domain_event_outbox"("status", "locked_at");

-- CreateIndex
CREATE INDEX "carbon_footprint_processed_event_tenant_id_audit_id_idx" ON "carbon_footprint_processed_event"("tenant_id", "audit_id");

-- CreateIndex
CREATE UNIQUE INDEX "carbon_footprint_processed_event_event_id_key" ON "carbon_footprint_processed_event"("event_id");

-- AddForeignKey
ALTER TABLE "domain_event_outbox" ADD CONSTRAINT "domain_event_outbox_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
