import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@eficenza.com';
  const password = 'admin123'; // Cambiado de 'admin' a 'admin123' (mínimo 6 caracteres)
  const fullName = 'Admin Eficenza';
  const tenantName = 'Eficenza Consultora';

  console.log(`Checking for existing user: ${email}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser) {
    console.log('Admin user already exists. Updating password...');
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { passwordHash: hashedPassword },
    });
    console.log('Password updated successfully.');
    return;
  }

  console.log('Creating initial tenant and admin user...');

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Create Tenant
    const tenant = await tx.tenant.create({
      data: {
        name: tenantName,
        commercialName: tenantName,
        subscription: {
          create: {
            status: 'ACTIVE',
            planType: 'ENTERPRISE',
          },
        },
      },
    });

    // 2. Create Admin User
    const user = await tx.user.create({
      data: {
        email: email,
        passwordHash: hashedPassword,
        fullName: fullName,
        role: 'ADMIN',
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
    });

    return { tenant, user };
  });

  console.log('Success!');
  console.log(`Tenant created: ${result.tenant.name} (${result.tenant.id})`);
  console.log(`Admin user created: ${result.user.email}`);
  console.log(`Password: ${password} (Please change it after first login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
