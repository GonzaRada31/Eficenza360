import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('ResetDataScript');

async function main() {
  logger.log('Starting SAFE Database Reset...');
  logger.warn(
    'WARNING: This will delete transaction data (Audits, Carbon, Docs, Billing, Queues).',
  );
  logger.log('INFO: Tenants, Users, Roles, and Permissions will be PRESERVED.');

  try {
    await prisma.$transaction([
      prisma.eventProcessingLog.deleteMany(),
      prisma.domainEventOutbox.deleteMany(),
      prisma.billingUsage.deleteMany(),
      prisma.carbonReport.deleteMany(),
      prisma.carbonCalculation.deleteMany(),
      prisma.carbonActivity.deleteMany(),
      prisma.energyAuditReport.deleteMany(),
      prisma.energyConsumptionRecord.deleteMany(),
      prisma.energyAuditSite.deleteMany(),
      prisma.energyAudit.deleteMany(),
      prisma.documentVersion.deleteMany(),
      prisma.documentLink.deleteMany(),
      prisma.document.deleteMany(),
      prisma.notificationDelivery.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.auditLog.deleteMany(),
    ]);
    logger.log('✅ Safely wiped all domain transaction data.');
    logger.log('✔ Core metadata (Tenants, Users, RBAC) untouched.');
  } catch (error) {
    logger.error('Database Reset Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
