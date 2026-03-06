import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Creating User grada@eficenza.com ---');

  const email = 'grada@eficenza.com';
  const password = 'Redex216$';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Find a tenant
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    console.error('No tenant found. Please create a tenant first.');
    return;
  }

  console.log(`Assigning to Tenant: ${tenant.name} (${tenant.id})`);

  // Upsert User
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
        fullName: 'Gonzalo Rada',
        role: 'ADMIN',
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      create: {
        email,
        passwordHash: hashedPassword,
        fullName: 'Gonzalo Rada',
        role: 'ADMIN',
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
    });

    console.log('User created/updated successfully:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Tenant: ${tenant.name}`);
  } catch (err) {
    console.error('Error creating user:', err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
