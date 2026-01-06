import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Updating Project Data ---');
  const project = await prisma.project.findFirst();

  if (!project) {
    console.log('No project found to update.');
    return;
  }

  console.log(`Updating project: ${project.name} (${project.id})`);

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: {
      startDate: project.startDate || new Date(),
      location: project.location || 'Buenos Aires, Argentina',
      projectContact: project.projectContact || 'Admin User',
      description:
        project.description ||
        'Proyecto de demostración para auditoría energética y huella de carbono.',
      standard: project.standard || 'ISO 50001',
      status: project.status || 'IN_PROGRESS',
    },
  });

  console.log('Project updated successfully:', updated);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
