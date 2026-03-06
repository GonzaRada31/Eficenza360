import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Dashboard Data ---');

  const email = 'admin@eficenza.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) {
    console.error(`User ${email} not found. Run create-superadmin.ts first.`);
    return;
  }

  const tenantId = user.tenantId;
  console.log(`Seeding data for Tenant: ${user.tenant.name} (${tenantId})`);

  // Create a Sample Project
  const project = await prisma.project.create({
    data: {
      tenantId,
      name: 'Auditoría Energética Planta Principal',
      standard: 'ISO 50001',
      status: 'IN_PROGRESS',
      startDate: new Date(),
      progressPercent: 35.5,
    },
  });
  console.log(`Created Project: ${project.name}`);

  // Create some Tasks to populate stats
  await prisma.task.createMany({
    data: [
      {
        tenantId,
        projectId: project.id,
        title: 'Recopilar facturas de energía',
        status: 'COMPLETE',
        type: 'STANDARD',
        deduplicationKey: 'DASHBOARD_SEED_TASK_1',
      },
      {
        tenantId,
        projectId: project.id,
        title: 'Análisis de carga instalada',
        status: 'IN_PROGRESS', // Counts as "Items en Revisión" logic I added
        type: 'STANDARD',
        deduplicationKey: 'DASHBOARD_SEED_TASK_2',
      },
      {
        tenantId,
        projectId: project.id,
        title: 'Medición de calidad de energía',
        status: 'PENDING', // Counts as "Hallazgos Pendientes" logic
        type: 'MANDATORY',
        deduplicationKey: 'DASHBOARD_SEED_TASK_3',
      },
    ],
  });
  console.log('Created Sample Tasks.');

  console.log('✅ Seeding Complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
