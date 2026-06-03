import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeighbridgeService {
  constructor(private prisma: PrismaService) {}

  findAll(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    return this.prisma.weighingTicket.findMany({
      where,
      include: { supplier: { select: { id: true, companyName: true } } },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.weighingTicket.findUnique({
      where: { id },
      include: { supplier: true, qcInspection: true },
    });
  }

  todayStats() {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return this.prisma.weighingTicket.aggregate({
      where: { date: { gte: today, lt: tomorrow } },
      _count: true,
      _sum: { netWeight: true },
    });
  }

  async create(dto: any) {
    const count = await this.prisma.weighingTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const net = (dto.grossWeight || 0) - (dto.tareWeight || 0);
    return this.prisma.weighingTicket.create({
      data: { ...dto, netWeight: net, ticketNumber },
    });
  }
}
