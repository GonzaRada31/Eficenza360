import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Nested Subtasks & Complex Data ---');

  const email = 'auditor@eficenza.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user || !user.tenantId) {
    console.error('Auditor user not found.');
    return;
  }
  const tenantId = user.tenantId;

  // Find the first project
  const projects = await prisma.project.findMany({
    where: { tenantId },
    include: { modules: true },
  });
  if (projects.length === 0) return;
  const project = projects[0];

  // Create a new Module for this test
  const module = await prisma.projectModule.create({
    data: {
      tenantId,
      projectId: project.id,
      name: 'Planificación Estratégica 2026 (God Mode)',
      description:
        'Módulo de prueba para subtareas anidadas y cronograma complejo.',
      orderIndex: 99,
      deduplicationKey: 'MODULE_NESTED_TEST',
    },
  });

  // Helper dates
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const task1 = await prisma.task.create({
    data: {
      tenantId,
      projectId: project.id,
      moduleId: module.id,
      title: 'Auditoría Energética Integral',
      description:
        'Tarea raíz para el sistema de gestión y auditoría completa.',
      status: 'IN_PROGRESS',
      type: 'MANDATORY',
      startDate: today,
      endDate: nextMonth,
      deduplicationKey: 'TASK_NESTED_ROOT',
    },
  });

  // Level 1: Item 1 - Planificación (Completed)
  await prisma.subtask.create({
    data: {
      tenantId,
      taskId: task1.id,
      title: '1. Planificación de la Auditoría',
      description: 'Relevamiento inicial y planificación.',
      isCompleted: true,
      startDate: today,
      endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      deduplicationKey: 'SUB_AUDIT_L1_1',
      workspaceMode: 'STANDARD',
    },
  });

  // Level 1: Item 2 - Recopilación de Datos (Completed)
  const sub2 = await prisma.subtask.create({
    data: {
      tenantId,
      taskId: task1.id,
      title: '2. Recopilación de Datos',
      description: 'Recolección de facturas y datos de consumo.',
      isCompleted: true,
      startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: nextWeek,
      deduplicationKey: 'SUB_AUDIT_L1_2',
      workspaceMode: 'STANDARD',
    },
  });

  // Level 2 Subtasks (Children of Item 2)
  await prisma.subtask.create({
    data: {
      tenantId,
      taskId: task1.id,
      parentSubtaskId: sub2.id,
      title: '2.1: Historial de facturación (12-24 meses)',
      description: 'Recopilar facturas de energía eléctrica y gas.',
      isCompleted: true,
      deduplicationKey: 'SUB_AUDIT_L2_2_1',
      workspaceMode: 'STANDARD',
    },
  });

  // Level 1: Item 3 - Análisis Energético
  const sub3 = await prisma.subtask.create({
    data: {
      tenantId,
      taskId: task1.id,
      title: '3. Análisis Energético',
      description: 'Análisis detallado de consumos y variables.',
      isCompleted: false,
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000),
      deduplicationKey: 'SUB_AUDIT_L1_3',
      workspaceMode: 'STANDARD',
    },
  });

  // Level 2 Subtasks (Children of Item 3)
  const item3Subtasks = [
    'Análisis de Consumos',
    'Identificación de Usos Significativos de Energía (USE)',
    'Análisis de Patrones y Tendencias',
    'Benchmarking Interno / Externo',
  ];

  for (const [index, title] of item3Subtasks.entries()) {
    await prisma.subtask.create({
      data: {
        tenantId,
        taskId: task1.id,
        parentSubtaskId: sub3.id,
        title: `3.${index + 1}: ${title}`,
        description: `Subtarea de análisis energético: ${title}`,
        isCompleted: false,
        deduplicationKey: `SUB_AUDIT_L2_3_${index + 1}`,
        workspaceMode: 'STANDARD',
      },
    });
  }

  // Level 1: Item 4 - Línea Base Energética
  const sub4 = await prisma.subtask.create({
    data: {
      tenantId,
      taskId: task1.id,
      title: '4. Línea Base Energética',
      description: 'Establecimiento de la línea base y variables.',
      isCompleted: false,
      startDate: new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
      deduplicationKey: 'SUB_AUDIT_L1_4',
      workspaceMode: 'STANDARD',
    },
  });

  // Level 2 Subtasks (Children of Item 4)
  const item4Subtasks = [
    'Definición del Año Base',
    'Variables Relevantes',
    'Cálculo de Línea Base',
    'Ajustes y Normalizaciones',
  ];

  for (const [index, title] of item4Subtasks.entries()) {
    await prisma.subtask.create({
      data: {
        tenantId,
        taskId: task1.id,
        parentSubtaskId: sub4.id,
        title: `4.${index + 1}: ${title}`,
        description: `Subtarea de línea base: ${title}`,
        isCompleted: false,
        deduplicationKey: `SUB_AUDIT_L2_4_${index + 1}`,
        workspaceMode: 'STANDARD',
      },
    });
  }

  // Level 1: Item 5 - Oportunidades de Mejora
  const sub5 = await prisma.subtask.create({
    data: {
      tenantId,
      taskId: task1.id,
      title: '5. Oportunidades de Mejora',
      description: 'Identificación y evaluación de mejoras energéticas.',
      isCompleted: false,
      startDate: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000),
      deduplicationKey: 'SUB_AUDIT_L1_5',
      workspaceMode: 'STANDARD',
    },
  });

  // Level 2 Subtasks (Children of Item 5)
  const item5Subtasks = [
    'Identificación de Oportunidades',
    'Evaluación Técnica',
    'Evaluación Económica',
    'Priorización',
    'Plan de Implementación',
  ];

  for (const [index, title] of item5Subtasks.entries()) {
    await prisma.subtask.create({
      data: {
        tenantId,
        taskId: task1.id,
        parentSubtaskId: sub5.id,
        title: `5.${index + 1}: ${title}`,
        description: `Subtarea de mejora: ${title}`,
        isCompleted: false,
        deduplicationKey: `SUB_AUDIT_L2_5_${index + 1}`,
        workspaceMode: 'STANDARD',
      },
    });
  }

  // Level 1: Item 6 - Informe Técnico
  const sub6 = await prisma.subtask.create({
    data: {
      tenantId,
      taskId: task1.id,
      title: '6. Informe Técnico',
      description: 'Elaboración y entrega del informe final.',
      isCompleted: false,
      startDate: new Date(nextWeek.getTime() + 21 * 24 * 60 * 60 * 1000),
      deduplicationKey: 'SUB_AUDIT_L1_6',
      workspaceMode: 'STANDARD',
    },
  });

  // Level 2 Subtasks (Children of Item 6)
  const item6Subtasks = [
    'Resumen Ejecutivo',
    'Desarrollo Técnico',
    'Resultados y KPIs',
    'Plan de Acción',
    'Anexos Técnicos',
  ];

  for (const [index, title] of item6Subtasks.entries()) {
    await prisma.subtask.create({
      data: {
        tenantId,
        taskId: task1.id,
        parentSubtaskId: sub6.id,
        title: `6.${index + 1}: ${title}`,
        description: `Subtarea de informe: ${title}`,
        isCompleted: false,
        deduplicationKey: `SUB_AUDIT_L2_6_${index + 1}`,
        workspaceMode: 'STANDARD',
      },
    });
  }

  console.log('--- Nested Seeding for Energy Audit Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
