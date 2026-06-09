import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany();
  console.log("Vehicles in DB:", vehicles);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
