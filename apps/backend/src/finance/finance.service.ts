import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InvoiceType, PaymentStatus } from "@prisma/client";

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  getInvoices(type?: InvoiceType, status?: PaymentStatus) {
    return this.prisma.invoice.findMany({
      where: { ...(type ? { type } : {}), ...(status ? { paymentStatus: status } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  createInvoice(dto: any) {
    return this.prisma.invoice.create({
      data: {
        ...dto,
        invoiceNumber: `INV-${dto.type === InvoiceType.ACCOUNTS_PAYABLE ? "AP" : "AR"}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
      }
    });
  }

  updatePayment(id: string, paidAmount: number) {
    return this.prisma.invoice.findUnique({ where: { id } }).then(inv => {
      if (!inv) return null;
      const total = inv.paidAmount + paidAmount;
      const status = total >= inv.amount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
      return this.prisma.invoice.update({ where: { id }, data: { paidAmount: total, paymentStatus: status } });
    });
  }

  async dashboard() {
    const [ar, ap, invoices] = await Promise.all([
      this.prisma.invoice.aggregate({ where: { type: InvoiceType.ACCOUNTS_RECEIVABLE }, _sum: { amount: true, paidAmount: true } }),
      this.prisma.invoice.aggregate({ where: { type: InvoiceType.ACCOUNTS_PAYABLE }, _sum: { amount: true, paidAmount: true } }),
      this.prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);
    const revenue = ar._sum.amount || 0;
    const totalCost = ap._sum.amount || 0;
    const grossProfit = revenue - totalCost;
    const cashPosition = (ar._sum.paidAmount || 0) - (ap._sum.paidAmount || 0);
    const totalAR = revenue - (ar._sum.paidAmount || 0);
    const totalAP = totalCost - (ap._sum.paidAmount || 0);
    return { revenue, totalCost, grossProfit, cashPosition, totalAR, totalAP, recentInvoices: invoices };
  }
}
