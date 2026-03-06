import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.project.count();
  console.log(`PROJECT_COUNT: ${count}`);

  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true },
  });
  console.log(`TENANT_COUNT: ${tenants.length}`);
  tenants.forEach((t) => console.log(`Tenant: ${t.name} (${t.id})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
