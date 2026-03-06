import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'auditor@eficenza.com';
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log(`User found: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`TenantId: ${user.tenantId}`);
    console.log(`Has Password Hash: ${!!user.passwordHash}`);
  } else {
    console.log('User NOT found.');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
