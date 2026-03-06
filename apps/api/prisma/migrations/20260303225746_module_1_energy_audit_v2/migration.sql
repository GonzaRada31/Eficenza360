/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,project_id,deduplication_key]` on the table `project_modules` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,task_id,parent_subtask_id,deduplication_key]` on the table `subtasks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,project_id,deduplication_key]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `project_modules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `subtasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ELECTRICITY', 'GAS', 'WATER', 'FUEL', 'OTHER', 'GAS_NATURAL', 'DIESEL', 'GASOLINE', 'LPG');

-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'VALIDATED');

-- CreateEnum
CREATE TYPE "WorkspaceMode" AS ENUM ('INVOICE', 'STANDARD', 'CHECKLIST');

-- CreateEnum
CREATE TYPE "CarbonScope" AS ENUM ('SCOPE_1', 'SCOPE_2', 'SCOPE_3');

-- CreateEnum
CREATE TYPE "CarbonSourceType" AS ENUM ('MANUAL', 'ACTIVITY_DATA');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING_REVIEW', 'PROCESSED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'VALIDATED', 'LOCKED');

-- CreateEnum
CREATE TYPE "EnergyRecordType" AS ENUM ('INVOICE', 'GRID', 'MEASUREMENT');

-- AlterTable
ALTER TABLE "activity_data" ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "service_type" "ServiceType" NOT NULL DEFAULT 'ELECTRICITY',
ADD COLUMN     "status" "DataStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "employee_count" TEXT,
ADD COLUMN     "organization_type" TEXT;

-- AlterTable
ALTER TABLE "emission_factors" ADD COLUMN     "region" TEXT,
ADD COLUMN     "uncertainty" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "project_modules" ADD COLUMN     "deduplication_key" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "base_year" INTEGER,
ADD COLUMN     "building_type" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "historical_years" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "ocr_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subtasks" ADD COLUMN     "deduplication_key" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "input_context" TEXT[],
ADD COLUMN     "input_type" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "output_context" TEXT[],
ADD COLUMN     "parent_subtask_id" TEXT,
ADD COLUMN     "standard" TEXT,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ADD COLUMN     "workspace_mode" "WorkspaceMode" DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "deduplication_key" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "carbon_records" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "activity_data_id" TEXT,
    "emission_factor_id" TEXT,
    "year" INTEGER NOT NULL,
    "scope" "CarbonScope" NOT NULL,
    "category" TEXT NOT NULL,
    "source_type" "CarbonSourceType" NOT NULL DEFAULT 'ACTIVITY_DATA',
    "consumption_value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "emissions_total" DOUBLE PRECISION NOT NULL,
    "factor_value_snapshot" DOUBLE PRECISION,
    "factor_source_snapshot" TEXT,
    "formula_snapshot" TEXT,
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carbon_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "vendor_name" TEXT,
    "vendor_tax_id" TEXT,
    "total_amount" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'ARS',
    "consumption" DOUBLE PRECISION,
    "unit" TEXT,
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "client_number" TEXT,
    "service_type" "ServiceType" NOT NULL DEFAULT 'ELECTRICITY',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'ai',
    "ai_confidence" DOUBLE PRECISION,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "subtask_id" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_audits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "energy_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "record_type" "EnergyRecordType" NOT NULL,
    "category" TEXT NOT NULL,
    "consumption_value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "emission_factor_id" TEXT,
    "evidence_url" TEXT,
    "deduplication_key" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "energy_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_inventories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "power_rating" DOUBLE PRECISION,
    "efficiency" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "equipment_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_measurements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "site_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_data" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "operational_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_audit_snapshots" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "original_audit_id" TEXT NOT NULL,
    "audit_name" TEXT NOT NULL,
    "audit_year" INTEGER NOT NULL,
    "frozen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iso_standard_version" TEXT,
    "total_electricity_kwh" DOUBLE PRECISION,
    "total_gas_m3" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_audit_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_audit_snapshot_records" (
    "id" TEXT NOT NULL,
    "snapshot_id" TEXT NOT NULL,
    "original_record_id" TEXT NOT NULL,
    "record_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "consumption_value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "applied_emission_factor_value" DOUBLE PRECISION,
    "applied_emission_factor_source" TEXT,
    "applied_formula" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_audit_snapshot_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carbon_records_activity_data_id_key" ON "carbon_records"("activity_data_id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_idx" ON "invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_subtask_id_idx" ON "invoices"("tenant_id", "subtask_id");

-- CreateIndex
CREATE INDEX "invoices_subtask_id_status_idx" ON "invoices"("subtask_id", "status");

-- CreateIndex
CREATE INDEX "invoices_deleted_at_idx" ON "invoices"("deleted_at");

-- CreateIndex
CREATE INDEX "energy_audits_tenant_id_idx" ON "energy_audits"("tenant_id");

-- CreateIndex
CREATE INDEX "energy_audits_tenant_id_deleted_at_idx" ON "energy_audits"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "energy_audits_tenant_id_status_idx" ON "energy_audits"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "energy_audits_tenant_id_company_id_year_name_key" ON "energy_audits"("tenant_id", "company_id", "year", "name");

-- CreateIndex
CREATE INDEX "energy_records_tenant_id_idx" ON "energy_records"("tenant_id");

-- CreateIndex
CREATE INDEX "energy_records_audit_id_idx" ON "energy_records"("audit_id");

-- CreateIndex
CREATE INDEX "energy_records_tenant_id_deleted_at_idx" ON "energy_records"("tenant_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "energy_records_tenant_id_deduplication_key_key" ON "energy_records"("tenant_id", "deduplication_key");

-- CreateIndex
CREATE INDEX "equipment_inventories_tenant_id_idx" ON "equipment_inventories"("tenant_id");

-- CreateIndex
CREATE INDEX "equipment_inventories_audit_id_idx" ON "equipment_inventories"("audit_id");

-- CreateIndex
CREATE INDEX "equipment_inventories_tenant_id_deleted_at_idx" ON "equipment_inventories"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "site_measurements_tenant_id_idx" ON "site_measurements"("tenant_id");

-- CreateIndex
CREATE INDEX "site_measurements_audit_id_idx" ON "site_measurements"("audit_id");

-- CreateIndex
CREATE INDEX "site_measurements_tenant_id_deleted_at_idx" ON "site_measurements"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "operational_data_tenant_id_idx" ON "operational_data"("tenant_id");

-- CreateIndex
CREATE INDEX "operational_data_audit_id_idx" ON "operational_data"("audit_id");

-- CreateIndex
CREATE INDEX "operational_data_tenant_id_deleted_at_idx" ON "operational_data"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "energy_audit_snapshots_tenant_id_idx" ON "energy_audit_snapshots"("tenant_id");

-- CreateIndex
CREATE INDEX "energy_audit_snapshots_original_audit_id_idx" ON "energy_audit_snapshots"("original_audit_id");

-- CreateIndex
CREATE INDEX "energy_audit_snapshot_records_snapshot_id_idx" ON "energy_audit_snapshot_records"("snapshot_id");

-- CreateIndex
CREATE INDEX "project_modules_tenant_id_idx" ON "project_modules"("tenant_id");

-- CreateIndex
CREATE INDEX "project_modules_deleted_at_idx" ON "project_modules"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "project_modules_tenant_id_project_id_deduplication_key_key" ON "project_modules"("tenant_id", "project_id", "deduplication_key");

-- CreateIndex
CREATE INDEX "projects_tenant_id_idx" ON "projects"("tenant_id");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE INDEX "subtasks_tenant_id_idx" ON "subtasks"("tenant_id");

-- CreateIndex
CREATE INDEX "subtasks_parent_subtask_id_idx" ON "subtasks"("parent_subtask_id");

-- CreateIndex
CREATE INDEX "subtasks_deduplication_key_idx" ON "subtasks"("deduplication_key");

-- CreateIndex
CREATE INDEX "subtasks_deleted_at_idx" ON "subtasks"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "subtasks_tenant_id_task_id_parent_subtask_id_deduplication__key" ON "subtasks"("tenant_id", "task_id", "parent_subtask_id", "deduplication_key");

-- CreateIndex
CREATE INDEX "tasks_tenant_id_idx" ON "tasks"("tenant_id");

-- CreateIndex
CREATE INDEX "tasks_deleted_at_idx" ON "tasks"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_tenant_id_project_id_deduplication_key_key" ON "tasks"("tenant_id", "project_id", "deduplication_key");

-- AddForeignKey
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_parent_subtask_id_fkey" FOREIGN KEY ("parent_subtask_id") REFERENCES "subtasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_records" ADD CONSTRAINT "carbon_records_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_records" ADD CONSTRAINT "carbon_records_activity_data_id_fkey" FOREIGN KEY ("activity_data_id") REFERENCES "activity_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_records" ADD CONSTRAINT "carbon_records_emission_factor_id_fkey" FOREIGN KEY ("emission_factor_id") REFERENCES "emission_factors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subtask_id_fkey" FOREIGN KEY ("subtask_id") REFERENCES "subtasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_audits" ADD CONSTRAINT "energy_audits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_audits" ADD CONSTRAINT "energy_audits_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_records" ADD CONSTRAINT "energy_records_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "energy_audits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_records" ADD CONSTRAINT "energy_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_records" ADD CONSTRAINT "energy_records_emission_factor_id_fkey" FOREIGN KEY ("emission_factor_id") REFERENCES "emission_factors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inventories" ADD CONSTRAINT "equipment_inventories_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "energy_audits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inventories" ADD CONSTRAINT "equipment_inventories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_measurements" ADD CONSTRAINT "site_measurements_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "energy_audits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_measurements" ADD CONSTRAINT "site_measurements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_data" ADD CONSTRAINT "operational_data_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "energy_audits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_data" ADD CONSTRAINT "operational_data_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_audit_snapshots" ADD CONSTRAINT "energy_audit_snapshots_original_audit_id_fkey" FOREIGN KEY ("original_audit_id") REFERENCES "energy_audits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_audit_snapshots" ADD CONSTRAINT "energy_audit_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_audit_snapshot_records" ADD CONSTRAINT "energy_audit_snapshot_records_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "energy_audit_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
