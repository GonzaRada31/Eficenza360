import { PrismaClient, Company, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Jujuy Projects ---');

  const email = 'auditor@eficenza.com'; // User to assign data to

  // 1. Get the Auditor User and Tenant
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user || !user.tenantId) {
    console.error(
      'Auditor user or tenant not found. Run create-auditor.ts first.',
    );
    return;
  }
  const tenantId = user.tenantId;

  console.log(`Seeding data for Tenant: ${user.tenant.name} (${tenantId})`);

  // 2. Create Companies (Jujuy based)
  const companiesData = [
    {
      name: 'Ledesma S.A.A.I.',
      contactName: 'Juan Pérez',
      email: 'jperez@ledesma.com.ar',
      address: 'Libertador Gral. San Martín, Jujuy',
    },
    {
      name: 'Sales de Jujuy',
      contactName: 'María García',
      email: 'mgarcia@salesdejujuy.com',
      address: 'Salar de Olaroz, Jujuy',
    },
    {
      name: 'EJESA',
      contactName: 'Roberto Carlos',
      email: 'rcarlos@ejesa.com.ar',
      address: 'San Salvador de Jujuy',
    },
  ];

  const createdCompanies: Company[] = [];
  for (const c of companiesData) {
    const company = await prisma.company.create({
      data: { ...c, tenantId },
    });
    createdCompanies.push(company);
    console.log(`Created Company: ${company.name}`);
  }

  // 3. Create Projects
  const projectDefinitions = [
    {
      name: 'Auditoría Energética Plana Principal',
      companyIndex: 0, // Ledesma
      description:
        'Relevamiento completo de consumo energético en planta de bioetanol.',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      modules: ['Auditoría Energética', 'Identificación de Reducciones'],
    },
    {
      name: 'Cálculo Huella de Carbono 2023',
      companyIndex: 1, // Sales de Jujuy
      description: 'Inventario de emisiones GEI Scope 1 y 2.',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      modules: ['Huella de Carbono', 'INFORMES'],
    },
    {
      name: 'Plan de Eficiencia Institucional',
      companyIndex: 2, // EJESA
      description: 'Diagnóstico y plan de mejoras para oficinas centrales.',
      status: 'PENDING',
      startDate: new Date('2024-03-10'),
      modules: ['Auditoría Energética', 'Plan de Sostenibilidad'],
    },
  ];

  for (const p of projectDefinitions) {
    const company = createdCompanies[p.companyIndex];

    // Create Project
    const project = await prisma.project.create({
      data: {
        name: p.name,
        description: p.description,
        status: p.status as ProjectStatus,
        startDate: p.startDate,
        endDate: p.endDate,
        tenantId,
        companyId: company.id,
        location: company.address,
        projectContact: company.contactName,
        progressPercent: p.status === 'IN_PROGRESS' ? 35 : 0,
      },
    });
    console.log(`Created Project: "${project.name}" for ${company.name}`);

    // Create Modules and Tasks
    for (let i = 0; i < p.modules.length; i++) {
      const moduleName = p.modules[i];
      const module = await prisma.projectModule.create({
        data: {
          tenantId,
          projectId: project.id,
          name: moduleName,
          orderIndex: i,
          description: `Módulo de trabajo para ${moduleName}`,
          deduplicationKey: `MODULE_${p.name.substring(0, 5).toUpperCase()}_${moduleName.substring(0, 5).toUpperCase()}_${i}`,
        },
      });

      // Add dummy tasks
      await prisma.task.create({
        data: {
          tenantId,
          projectId: project.id,
          moduleId: module.id,
          title: `Relevamiento inicial de datos - ${moduleName}`,
          status: 'COMPLETE',
          type: 'STANDARD',
          startDate: new Date(),
          description: 'Recopilar facturas y datos históricos.',
          deduplicationKey: `TASK_INIT_${module.id.substring(0, 5)}`,
        },
      });

      await prisma.task.create({
        data: {
          tenantId,
          projectId: project.id,
          moduleId: module.id,
          title: `Análisis y Procesamiento - ${moduleName}`,
          status: 'PENDING',
          type: 'STANDARD',
          startDate: new Date(),
          description: 'Procesar información recolectada.',
          deduplicationKey: `TASK_PROCESS_${module.id.substring(0, 5)}`,
          subtasks: {
            create: [
              {
                tenantId,
                description: 'Carga de datos al sistema',
                isCompleted: false,
                title: 'Carga de datos',
                workspaceMode: 'STANDARD',
                deduplicationKey: `SUB_DATA_${module.id.substring(0, 5)}_1`,
              },
              {
                tenantId,
                description: 'Validación de outliers',
                isCompleted: false,
                title: 'Validación',
                workspaceMode: 'STANDARD',
                deduplicationKey: `SUB_DATA_${module.id.substring(0, 5)}_2`,
              },
            ],
          },
        },
      });
    }
  }

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
