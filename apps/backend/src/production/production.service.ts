import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) {}

  getMachines() { return this.prisma.machine.findMany(); }
  updateMachineStatus(id: string, status: any) { return this.prisma.machine.update({ where: { id }, data: { status } }); }

  getRecords(machineId?: string) {
    return this.prisma.productionRecord.findMany({
      where: machineId ? { machineId } : {},
      include: { machine: true },
      orderBy: { date: "desc" },
      take: 100,
    });
  }

  async createRecord(dto: any) {
    const oee = dto.runtimeMinutes > 0
      ? ((dto.runtimeMinutes / (dto.runtimeMinutes + (dto.downtimeMinutes || 0))) * (dto.outputWeight / dto.inputWeight) * 0.95 * 100)
      : 0;
    
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.productionRecord.create({
        data: { ...dto, oee: parseFloat(oee.toFixed(2)) },
        include: { machine: true },
      });

      if (record.baleCount > 0) {
        const bales = [];
        const weightPerBale = record.outputWeight / record.baleCount;
        for (let i = 1; i <= record.baleCount; i++) {
          bales.push({
            baleId: `B-${record.id.substring(0, 6).toUpperCase()}-${i}`,
            weight: parseFloat(weightPerBale.toFixed(2)),
            grade: "A" as any,
            area: "FINISHED_GOODS" as any,
            status: "IN_STOCK" as any,
            productionId: record.id,
            productionDate: record.date,
          });
        }
        await tx.inventoryItem.createMany({ data: bales });
      }

      this.notifications.createNotification(
        "Produksi Baru", 
        `Mesin ${record.machine?.name || 'Unknown'} memproduksi ${record.baleCount} bale.`
      );

      return record;
    });
  }

  async updateRecord(id: string, dto: any) {
    const oee = dto.runtimeMinutes > 0
      ? ((dto.runtimeMinutes / (dto.runtimeMinutes + (dto.downtimeMinutes || 0))) * (dto.outputWeight / dto.inputWeight) * 0.95 * 100)
      : 0;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.productionRecord.update({
        where: { id },
        data: { ...dto, oee: parseFloat(oee.toFixed(2)) },
        include: { machine: true },
      });

      await tx.inventoryItem.deleteMany({ where: { productionId: id } });
      if (record.baleCount > 0) {
        const bales = [];
        const weightPerBale = record.outputWeight / record.baleCount;
        for (let i = 1; i <= record.baleCount; i++) {
          bales.push({
            baleId: `B-${record.id.substring(0, 6).toUpperCase()}-${i}`,
            weight: parseFloat(weightPerBale.toFixed(2)),
            grade: "A" as any,
            area: "FINISHED_GOODS" as any,
            status: "IN_STOCK" as any,
            productionId: record.id,
            productionDate: record.date,
          });
        }
        await tx.inventoryItem.createMany({ data: bales });
      }
      return record;
    });
  }

  async deleteRecord(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryItem.deleteMany({ where: { productionId: id } });
      return tx.productionRecord.delete({ where: { id } });
    });
  }

  todayStats() {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return this.prisma.productionRecord.aggregate({
      where: { date: { gte: today, lt: tomorrow } },
      _sum: { inputWeight: true, outputWeight: true, baleCount: true, downtimeMinutes: true },
      _avg: { oee: true },
    });
  }
}
