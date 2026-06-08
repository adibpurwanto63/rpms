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
      include: { vehicle: true, customer: true, items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createDelivery(dto: any) {
    const count = await this.prisma.deliveryOrder.count();
    return this.prisma.deliveryOrder.create({
      data: { ...dto, orderNumber: `DO-${new Date().getFullYear()}-${String(count+1).padStart(4,"0")}` },
      include: { vehicle: true, customer: true },
    });
  }

  async createVehicle(dto: any) {
    return this.prisma.vehicle.create({ data: dto });
  }

  async updateVehicle(id: string, dto: any) {
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: DeliveryStatus) {
    return this.prisma.$transaction(async (tx) => {
      const doOrder = await tx.deliveryOrder.findUnique({ where: { id } });
      if (!doOrder) throw new Error("Delivery order not found");

      if (status === DeliveryStatus.CANCELLED) {
        await tx.vehicle.update({ where: { id: doOrder.vehicleId }, data: { status: 'AVAILABLE' } });
        await tx.inventoryItem.updateMany({ where: { deliveryOrderId: id }, data: { status: 'IN_STOCK', deliveryOrderId: null } });
        await tx.deliveryOrder.delete({ where: { id } });
        return { deleted: true };
      }

      if (status === DeliveryStatus.LOADING) {
        await tx.vehicle.update({ where: { id: doOrder.vehicleId }, data: { status: 'ON_TRIP' } });
      }

      const updated = await tx.deliveryOrder.update({
        where: { id },
        data: {
          status,
          ...(status === DeliveryStatus.DELIVERED ? { arrivalTime: new Date() } : {})
        }
      });

      if (status === DeliveryStatus.IN_TRANSIT) {
        await tx.inventoryItem.updateMany({ where: { deliveryOrderId: id }, data: { status: 'SHIPPED' } });
      } else if (status === DeliveryStatus.DELIVERED) {
        await tx.vehicle.update({ where: { id: doOrder.vehicleId }, data: { status: 'AVAILABLE' } });
      }

      return updated;
    });
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

  stats() {
    return this.prisma.deliveryOrder.aggregate({
      _count: true,
      _sum: { loadingWeight: true },
    });
  }
}
