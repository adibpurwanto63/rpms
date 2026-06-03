import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SalesOrderStatus, InventoryStatus } from "@prisma/client";

@Injectable()
export class PenjualanService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SO-${ymd}-${rand}`;
  }

  async findAll(status?: string) {
    return this.prisma.salesOrder.findMany({
      where: status && status !== "all" ? { status: status as SalesOrderStatus } : undefined,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { companyName: true, picName: true } } }
    });
  }

  async findOne(id: string) {
    const so = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: { customer: true }
    });
    if (!so) throw new NotFoundException("Sales order not found");
    return so;
  }

  async create(dto: {
    customerId: string;
    itemName: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    notes?: string;
  }) {
    const totalAmount = dto.quantity * dto.unitPrice;
    return this.prisma.salesOrder.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        customerId: dto.customerId,
        itemName: dto.itemName,
        quantity: dto.quantity,
        unit: dto.unit || "kg",
        unitPrice: dto.unitPrice,
        totalAmount,
        notes: dto.notes,
      },
    });
  }

  async updateStatus(id: string, status: SalesOrderStatus) {
    const so = await this.prisma.salesOrder.findUnique({ where: { id } });
    if (!so) throw new NotFoundException("Sales order not found");

    if (so.status === SalesOrderStatus.SHIPPED && status !== SalesOrderStatus.SHIPPED) {
       throw new BadRequestException("Cannot revert a shipped order");
    }

    if (status === SalesOrderStatus.SHIPPED && so.status !== SalesOrderStatus.SHIPPED) {
      // Logic: Reduce stock
      // Inventory items are stored as individual bales or items.
      // We will find IN_STOCK items and deduct their weight until the target quantity is met.
      const targetWeight = so.unit === 'ton' ? so.quantity * 1000 : so.quantity;
      let remainingWeight = targetWeight;

      const availableItems = await this.prisma.inventoryItem.findMany({
        where: { status: InventoryStatus.IN_STOCK },
        orderBy: { createdAt: "asc" } // FIFO
      });

      const itemsToUpdate = [];
      for (const item of availableItems) {
        if (remainingWeight <= 0) break;
        itemsToUpdate.push(item.id);
        remainingWeight -= item.weight;
      }

      // We allow partial fulfillment technically, but marking them all as shipped
      if (itemsToUpdate.length > 0) {
        await this.prisma.inventoryItem.updateMany({
          where: { id: { in: itemsToUpdate } },
          data: { status: InventoryStatus.SHIPPED }
        });
      }
    }

    const shippedAt = status === SalesOrderStatus.SHIPPED ? new Date() : undefined;
    return this.prisma.salesOrder.update({
      where: { id },
      data: { status, ...(shippedAt ? { shippedAt } : {}) },
    });
  }

  async delete(id: string) {
    const so = await this.prisma.salesOrder.findUnique({ where: { id } });
    if (!so) throw new NotFoundException("Sales order not found");
    return this.prisma.salesOrder.delete({ where: { id } });
  }

  async getDashboard(dateStr?: string) {
    const today = dateStr ? new Date(dateStr) : new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, pendingOrders, shippedToday, totalRevenue, recentOrders] = await Promise.all([
      this.prisma.salesOrder.count(),
      this.prisma.salesOrder.count({ where: { status: { in: ["PENDING", "APPROVED"] } } }),
      this.prisma.salesOrder.count({ where: { shippedAt: { gte: today, lt: tomorrow } } }),
      this.prisma.salesOrder.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.salesOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: { select: { companyName: true } } }
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      shippedToday,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentOrders,
    };
  }
}
