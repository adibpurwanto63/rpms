import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_dnWjzf4P8FRw@ep-ancient-wind-apqnezaa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({ id: u.id, email: u.email, role: u.role })));
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  pool.end();
});
