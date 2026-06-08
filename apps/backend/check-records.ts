import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const records = await prisma.productionRecord.findMany({ include: { material: true } });
  console.log("Total records:", records.length);
  records.forEach(r => {
    console.log(`Date: ${r.date}, Material: ${r.material?.name}, Input: ${r.inputWeight}`);
  });
}
main().finally(() => prisma.$disconnect());
