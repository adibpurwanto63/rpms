import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) {}

  getMachines() { return this.prisma.machine.findMany(); }
  createMachine(dto: { name: string; type: any; location?: string }) { return this.prisma.machine.create({ data: dto as any }); }
  updateMachine(id: string, dto: { name?: string; type?: any; location?: string; status?: any }) { return this.prisma.machine.update({ where: { id }, data: dto }); }
  async deleteMachine(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const records = await tx.productionRecord.findMany({ where: { machineId: id }, select: { id: true } });
      const recordIds = records.map(r => r.id);
      if (recordIds.length > 0) {
        await tx.inventoryItem.deleteMany({ where: { productionId: { in: recordIds } } });
        await tx.productionRecord.deleteMany({ where: { machineId: id } });
      }
      return tx.machine.delete({ where: { id } });
    });
  }
  updateMachineStatus(id: string, status: any) { return this.prisma.machine.update({ where: { id }, data: { status } }); }

  getRecords(machineId?: string) {
    return this.prisma.productionRecord.findMany({
      where: machineId ? { machineId } : {},
      include: { machine: true, material: true },
      orderBy: { date: "desc" },
      take: 100,
    });
  }

  async createRecord(dto: any) {
    const oee = dto.runtimeMinutes > 0
      ? ((dto.runtimeMinutes / (dto.runtimeMinutes + (dto.downtimeMinutes || 0))) * (dto.outputWeight / dto.inputWeight) * 0.95 * 100)
      : 0;
    
    return this.prisma.$transaction(async (tx) => {
      if (dto.materialId) {
        const mat = await tx.material.findUnique({ where: { id: dto.materialId } });
        if (!mat) throw new BadRequestException("Material tidak ditemukan");
        if (mat.stock < dto.inputWeight) {
          throw new BadRequestException(`Stok material "${mat.name}" tidak cukup. Stok: ${mat.stock} ${mat.unit}, butuh: ${dto.inputWeight}`);
        }
        await tx.material.update({
          where: { id: dto.materialId },
          data: { stock: { decrement: dto.inputWeight } },
        });
      }

      const record = await tx.productionRecord.create({
        data: { ...dto, oee: parseFloat(oee.toFixed(2)) },
        include: { machine: true, material: true },
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
      const old = await tx.productionRecord.findUnique({ where: { id } });

      if (dto.materialId) {
        const mat = await tx.material.findUnique({ where: { id: dto.materialId } });
        if (!mat) throw new BadRequestException("Material tidak ditemukan");
        const newNeed = dto.inputWeight;
        const oldFromThis = old?.materialId === dto.materialId ? (old?.inputWeight || 0) : 0;
        const delta = newNeed - oldFromThis;
        if (delta > 0 && mat.stock < delta) {
          throw new BadRequestException(`Stok material "${mat.name}" tidak cukup. Stok: ${mat.stock} ${mat.unit}, butuh tambahan: ${delta}`);
        }
        if (delta !== 0) {
          await tx.material.update({
            where: { id: dto.materialId },
            data: { stock: { decrement: delta } },
          });
        }
      } else if (old?.materialId) {
        const mat = await tx.material.findUnique({ where: { id: old.materialId } });
        if (mat) {
          await tx.material.update({
            where: { id: old.materialId },
            data: { stock: { increment: old.inputWeight } },
          });
        }
      }

      const record = await tx.productionRecord.update({
        where: { id },
        data: { ...dto, oee: parseFloat(oee.toFixed(2)) },
        include: { machine: true, material: true },
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
      const rec = await tx.productionRecord.findUnique({ where: { id } });
      if (rec?.materialId) {
        await tx.material.update({
          where: { id: rec.materialId },
          data: { stock: { increment: rec.inputWeight } },
        });
      }
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
