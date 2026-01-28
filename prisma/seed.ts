import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'Omega101998';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Initialize System Config
  const config = await (prisma as any).systemConfig.upsert({
    where: { id: 'config' },
    update: {},
    create: {
      id: 'config',
      whatsappNumber: '',
      mpAccessToken: '',
      mpPublicKey: '',
    },
  });

  console.log({ config });

  // Initialize Default Platform
  const platform = await (prisma as any).platform.upsert({
    where: { id: 'default-platform' },
    update: {},
    create: {
      id: 'default-platform',
      name: 'Plataforma Principal',
      bonus: '100%',
      active: true,
    },
  });
  
  console.log({ platform });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
