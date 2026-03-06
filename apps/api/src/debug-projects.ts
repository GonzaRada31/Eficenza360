import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Projects Data ---');
  const projects = await prisma.project.findMany({
    include: { company: true },
  });

  if (projects.length === 0) {
    console.log('No projects found.');
    return;
  }

  console.table(
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company?.name ?? 'N/A',
      standard: p.standard,
      status: p.status,
      startDate: p.startDate ? p.startDate.toISOString() : 'N/A',
      location: p.location,
      contact: p.projectContact,
    })),
  );
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
