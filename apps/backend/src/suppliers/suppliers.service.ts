import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierStatus } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: SupplierStatus) {
    return this.prisma.supplier.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const s = await this.prisma.supplier.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  create(dto: any) {
    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async updateRating(id: string, rating: number) {
    return this.prisma.supplier.update({ where: { id }, data: { rating } });
  }

  async getHistory(id: string) {
    return this.prisma.weighingTicket.findMany({
      where: { supplierId: id },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }

  stats() {
    return this.prisma.supplier.groupBy({ by: ['status'], _count: true });
  }
}
