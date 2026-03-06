import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Historical Tasks (Dec 2025 - Jan 2026) ---');

  const email = 'auditor@eficenza.com';

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user || !user.tenantId) {
    console.error('Auditor user not found. Run create-auditor.ts first.');
    return;
  }
  const tenantId = user.tenantId;

  // Find projects for this tenant
  const projects = await prisma.project.findMany({
    where: { tenantId },
    include: { modules: true },
  });

  if (projects.length === 0) {
    console.log('No projects found. Run seed-jujuy-projects.ts first.');
    return;
  }

  // Helper date function
  const getDate = (day: number, month: number, year: number) =>
    new Date(year, month - 1, day);

  // Add historical tasks to the first project (Ledesma usually)
  const project = projects[0];
  const module = project.modules[0]; // Use first module

  if (!module) {
    console.log('No module found in project ' + project.name);
    return;
  }

  const historicalTasks = [
    {
      title: 'Fase 1: Recolección de Datos Históricos',
      startDate: getDate(1, 12, 2025),
      endDate: getDate(10, 12, 2025),
      status: 'COMPLETE',
    },
    {
      title: 'Análisis de Facturación 2024',
      startDate: getDate(11, 12, 2025),
      endDate: getDate(20, 12, 2025),
      status: 'COMPLETE',
    },
    {
      title: 'Visita Técnica a Planta - Relevamiento',
      startDate: getDate(22, 12, 2025),
      endDate: getDate(23, 12, 2025),
      status: 'COMPLETE',
    },
    {
      title: 'Procesamiento de Datos Previo',
      startDate: getDate(26, 12, 2025),
      endDate: getDate(5, 1, 2026),
      status: 'COMPLETE',
    },
    {
      title: 'Informe Preliminar de Situación',
      startDate: getDate(6, 1, 2026),
      endDate: getDate(10, 1, 2026),
      status: 'COMPLETE',
    },
    {
      title: 'Reunión de Avance con Gerencia',
      startDate: getDate(15, 1, 2026),
      endDate: getDate(15, 1, 2026),
      status: 'COMPLETE',
    },
  ];

  for (let i = 0; i < historicalTasks.length; i++) {
    const t = historicalTasks[i];
    await prisma.task.create({
      data: {
        tenantId,
        projectId: project.id,
        moduleId: module.id,
        title: t.title,
        description: 'Tarea histórica generada automáticamente.',
        startDate: t.startDate,
        endDate: t.endDate,
        status: t.status as TaskStatus,
        type: 'STANDARD',
        deduplicationKey: `HISTORY_TASK_${i + 1}`,
      },
    });
    console.log(`Created historical task: ${t.title}`);
  }

  console.log('--- Historical Seeding Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
