import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Project Reset Script ---');

  // 1. Find Admin User
  const email = 'admin@eficenza.com';
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User ${email} not found!`);
    process.exit(1);
  }

  console.log(
    `Found user: ${user.fullName} (${user.id}) - Tenant: ${user.tenantId}`,
  );
  const tenantId = user.tenantId;

  // 2. Delete Existing Projects for this Tenant
  console.log('Deleting existing projects...');
  try {
    const deleted = await prisma.project.deleteMany({
      where: { tenantId },
    });
    console.log(`Deleted ${deleted.count} projects.`);
  } catch (e) {
    console.error(
      'Error deleting projects (might need manual cleanup of relations):',
      e,
    );
  }

  // 3. Create a Fresh Test Project
  console.log('Creating fresh test project...');

  // Check if a company exists, if not create one
  let company = await prisma.company.findFirst({ where: { tenantId } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Empresa Test S.A.',
        tenantId,
        // industry: 'Manufactura', // Removed invalid field
        // contactPerson: 'Juan Perez', // Removed invalid field
        // email: 'juan@emprasa.test', // Potentially invalid too, commenting out to be safe until schema verification
      },
    });
    console.log('Created test company.');
  } else {
    console.log(`Using existing company: ${company.name}`);
  }

  const newProject = await prisma.project.create({
    data: {
      tenantId,
      companyId: company.id,
      name: 'Proyecto de Eficiencia Energética 2025',
      description:
        'Proyecto integral para la certificación ISO 50001 y reducción de huella de carbono.',
      standard: 'ISO 50001',
      status: 'IN_PROGRESS',
      location: 'Planta Industrial Pilar',
      projectContact: 'Ing. Roberto Gómez',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });

  console.log('✅ Project created successfully!');
  console.log(`ID: ${newProject.id}`);
  console.log(`Name: ${newProject.name}`);

  console.log('--- Reset Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
