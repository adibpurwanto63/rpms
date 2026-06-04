import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { InvoiceType, InventoryStatus, IncidentStatus, PurchaseOrderStatus, SalesOrderStatus } from "@prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_dnWjzf4P8FRw@ep-ancient-wind-apqnezaa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const res = await Promise.all([
    prisma.weighingTicket.aggregate({ where: { date: { gte: today, lt: tomorrow } }, _count: true, _sum: { netWeight: true } }),
    prisma.productionRecord.aggregate({ where: { date: { gte: today, lt: tomorrow } }, _sum: { outputWeight: true, baleCount: true }, _avg: { oee: true } }),
    prisma.deliveryOrder.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _count: true, _sum: { loadingWeight: true } }),
    prisma.inventoryItem.aggregate({ where: { status: InventoryStatus.IN_STOCK }, _count: true, _sum: { weight: true } }),
    prisma.invoice.aggregate({ where: { type: InvoiceType.ACCOUNTS_RECEIVABLE }, _sum: { amount: true, paidAmount: true } }),
    prisma.invoice.aggregate({ where: { type: InvoiceType.ACCOUNTS_PAYABLE }, _sum: { amount: true, paidAmount: true } }),
    prisma.incident.count({ where: { status: IncidentStatus.OPEN } }),
    prisma.weighingTicket.findMany({ orderBy: { date: "desc" }, take: 5, include: { supplier: { select: { companyName: true } } } }),
    prisma.productionRecord.findMany({ orderBy: { date: "desc" }, take: 5, include: { machine: true } }),
    prisma.purchaseOrder.count({ where: { status: { in: [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.ORDERED] } } }),
    prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { supplier: { select: { companyName: true } } } }),
    prisma.purchaseOrder.count(),
    prisma.purchaseOrder.aggregate({ _sum: { totalAmount: true } }),
    prisma.salesOrder.count({ where: { status: { in: [SalesOrderStatus.PENDING, SalesOrderStatus.APPROVED] } } }),
    prisma.salesOrder.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: { select: { companyName: true } } } }),
    prisma.salesOrder.count(),
    prisma.salesOrder.aggregate({ _sum: { totalAmount: true } }),
  ]);
  console.log("Success");
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  pool.end();
});
