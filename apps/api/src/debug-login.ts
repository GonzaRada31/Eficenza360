import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Login Simulation ---');
  const email = 'admin@eficenza.com';
  const password = 'admin123';

  console.log(`Attempting login for: ${email}`);
  console.log(`Password provided: ${password}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error('❌ User not found in database!');
    return;
  }

  console.log('✅ User found.');
  console.log(`Stored Hash: ${user.passwordHash}`);

  if (!user.passwordHash) {
    console.error('❌ No password hash stored!');
    return;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (isValid) {
    console.log('✅ Password matches! Login should work.');
  } else {
    console.error('❌ Password does NOT match.');

    // Debugging hash generation
    const newHash = await bcrypt.hash(password, 10);
    console.log(`New generated hash would be: ${newHash}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
