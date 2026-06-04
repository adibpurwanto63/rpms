import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const fallbackDbUrl = "postgresql://neondb_owner:npg_dnWjzf4P8FRw@ep-ancient-wind-apqnezaa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || fallbackDbUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.productionRecord.deleteMany();
  await prisma.machine.deleteMany();
  
  await prisma.machine.createMany({
    data: [
      { name: 'Horizontal Baler #1', type: 'HORIZONTAL_BALER', location: 'Hall A' },
      { name: 'Horizontal Baler #2', type: 'HORIZONTAL_BALER', location: 'Hall A' },
      { name: 'Horizontal Baler #3', type: 'HORIZONTAL_BALER', location: 'Hall B' },
      { name: 'Horizontal Baler #4', type: 'HORIZONTAL_BALER', location: 'Hall B' }
    ]
  });
  console.log('Machines updated to Horizontal Baler 1-4');
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  pool.end();
});
