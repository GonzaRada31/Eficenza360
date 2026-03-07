import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

  // 1. Setup Demo Tenant FIRST, as Roles depend on TenantID in our isolated schema.
  console.log('Setting up Demo Tenant (tenant-demo)...');
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-demo' },
    update: { name: 'Eficenza Demo SaaS', commercialName: 'Demo Corp' },
    create: { id: 'tenant-demo', name: 'Eficenza Demo SaaS', commercialName: 'Demo Corp' },
  });

  // 2. Seed Permissions
  console.log('Seeding Permissions...');
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: { name: p.name, description: p.description },
    });
  }

  // 3. Seed Roles & Link Permissions
  console.log('Seeding Roles...');
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: r.name } },
      update: {},
      create: { name: r.name, isSystem: true, tenantId: tenant.id },
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

  // 4. Create Users for Demo Tenant
  console.log('Seeding Users...');
  const safePassword = await bcrypt.hash('DemoPassword2026!', 10);
  
  const USERS = [
    { email: 'admin@eficenza.demo', name: 'Admin Demo', roleName: 'tenant.admin' },
    { email: 'auditor@eficenza.demo', name: 'Auditor Demo', roleName: 'auditor' },
    { email: 'analyst@eficenza.demo', name: 'Analyst Demo', roleName: 'analyst' },
  ];

  for (const u of USERS) {
    const role = await prisma.role.findUnique({ where: { tenantId_name: { tenantId: tenant.id, name: u.roleName } } });
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
      where: { id: 'bypass' } as any,
      update: {},
      create: { userId: user.id, roleId: role.id, tenantId: tenant.id },
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
