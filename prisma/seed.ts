import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a client (tenant)
  const client = await prisma.client.upsert({
    where: { id: 'client-1' },
    update: {},
    create: {
      id: 'client-1',
      name: 'Apex Voice Solutions',
      domain: 'apexvoice.ai',
      settings: {},
    },
  });

  console.log('Created client:', client.name);

  // Create super admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@apexvoice.ai' },
    update: {},
    create: {
      id: 'user-1',
      email: 'admin@apexvoice.ai',
      password: hashedPassword,
      displayName: 'Admin',
      role: 'super_admin',
      clientId: client.id,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create a test client admin
  const clientAdminPassword = await bcrypt.hash('Client123!', 10);
  
  const clientAdmin = await prisma.user.upsert({
    where: { email: 'client@apexvoice.ai' },
    update: {},
    create: {
      id: 'user-2',
      email: 'client@apexvoice.ai',
      password: clientAdminPassword,
      displayName: 'Client Admin',
      role: 'client_admin',
      clientId: client.id,
    },
  });

  console.log('Created client admin:', clientAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
