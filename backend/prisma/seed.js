require('dotenv').config();
const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@transport.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.SEED_ADMIN_NAME || 'System Administrator';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      adminProfile: {
        create: {
          fullName: adminName,
        },
      },
    },
    update: {
      passwordHash,
      role: Role.ADMIN,
      adminProfile: {
        upsert: {
          create: { fullName: adminName },
          update: { fullName: adminName },
        },
      },
    },
  });

  console.log(`Seed complete. Admin user: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
