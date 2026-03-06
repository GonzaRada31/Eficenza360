import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2'; // Assuming argon2 as specified

const prisma = new PrismaClient();

const PERMISSIONS = [
  { name: 'audit.create', description: 'Create Energy Audits' },
  { name: 'audit.read', description: 'Read Energy Audits' },
  { name: 'audit.update', description: 'Update Energy Audits' },
  { name: 'audit.submit', description: 'Submit Audits for Review' },
  { name: 'carbon.calculate', description: 'Calculate Footprint' },
  { name: 'document.upload', description: 'Upload Documents to S3' },
  { name: 'document.read', description: 'Read/Download Documents' },
  { name: 'notification.read', description: 'Read Notifications' },
  { name: 'auditlog.read', description: 'View Audit Logs' },
  { name: 'billing.read', description: 'View Billing Metrics' },
  { name: 'admin.system', description: 'System Administration Access' },
];

const ROLES = [
  { 
    name: 'admin.system', 
    permissions: PERMISSIONS.map(p => p.name) 
  },
  { 
    name: 'tenant.admin', 
    permissions: [
      'audit.create', 'audit.read', 'audit.update', 'audit.submit', 
      'carbon.calculate', 'document.upload', 'document.read', 
      'notification.read', 'auditlog.read', 'billing.read'
    ]
  },
  { 
    name: 'auditor', 
    permissions: ['audit.create', 'audit.read', 'audit.update', 'audit.submit', 'document.upload', 'document.read'] 
  },
  { 
    name: 'analyst', 
    permissions: ['audit.read', 'carbon.calculate', 'document.read'] 
  },
  { 
    name: 'viewer', 
    permissions: ['audit.read', 'document.read'] 
  }
];

async function seed() {
  console.log('🌱 Starting Enterprise Seeder...');

  // 1. Seed Permissions
  console.log('Seeding Permissions...');
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: { name: p.name, description: p.description },
    });
  }

  // 2. Seed Roles & Link Permissions
  console.log('Seeding Roles...');
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, isSystem: true },
    });

    for (const permName of r.permissions) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  // 3. Setup Demo Tenant
  console.log('Setting up Demo Tenant (eficenza-demo)...');
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-demo' }, // fixed ID for testing purposes and idempotency
    update: { name: 'Eficenza Demo SaaS', commercialName: 'Demo Corp' },
    create: { id: 'tenant-demo', name: 'Eficenza Demo SaaS', commercialName: 'Demo Corp' },
  });

  // 4. Create Users for Demo Tenant
  const safePassword = await argon2.hash('DemoPassword2026!');
  
  const USERS = [
    { email: 'admin@eficenza.demo', name: 'Admin Demo', roleName: 'tenant.admin' },
    { email: 'auditor@eficenza.demo', name: 'Auditor Demo', roleName: 'auditor' },
    { email: 'analyst@eficenza.demo', name: 'Analyst Demo', roleName: 'analyst' },
  ];

  for (const u of USERS) {
    const role = await prisma.role.findUnique({ where: { name: u.roleName } });
    if (!role) throw new Error(`Role ${u.roleName} not found mapped.`);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { tenantId: tenant.id, passwordHash: safePassword },
      create: {
        email: u.email,
        fullName: u.name,
        tenantId: tenant.id,
        passwordHash: safePassword,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }

  console.log('✅ Enterprise Seed Complete.');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
