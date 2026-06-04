import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  
  console.log("Seeding dashboard data...");
  const days = 7;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    
    const purchaseWeight = Math.floor(Math.random() * 10000) + 5000;
    const productionWeight = Math.floor(Math.random() * 10000) + 4000;
    
    const supplier = await prisma.supplier.upsert({
      where: { id: "seed-supplier" },
      update: {},
      create: { id: "seed-supplier", companyName: "Supplier Dummy", picName: "Budi", phone: "0812", address: "Jakarta" }
    });

    await prisma.weighingTicket.upsert({
      where: { ticketNumber: `WT-SEED-${i}` },
      update: { date: d, netWeight: purchaseWeight },
      create: {
        ticketNumber: `WT-SEED-${i}`,
        supplierId: supplier.id,
        truckNumber: "B 1234 CD",
        driverName: "Budi",
        materialType: "Plastik",
        grossWeight: purchaseWeight + 2000,
        tareWeight: 2000,
        netWeight: purchaseWeight,
        date: d
      }
    });

    const machine = await prisma.machine.upsert({
      where: { id: "seed-machine" },
      update: {},
      create: { id: "seed-machine", name: "Mesin A", type: "HORIZONTAL_BALER" }
    });

    await prisma.productionRecord.create({
      data: {
        machineId: machine.id,
        inputWeight: productionWeight + 100,
        outputWeight: productionWeight,
        baleCount: Math.floor(productionWeight / 100),
        oee: 90.3,
        date: d
      }
    });

    const customer = await prisma.customer.upsert({
      where: { id: "seed-customer" },
      update: {},
      create: { id: "seed-customer", companyName: "PT Penjualan", picName: "Budi", phone: "0812", address: "Jakarta" }
    });

    // Random sales (between 3T and 12T)
    const salesQuantity = Math.floor(Math.random() * 9000) + 3000;
    
    await prisma.salesOrder.upsert({
      where: { orderNumber: `SO-SEED-${i}` },
      update: { quantity: salesQuantity, totalAmount: salesQuantity * 5000, createdAt: d },
      create: {
        orderNumber: `SO-SEED-${i}`,
        customerId: customer.id,
        itemName: "Plastik",
        quantity: salesQuantity,
        unit: "kg",
        unitPrice: 5000,
        totalAmount: salesQuantity * 5000,
        status: "APPROVED",
        createdAt: d
      }
    });
  }

  const vehicle = await prisma.vehicle.upsert({
    where: { plate: "B 9999 SEED" },
    update: {},
    create: { plate: "B 9999 SEED", type: "ENGKEL", driverName: "Agus" }
  });

  const createDOs = async (status: any, count: number, prefix: string) => {
    for (let i = 0; i < count; i++) {
      await prisma.deliveryOrder.upsert({
        where: { orderNumber: `DO-SEED-${prefix}-${i}` },
        update: { status: status },
        create: {
          orderNumber: `DO-SEED-${prefix}-${i}`,
          vehicleId: vehicle.id,
          destination: "Jakarta",
          loadingWeight: 1000,
          status: status
        }
      });
    }
  };

  await createDOs('DELIVERED', 14, 'DEL');
  await createDOs('IN_TRANSIT', 3, 'TRN');
  await createDOs('CANCELLED', 3, 'CAN');

  console.log("Seeding complete!");
  await app.close();
}
bootstrap().catch(console.error);
