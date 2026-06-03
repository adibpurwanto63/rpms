import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryStatus, InventoryArea, QcGrade } from "@prisma/client";

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  findAll(area?: InventoryArea, status?: InventoryStatus, grade?: QcGrade) {
    return this.prisma.inventoryItem.findMany({
      where: {
        ...(area ? { area } : {}),
        ...(status ? { status } : {}),
        ...(grade ? { grade } : {}),
      },
      orderBy: { productionDate: "asc" },
    });
  }

  findOne(id: string) { return this.prisma.inventoryItem.findUnique({ where: { id } }); }

  create(dto: any) { return this.prisma.inventoryItem.create({ data: dto }); }

  updateStatus(id: string, status: InventoryStatus) {
    return this.prisma.inventoryItem.update({ where: { id }, data: { status } });
  }

  async summaryByArea() {
    const result = await this.prisma.inventoryItem.groupBy({
      by: ["area", "status"],
      _count: true,
      _sum: { weight: true },
    });
    return result;
  }

  fifoQueue(grade?: QcGrade) {
    return this.prisma.inventoryItem.findMany({
      where: { status: InventoryStatus.IN_STOCK, ...(grade ? { grade } : {}) },
      orderBy: { productionDate: "asc" },
      take: 50,
    });
  }
}
