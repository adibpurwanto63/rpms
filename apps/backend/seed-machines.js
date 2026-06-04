const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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

main().catch(console.error).finally(() => prisma.$disconnect());
