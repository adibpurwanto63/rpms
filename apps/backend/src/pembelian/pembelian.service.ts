import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PurchaseOrderStatus } from "@prisma/client";

@Injectable()
export class PembelianService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PO-${ymd}-${rand}`;
  }

  async findAll(status?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: status ? { status: status as PurchaseOrderStatus } : undefined,
      include: { supplier: { select: { companyName: true, picName: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true },
    });
    if (!po) throw new NotFoundException("Purchase order not found");
    return po;
  }

  async create(dto: {
    supplierId: string;
    itemName: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    notes?: string;
    deliveryDate?: string;
  }) {
    const totalAmount = dto.quantity * dto.unitPrice;

    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          supplierId: dto.supplierId,
          itemName: dto.itemName,
          quantity: dto.quantity,
          unit: dto.unit || "kg",
          unitPrice: dto.unitPrice,
          totalAmount,
          notes: dto.notes,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        },
        include: { supplier: { select: { companyName: true } } },
      });

      const existing = await tx.material.findFirst({ where: { name: dto.itemName } });
      if (!existing) {
        await tx.material.create({
          data: {
            name: dto.itemName,
            stock: 0,
            unit: dto.unit || "kg",
            supplierId: dto.supplierId || null,
            category: this.guessCategory(dto.itemName),
            notes: `Otomatis dibuat dari PO ${po.orderNumber}`,
          } as any,
        });
      }

      return po;
    });
  }

  async updateStatus(id: string, status: PurchaseOrderStatus) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException("Purchase order not found");
    const wasReceived = po.status === PurchaseOrderStatus.RECEIVED;
    const isReceived = status === PurchaseOrderStatus.RECEIVED;
    const receivedAt = isReceived ? new Date() : undefined;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: { status, ...(receivedAt ? { receivedAt } : {}) },
        include: { supplier: { select: { companyName: true } } },
      });

      if (isReceived && !wasReceived) {
        const existing = await tx.material.findFirst({ where: { name: po.itemName } });
        if (existing) {
          await tx.material.update({
            where: { id: existing.id },
            data: {
              stock: { increment: po.quantity },
              unit: po.unit || existing.unit,
              supplierId: po.supplierId || existing.supplierId,
            },
          });
        } else {
          await tx.material.create({
            data: {
              name: po.itemName,
              stock: po.quantity,
              unit: po.unit || "kg",
              supplierId: po.supplierId || null,
              category: this.guessCategory(po.itemName),
              notes: `Otomatis dibuat dari PO ${po.orderNumber}`,
            } as any,
          });
        }
      } else if (!isReceived && wasReceived) {
        const existing = await tx.material.findFirst({ where: { name: po.itemName } });
        if (existing) {
          const newStock = Math.max(0, existing.stock - po.quantity);
          await tx.material.update({
            where: { id: existing.id },
            data: { stock: newStock },
          });
        }
      }

      return updated;
    });
  }

  private guessCategory(itemName: string): string {
    const n = itemName.toLowerCase();
    if (n.includes("kardus") || n.includes("occ") || n.includes("dlk") || n.includes("onp")) return "Kardus";
    if (n.includes("kertas") || n.includes("hvs")) return "Kertas";
    if (n.includes("plastik")) return "Plastik";
    return "Lainnya";
  }

  async delete(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException("Purchase order not found");
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }

  async getDashboard(dateStr?: string) {
    const today = dateStr ? new Date(dateStr) : new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, pendingOrders, receivedToday, totalSpend, recentOrders] = await Promise.all([
      this.prisma.purchaseOrder.count(),
      this.prisma.purchaseOrder.count({ where: { status: { in: ["PENDING", "APPROVED", "ORDERED"] } } }),
      this.prisma.purchaseOrder.count({ where: { receivedAt: { gte: today, lt: tomorrow } } }),
      this.prisma.purchaseOrder.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.purchaseOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { supplier: { select: { companyName: true } } },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      receivedToday,
      totalSpend: totalSpend._sum.totalAmount || 0,
      recentOrders,
    };
  }
}
