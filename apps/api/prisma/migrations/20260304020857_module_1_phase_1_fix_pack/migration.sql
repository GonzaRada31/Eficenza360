/*
  Warnings:

  - A unique constraint covering the columns `[id,tenant_id]` on the table `energy_audit_snapshots` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `energy_audits` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `energy_records` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `equipment_inventories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `operational_data` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `site_measurements` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "energy_records" DROP CONSTRAINT "energy_records_emission_factor_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "energy_audit_snapshots_id_tenant_id_key" ON "energy_audit_snapshots"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "energy_audits_id_tenant_id_key" ON "energy_audits"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "energy_records_tenant_id_audit_id_idx" ON "energy_records"("tenant_id", "audit_id");

-- CreateIndex
CREATE UNIQUE INDEX "energy_records_id_tenant_id_key" ON "energy_records"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "equipment_inventories_tenant_id_audit_id_idx" ON "equipment_inventories"("tenant_id", "audit_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_inventories_id_tenant_id_key" ON "equipment_inventories"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "operational_data_tenant_id_audit_id_idx" ON "operational_data"("tenant_id", "audit_id");

-- CreateIndex
CREATE UNIQUE INDEX "operational_data_id_tenant_id_key" ON "operational_data"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "site_measurements_tenant_id_audit_id_idx" ON "site_measurements"("tenant_id", "audit_id");

-- CreateIndex
CREATE UNIQUE INDEX "site_measurements_id_tenant_id_key" ON "site_measurements"("id", "tenant_id");

-- AddForeignKey
ALTER TABLE "energy_records" ADD CONSTRAINT "energy_records_emission_factor_id_fkey" FOREIGN KEY ("emission_factor_id") REFERENCES "emission_factors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
