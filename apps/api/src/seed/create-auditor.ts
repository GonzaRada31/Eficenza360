import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Auditor User ---');

  const email = 'auditor@eficenza.com';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Check if user exists
  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // We want a SPECIFIC tenant for this Auditor, not just "any" first tenant found.
  const auditorTenantName = 'Auditoría Principal S.A.';
  let auditorTenant = await prisma.tenant.findFirst({
    where: { name: auditorTenantName },
  });

  if (!auditorTenant) {
    console.log(`Creating dedicated tenant "${auditorTenantName}"...`);
    auditorTenant = await prisma.tenant.create({
      data: {
        name: auditorTenantName,
        commercialName: 'Auditoría Principal S.A.',
        subscription: {
          create: {
            status: 'ACTIVE',
            planType: 'Pro', // Different plan just to distinguish
          },
        },
      },
    });
  }

  if (existingUser) {
    console.log(
      `User ${email} already exists. Updating password and ensuring correct Tenant...`,
    );
    // Force update to correct tenant and role
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        role: 'AUDITOR',
        tenantId: auditorTenant.id,
      },
    });
    console.log(`User moved to tenant: ${auditorTenant.name}`);
  } else {
    console.log(`Creating new user ${email} in dedicated tenant...`);
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName: 'Auditor Jefe',
        role: 'AUDITOR',
        tenantId: auditorTenant.id,
        status: 'ACTIVE',
      },
    });
    console.log('User created successfully.');
  }

  console.log('--- Credentials ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
