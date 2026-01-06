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

  for (const p of projects) {
    console.log(`Project: ${p.name} (ID: ${p.id})`);
    console.log(` - Company: ${p.company?.name || 'N/A'}`);
    console.log(` - Standard: ${p.standard}`);
    console.log(` - Status: ${p.status}`);
    console.log(` - StartDate: ${p.startDate}`);
    console.log(` - Location: ${p.location}`);
    console.log(` - Contact: ${p.projectContact}`);
    console.log('-----------------------------------');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
