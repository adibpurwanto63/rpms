import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DeliveryStatus } from "@prisma/client";

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  getVehicles() { return this.prisma.vehicle.findMany({ include: { deliveries: { where: { status: { not: DeliveryStatus.DELIVERED } }, take: 1 } } }); }

  getDeliveries(status?: DeliveryStatus) {
    return this.prisma.deliveryOrder.findMany({
      where: status ? { status } : {},
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createDelivery(dto: any) {
    const count = await this.prisma.deliveryOrder.count();
    return this.prisma.deliveryOrder.create({
      data: { ...dto, orderNumber: `DO-${new Date().getFullYear()}-${String(count+1).padStart(4,"0")}` },
      include: { vehicle: true },
    });
  }

  updateStatus(id: string, status: DeliveryStatus) {
    return this.prisma.deliveryOrder.update({ where: { id }, data: { status, ...(status === DeliveryStatus.DELIVERED ? { arrivalTime: new Date() } : {}) } });
  }

  todayStats() {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return this.prisma.deliveryOrder.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _count: true,
      _sum: { loadingWeight: true },
    });
  }
}
