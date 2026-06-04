import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_dnWjzf4P8FRw@ep-ancient-wind-apqnezaa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const stats = await prisma.productionRecord.aggregate({
    where: { date: { gte: today, lt: tomorrow } },
    _sum: { inputWeight: true, outputWeight: true, baleCount: true, downtimeMinutes: true },
    _avg: { oee: true },
  });
  console.log("Stats:", stats);
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  pool.end();
});
