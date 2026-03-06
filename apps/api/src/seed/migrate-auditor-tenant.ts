import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Restoring Auditor Access to Projects ---');

  const email = 'auditor@eficenza.com';

  // 1. Find the tenant with the most projects (The "Real" Tenant)
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: { projects: true },
      },
    },
    orderBy: {
      projects: {
        _count: 'desc',
      },
    },
  });

  const targetTenant = tenants[0]; // The one with the most projects

  if (!targetTenant || targetTenant._count.projects === 0) {
    console.log('No tenant found with projects. Cannot restore access.');
    return;
  }

  console.log(
    `Found target tenant: "${targetTenant.name}" with ${targetTenant._count.projects} projects.`,
  );

  // 2. Update the Auditor user to belong to this tenant
  await prisma.user.update({
    where: { email },
    data: {
      tenantId: targetTenant.id,
    },
  });

  console.log(
    `SUCCESS: User ${email} has been re-assigned to tenant "${targetTenant.name}".`,
  );
  console.log('You should now see your projects again.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
