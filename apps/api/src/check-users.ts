import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Check: Users ---');
  try {
    const users = await prisma.user.findMany({
      include: {
        tenant: true,
      },
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} user(s):`);
      users.forEach((user) => {
        const tenantName = user.tenant?.name || 'No Tenant';
        const role = user.role;
        const email = user.email;
        const fullName = user.fullName;

        console.log(`- ${fullName} (${email})`);
        console.log(`  Role: ${role}`);
        console.log(`  Tenant: ${tenantName}`);
        console.log('  ---');
      });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Script failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
