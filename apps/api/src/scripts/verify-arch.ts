import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../modules/projects/projects.service';
import { AttachmentsService } from '../modules/attachments/attachments.service';
import { AzureInvoiceService } from '../modules/invoice/azure-invoice.service';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const logger = new Logger('ArchVerification');
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const projectsService = app.get(ProjectsService);
  const attachmentsService = app.get(AttachmentsService);
  const azureInvoiceService = app.get(AzureInvoiceService);

  logger.log('Starting Architectural Verification...');

  // Setup Tenants
  const tenantA = 'tenant-a-' + uuidv4();
  const tenantB = 'tenant-b-' + uuidv4();

  // NOTE: In real DB, we might need to actually create Tenant records if FK constraints exist.
  // The schema has Tenant model.
  try {
    await prisma.tenant.createMany({
      data: [
        { id: tenantA, name: 'Tenant A' },
        { id: tenantB, name: 'Tenant B' },
      ],
    });
  } catch (e: any) {
    logger.warn('Tenants might already exist or error creating: ' + e.message);
  }

  // 1. Verify Multi-Tenancy (Project Isolation)
  logger.log('1. Verifying Multi-Tenancy...');
  const projA = await projectsService.create(tenantA, {
    name: 'Project A',
    status: 'IN_PROGRESS',
    tenantId: tenantA, // Satisfy type requirement
  } as any);

  try {
    await projectsService.findOne(tenantB, projA.id);
    throw new Error('FAILED: Tenant B could access Project A!');
  } catch (e: any) {
    if (e.status === 404 || (e.message && e.message.includes('not found'))) {
      logger.log('✅ Cross-tenant access blocked (Project)');
    } else {
      throw e;
    }
  }

  // 2. Verify Idempotency (Modules & Recursive Tasks)
  logger.log('2. Verifying Idempotency & Template Seeding...');
  const moduleName = 'Auditoría Energética'; // Use REAL template name to trigger seeding
  const dedupKey = 'MOD_ENERGY_AUDIT';

  // First Create
  const mod1 = await projectsService.createModule(tenantA, projA.id, {
    name: moduleName,
    deduplicationKey: dedupKey,
  });

  // Second Create (Should be same ID)
  const mod2 = await projectsService.createModule(tenantA, projA.id, {
    name: moduleName,
    deduplicationKey: dedupKey,
  });

  if (mod1.id === mod2.id) {
    logger.log('✅ Module Creation is Idempotent ' + mod1.id);
  } else {
    throw new Error(
      `FAILED: Modules have different IDs: ${mod1.id} vs ${mod2.id}`,
    );
  }

  // 2b. Verify Task & Subtask Seeding
  const tasks = await prisma.task.findMany({
    where: { moduleId: mod1.id },
  });
  const planningTask = tasks.find(
    (t) => t.deduplicationKey === 'ENERGY_AUDIT_PLANNING',
  );
  if (planningTask) {
    logger.log('✅ Planning Task Created');

    const subtasks = await prisma.subtask.findMany({
      where: { taskId: planningTask.id },
    });
    // Verify Deleted Task is GONE
    const openingMeeting = subtasks.find(
      (s) => s.deduplicationKey === 'PLAN_OPENING_MEETING',
    );
    if (openingMeeting) {
      // Ideally this should NOT happen if template updated.
      // However, if logic is simply "if not exist create", and this is a NEW tenant, it wont exist.
      throw new Error(
        'FAILED: "Reunión de Apertura" should have been deleted.',
      );
    } else {
      logger.log('✅ Deleted "Reunión de Apertura" is correctly absent');
    }

    // Verify Renamed Task Exists
    const scopeTask = subtasks.find((s) => s.deduplicationKey === 'PLAN_SCOPE');
    if (scopeTask && scopeTask.title === 'Alcance y Objetivos') {
      logger.log('✅ Renamed "Alcance y Objetivos" matches');
    } else {
      throw new Error(
        `FAILED: Scope task missing or wrong title. Found: ${scopeTask?.title}`,
      );
    }

    // Verify New Task Exists
    const docsTask = subtasks.find(
      (s) => s.deduplicationKey === 'PLAN_INITIAL_DOCS',
    );

    if (docsTask) {
      logger.log('✅ New Subtask "Documentación Inicial del Cliente" Created');
      if (
        docsTask.workspaceMode === 'STANDARD' ||
        (docsTask.workspaceMode as string) === 'STANDARD'
      ) {
        logger.log('✅ Subtask Mode is STANDARD');
      } else {
        logger.log(`ℹ️ Subtask Mode is ${docsTask.workspaceMode}`);
      }
    } else {
      throw new Error('FAILED: Subtask "Documentación Inicial" NOT found');
    }
  } else {
    throw new Error(
      'FAILED: Planning Task (ENERGY_AUDIT_PLANNING) NOT found. Tasks found: ' +
        tasks.length,
    );
  }

  // 2c. Verify Regression: Delete Module & Re-create (Zombie Task Check)
  logger.log('2c. Verifying Module Deletion & Re-creation Regression...');
  // Delete the module
  await projectsService.removeModule(tenantA, projA.id, mod1.id);
  logger.log('✅ Module Deletion Successful');

  // Re-create the module
  const mod3 = await projectsService.createModule(tenantA, projA.id, {
    name: moduleName,
    deduplicationKey: dedupKey,
  });

  if (mod3.id !== mod1.id) {
    logger.log(`ℹ️ Module ID validation: Old=${mod1.id}, New=${mod3.id}`);
    // If we decided to restore, IDs should match.
    throw new Error(
      'FAILED: Re-created module should have SAME ID (Resurrection) to avoid constraint violation. Got different ID.',
    );
  } else {
    logger.log('✅ Re-created module has SAME ID (Resurrection): ' + mod3.id);
  }

  // Verify tasks exist in NEW module
  const tasksReg = await prisma.task.findMany({
    where: { moduleId: mod3.id },
  });

  if (tasksReg.length > 0) {
    logger.log(
      `✅ Tasks correctly reclaimed/created for new module. Count: ${tasksReg.length}`,
    );
    const regPlanning = tasksReg.find(
      (t) => t.deduplicationKey === 'ENERGY_AUDIT_PLANNING',
    );
    if (regPlanning && regPlanning.moduleId === mod3.id) {
      logger.log('✅ Planning task is linked to NEW module');
    } else {
      throw new Error('FAILED: Planning task not linked to new module');
    }
  } else {
    throw new Error('FAILED: New module is EMPTY! Zombie task bug persists.');
  }

  // 3. Verify Attachment Isolation (SAS)
  logger.log('3. Verifying Attachment Isolation...');
  try {
    // Valid request
    await attachmentsService.generateSasUrl(`${tenantA}/valid.png`, tenantA);
    logger.log('✅ Valid SAS generation allowed');

    // Invalid request (Tenant B tries to access Tenant A's blob)
    await attachmentsService.generateSasUrl(`${tenantA}/valid.png`, tenantB);
    throw new Error('FAILED: Tenant B accessed Tenant A blob!');
  } catch (e: any) {
    if (e.message && e.message.includes('Access Denied')) {
      logger.log('✅ Cross-tenant SAS access blocked');
    } else {
      throw new Error(
        'FAILED: Did not block invalid SAS request. Got: ' + (e.message || e),
      );
    }
  }

  try {
    await azureInvoiceService.getSasUrl(`${tenantA}/invoice.pdf`, tenantB);
    throw new Error('FAILED: AzureInvoiceService allowed cross-tenant access');
  } catch (e: any) {
    if (e.message && e.message.includes('Security Alert')) {
      logger.log('✅ Invoice SAS access blocked');
    } else {
      throw new Error(
        'FAILED: Invoice SAS check failed. Got: ' + (e.message || e),
      );
    }
  }

  // 4. Verify Soft Delete & Filtering
  logger.log('4. Verify Soft Delete...');
  await projectsService.remove(tenantA, projA.id);

  const found = await prisma.project.findUnique({ where: { id: projA.id } });
  if (found && found.deletedAt) {
    logger.log('✅ Project Soft Deleted (DB record exists with deletedAt)');
  } else {
    throw new Error('FAILED: Project not found or deletedAt is null');
  }

  try {
    await projectsService.findOne(tenantA, projA.id);
    throw new Error('FAILED: Service returned soft-deleted project!');
  } catch (e: any) {
    if (e.status === 404) {
      logger.log('✅ Service filters soft-deleted project');
    } else {
      throw e;
    }
  }

  logger.log('ALL CHECKS PASSED.');
  await app.close();
}

bootstrap().catch((err: any) => {
  console.error(err);
  process.exit(1);
});
