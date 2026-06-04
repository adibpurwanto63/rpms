const { PrismaClient, InventoryStatus, InvoiceType, IncidentStatus, PurchaseOrderStatus, SalesOrderStatus, DeliveryStatus } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dashboard data...");
  
  // We need to seed 7 days of trend data
  const days = 7;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    
    // Random purchase (net weight between 5T and 15T)
    const purchaseWeight = Math.floor(Math.random() * 10000) + 5000;
    // Random production (output weight between 4T and 14T)
    const productionWeight = Math.floor(Math.random() * 10000) + 4000;
    
    // Create dummy supplier if not exists
    const supplier = await prisma.supplier.upsert({
      where: { id: "seed-supplier" },
      update: {},
      create: { id: "seed-supplier", companyName: "Supplier Dummy", picName: "Budi", phone: "0812", address: "Jakarta" }
    });

    // We don't have a unique constraint on WeighingTicket date, but we have ticketNumber
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

    // Dummy machine
    const machine = await prisma.machine.upsert({
      where: { id: "seed-machine" },
      update: {},
      create: { id: "seed-machine", name: "Mesin A", type: "CRUSHER" }
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
  }

  // Delivery Orders for donut chart (Selesai=70, Distribusi=15, Dikembalikan=15)
  // Let's just create 70 DELIVERED, 15 IN_TRANSIT, 15 CANCELLED
  // First, we need a vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { plate: "B 9999 SEED" },
    update: {},
    create: { plate: "B 9999 SEED", type: "ENGKEL", driverName: "Agus" }
  });

  // Since we only need counts, let's create a few of each
  const createDOs = async (status, count, prefix) => {
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
}

main().catch(console.error).finally(()=>prisma.$disconnect());
