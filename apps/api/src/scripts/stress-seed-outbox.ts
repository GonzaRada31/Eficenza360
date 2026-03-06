// @ts-nocheck
import { PrismaClient, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function bootstrap() {
  console.log('🚀 Iniciando Siembra Masiva para Stress Test (1K Eventos)');
  const startTime = Date.now();

  // 1. Obtener contexto válido
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('⚠️ No hay Tenant activo. Creando uno dummy para el stress test...');
    tenant = await prisma.tenant.create({
      data: { name: 'Eficenza Stress Test Tenant' },
    });
  }

  let company = await prisma.company.findFirst({ where: { tenantId: tenant.id } });
  if (!company) {
    company = await prisma.company.create({
      data: { tenantId: tenant.id, name: 'Stress Test Company' }
    });
  }

  let audit = await prisma.energyAudit.findFirst({ where: { tenantId: tenant.id } });
  if (!audit) {
    audit = await prisma.energyAudit.create({
      data: {
        tenantId: tenant.id,
        companyId: company.id,
        name: 'Stress Test Audit ' + Date.now(),
        year: 2026,
        status: 'VALIDATED', // Simular que fue validada
        version: 1,
      }
    });
  }

  // 2. Limpiar eventos previos si los hay (opcional, pero util para un entorno limpio)
  console.log('🧹 Limpiando Outbox previo...');
  await prisma.domainEventOutbox.deleteMany();
  await prisma.carbonFootprintProcessedEvent.deleteMany();

  // 3. Generar 1000 payloads
  console.log('📦 Generando 1,000 eventos escalonados...');
  const now = Date.now();
  const payloads: Prisma.DomainEventOutboxCreateManyInput[] = [];

  for (let i = 0; i < 1000; i++) {
    const eventId = crypto.randomUUID();
    payloads.push({
      id: eventId,
      tenantId: tenant.id,
      eventType: 'ENERGY_AUDIT_VALIDATED',
      payload: {
        eventId,
        tenantId: tenant.id,
        auditId: audit.id,
        snapshotId: crypto.randomUUID(), // Mock snapshot
        companyId: crypto.randomUUID(),
        year: 2026,
        normativaVersion: 'v1',
      },
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date(now - i * 1000), // Escalonado 1 seg hacia atras
    });
  }

  // 4. Inserción Masiva
  const result = await prisma.domainEventOutbox.createMany({
    data: payloads,
  });

  const duration = Date.now() - startTime;
  console.log(`✅ Siembra de ${result.count} eventos exitosa en ${duration}ms!`);
  
  await prisma.$disconnect();
}

bootstrap().catch((err) => {
  console.error('❌ Error fatal en siembra:', err);
  process.exit(1);
});
