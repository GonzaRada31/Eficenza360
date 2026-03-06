import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Listing All Projects ---');
  const projects = await prisma.project.findMany({
    include: { tenant: true },
  });
  console.log(`Total Projects Found: ${projects.length}`);
  projects.forEach((p) => {
    console.log(
      `- Project: ${p.name}, Tenant: ${p.tenantId} (${p.tenant?.name})`,
    );
  });

  console.log('\n--- Tenants ---');
  const tenants = await prisma.tenant.findMany({
    include: { _count: { select: { projects: true } } },
  });
  tenants.forEach((t) => {
    console.log(`Tenant: ${t.name} (${t.id}) - Projects: ${t._count.projects}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
