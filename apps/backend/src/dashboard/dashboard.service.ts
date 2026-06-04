import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InvoiceType, InventoryStatus, IncidentStatus, PurchaseOrderStatus, SalesOrderStatus } from "@prisma/client";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveDashboard(dateStr?: string) {
    const today = dateStr ? new Date(dateStr) : new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayPurchase, todayProduction, todayShipment,
      inventory, ar, ap, incidents, recentTickets, recentProduction,
      pendingPO, recentPO, totalPO, totalSpend,
      pendingSO, recentSO, totalSO, totalRevenue,
      deliveryStats
    ] = await Promise.all([
      this.prisma.weighingTicket.aggregate({ where: { date: { gte: today, lt: tomorrow } }, _count: true, _sum: { netWeight: true } }),
      this.prisma.productionRecord.aggregate({ where: { date: { gte: today, lt: tomorrow } }, _sum: { outputWeight: true, baleCount: true }, _avg: { oee: true } }),
      this.prisma.deliveryOrder.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _count: true, _sum: { loadingWeight: true } }),
      this.prisma.inventoryItem.aggregate({ where: { status: InventoryStatus.IN_STOCK }, _count: true, _sum: { weight: true } }),
      this.prisma.invoice.aggregate({ where: { type: InvoiceType.ACCOUNTS_RECEIVABLE }, _sum: { amount: true, paidAmount: true } }),
      this.prisma.invoice.aggregate({ where: { type: InvoiceType.ACCOUNTS_PAYABLE }, _sum: { amount: true, paidAmount: true } }),
      this.prisma.incident.count({ where: { status: IncidentStatus.OPEN } }),
      this.prisma.weighingTicket.findMany({ orderBy: { date: "desc" }, take: 5, include: { supplier: { select: { companyName: true } } } }),
      this.prisma.productionRecord.findMany({ orderBy: { date: "desc" }, take: 5, include: { machine: true } }),
      this.prisma.purchaseOrder.count({ where: { status: { in: [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.ORDERED] } } }),
      this.prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { supplier: { select: { companyName: true } } } }),
      this.prisma.purchaseOrder.count(),
      this.prisma.purchaseOrder.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.salesOrder.count({ where: { status: { in: [SalesOrderStatus.PENDING, SalesOrderStatus.APPROVED] } } }),
      this.prisma.salesOrder.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: { select: { companyName: true } } } }),
      this.prisma.salesOrder.count(),
      this.prisma.salesOrder.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.deliveryOrder.groupBy({ by: ['status'], _count: true }),
    ]);

    const revenue = ar._sum.amount || 0;
    const totalAR = revenue - (ar._sum.paidAmount || 0);
    const totalAP = (ap._sum.amount || 0) - (ap._sum.paidAmount || 0);
    const cashPosition = (ar._sum.paidAmount || 0) - (ap._sum.paidAmount || 0);

    const delivered = deliveryStats.find(s => s.status === 'DELIVERED')?._count || 0;
    const inTransit = deliveryStats.find(s => s.status === 'IN_TRANSIT')?._count || 0;
    const cancelled = deliveryStats.find(s => s.status === 'CANCELLED')?._count || 0;
    // Add default values if all zero so chart doesn't break
    const hasDeliveryData = delivered > 0 || inTransit > 0 || cancelled > 0;

    return {
      todayPurchase: { count: todayPurchase._count, weight: todayPurchase._sum.netWeight || 0 },
      todayProduction: { weight: todayProduction._sum.outputWeight || 0, baleCount: todayProduction._sum.baleCount || 0, avgOee: todayProduction._avg.oee || 0 },
      todayShipment: { count: todayShipment._count, weight: todayShipment._sum.loadingWeight || 0 },
      inventory: { count: inventory._count, weight: inventory._sum.weight || 0 },
      finance: { revenue, totalAR, totalAP, cashPosition },
      riskStatus: { openIncidents: incidents },
      recentTickets,
      recentProduction,
      pembelian: {
        pendingPO,
        recentPO,
        totalPO,
        totalSpend: totalSpend._sum.totalAmount || 0,
      },
      penjualan: {
        pendingSO,
        recentSO,
        totalSO,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      salesAnalytics: hasDeliveryData ? [
        { name: "Selesai", value: delivered },
        { name: "Distribusi", value: inTransit },
        { name: "Dikembalikan", value: cancelled }
      ] : [
        { name: "Selesai", value: 1 },
        { name: "Distribusi", value: 0 },
        { name: "Dikembalikan", value: 0 }
      ]
    };
  }

  async getKpiTrend(days: number = 7) {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      const [purchase, sales] = await Promise.all([
        this.prisma.weighingTicket.aggregate({ where: { date: { gte: d, lt: nd } }, _sum: { netWeight: true } }),
        this.prisma.salesOrder.aggregate({ where: { createdAt: { gte: d, lt: nd } }, _sum: { quantity: true } }),
      ]);
      data.push({
        date: d.toISOString().split("T")[0],
        purchase: purchase._sum.netWeight || 0,
        sales: sales._sum.quantity || 0,
      });
    }
    return data;
  }
}
