import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { EnergyAuditService } from '../modules/energy-audit/energy-audit.service';
import { AuditStatus, EnergyRecordType } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const energyAuditService = app.get(EnergyAuditService);

  try {
    console.log('--- Iniciando Test B2B Outbox ---');
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant Outbox' }
    });
    const company = await prisma.company.create({
      data: { tenantId: tenant.id, name: 'Test Outbox Company' }
    });

    const audit = await energyAuditService.createAudit(tenant.id, {
      companyId: company.id,
      name: 'Auditoría Outbox Prueba',
      year: 2026
    });
    console.log(`Auditoría creada: ${audit.id} (Status: ${audit.status})`);

    // Inyectar record base
    await prisma.energyRecord.create({
      data: {
        tenantId: tenant.id,
        auditId: audit.id,
        recordType: EnergyRecordType.GRID,
        category: 'Lighting',
        consumptionValue: 1000,
        unit: 'kWh',
        deduplicationKey: 'mock-test-outbox'
      }
    });

    console.log(`Ejecutando validateAudit()...`);
    const validationResult = await energyAuditService.validateAudit(tenant.id, audit.id);
    console.log(`Validación Exitosa. SnapshotId: ${validationResult.snapshotId}`);

    // Verificar Tablas Afectadas
    const outboxRecords = await prisma.domainEventOutbox.findMany({
      where: { tenantId: tenant.id, eventType: 'ENERGY_AUDIT_VALIDATED' }
    });
    
    if (outboxRecords.length > 0) {
      const outbox = outboxRecords[0];
      console.log(`[VERIFICADO] Outbox Id: ${outbox.id}`);
      console.log(`Status DB: ${outbox.status}, Payload UUID: ${(outbox.payload as any).eventId}`);
      console.log(`Payload AuditId: ${(outbox.payload as any).auditId}`);
    } else {
      throw new Error("FALLO CRITICO: No se generó registro Outbox");
    }

    console.log(`Revisando estado de la Auditoria post-validación...`);
    const reAudit = await energyAuditService.getAuditById(tenant.id, audit.id);
    if(reAudit.status === AuditStatus.VALIDATED) {
         console.log(`[VERIFICADO] Audit Status Mutado correctamente.`);
    }

    // Clean up
    await prisma.energyRecord.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.energyAuditSnapshotRecord.deleteMany({ where: { snapshot: { tenantId: tenant.id } } });
    await prisma.energyAuditSnapshot.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.domainEventOutbox.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.energyAudit.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.company.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenant.deleteMany({ where: { id: tenant.id } });
    console.log(`\nLimpieza de BD Terminada.`);
    process.exit(0);
  } catch (error) {
    console.error('Error durante el script:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
