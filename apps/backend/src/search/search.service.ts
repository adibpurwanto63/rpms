import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(q: string) {
    const term = `%${q}%`;
    const results: any[] = [];

    // Search Suppliers
    const suppliers = await this.prisma.supplier.findMany({
      where: { OR: [{ companyName: { contains: q, mode: 'insensitive' } }, { picName: { contains: q, mode: 'insensitive' } }] },
      take: 5
    });
    suppliers.forEach(s => results.push({ type: 'Supplier', title: s.companyName, subtitle: s.picName, url: `/portal/purchase?supplierId=${s.id}` }));

    // Search Customers
    const customers = await this.prisma.customer.findMany({
      where: { OR: [{ companyName: { contains: q, mode: 'insensitive' } }, { picName: { contains: q, mode: 'insensitive' } }] },
      take: 5
    });
    customers.forEach(c => results.push({ type: 'Customer', title: c.companyName, subtitle: c.picName, url: `/portal/penjualan` }));

    // Search PO
    const pos = await this.prisma.purchaseOrder.findMany({
      where: { OR: [{ orderNumber: { contains: q, mode: 'insensitive' } }, { itemName: { contains: q, mode: 'insensitive' } }] },
      take: 5,
      include: { supplier: true }
    });
    pos.forEach(po => results.push({ type: 'Purchase Order', title: po.orderNumber, subtitle: `${po.itemName} - ${po.supplier.companyName}`, url: `/portal/pembelian` }));

    // Search SO
    const sos = await this.prisma.salesOrder.findMany({
      where: { OR: [{ orderNumber: { contains: q, mode: 'insensitive' } }, { itemName: { contains: q, mode: 'insensitive' } }] },
      take: 5,
      include: { customer: true }
    });
    sos.forEach(so => results.push({ type: 'Sales Order', title: so.orderNumber, subtitle: `${so.itemName} - ${so.customer.companyName}`, url: `/portal/penjualan` }));

    // Search Machines
    const machines = await this.prisma.machine.findMany({
      where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { location: { contains: q, mode: 'insensitive' } }] },
      take: 5
    });
    machines.forEach(m => results.push({ type: 'Machine', title: m.name, subtitle: m.location || 'Unknown location', url: `/portal/production` }));

    // Search Tickets
    const tickets = await this.prisma.weighingTicket.findMany({
      where: { OR: [{ ticketNumber: { contains: q, mode: 'insensitive' } }, { truckNumber: { contains: q, mode: 'insensitive' } }] },
      take: 5
    });
    tickets.forEach(t => results.push({ type: 'Weighing Ticket', title: t.ticketNumber, subtitle: t.truckNumber, url: `/portal/weighbridge` }));

    // Search Menus
    const menus = [
      { label: "Dashboard", href: "/portal/dashboard" },
      { label: "Procurement", href: "/portal/purchase" },
      { label: "Timbangan", href: "/portal/weighbridge" },
      { label: "Pembelian", href: "/portal/pembelian" },
      { label: "Produksi", href: "/portal/production" },
      { label: "Gudang", href: "/portal/warehouse" },
      { label: "Logistik", href: "/portal/logistics" },
      { label: "Penjualan", href: "/portal/penjualan" },
      { label: "QC", href: "/portal/qc" },
      { label: "Keuangan", href: "/portal/finance" },
      { label: "Pengaturan", href: "/portal/settings" },
    ];
    menus.filter(m => m.label.toLowerCase().includes(q.toLowerCase())).forEach(m => {
      results.push({ type: 'Menu', title: m.label, subtitle: 'Go to page', url: m.href });
    });

    return results;
  }
}
