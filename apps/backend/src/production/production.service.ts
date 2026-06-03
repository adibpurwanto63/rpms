import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.productionRecord.create({
      data: { ...dto, oee: parseFloat(oee.toFixed(2)) },
      include: { machine: true },
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
