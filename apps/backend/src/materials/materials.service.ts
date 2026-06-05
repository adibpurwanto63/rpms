import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, lowStockOnly?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as any } },
        { category: { contains: search, mode: "insensitive" as any } },
      ];
    }
    return this.prisma.material.findMany({
      where,
      include: { supplier: { select: { id: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
    }).then((items) => {
      if (lowStockOnly === "true") {
        return items.filter((m) => m.lowStockThreshold > 0 && m.stock <= m.lowStockThreshold);
      }
      return items;
    });
  }

  async findOne(id: string) {
    const m = await this.prisma.material.findUnique({
      where: { id },
      include: { supplier: { select: { id: true, companyName: true } } },
    });
    if (!m) throw new NotFoundException("Material not found");
    return m;
  }

  async create(dto: { name: string; category?: string; stock?: number; unit?: string; lowStockThreshold?: number; supplierId?: string; notes?: string }) {
    return this.prisma.material.create({
      data: { ...dto } as any,
      include: { supplier: { select: { id: true, companyName: true } } },
    });
  }

  async update(id: string, dto: { name?: string; category?: string; stock?: number; unit?: string; lowStockThreshold?: number; supplierId?: string; notes?: string }) {
    await this.findOne(id);
    return this.prisma.material.update({
      where: { id },
      data: { ...dto } as any,
      include: { supplier: { select: { id: true, companyName: true } } },
    });
  }

  async adjustStock(id: string, delta: number) {
    const m = await this.findOne(id);
    const newStock = m.stock + delta;
    if (newStock < 0) throw new BadRequestException(`Stok tidak cukup. Stok saat ini: ${m.stock} ${m.unit}`);
    return this.prisma.material.update({
      where: { id },
      data: { stock: newStock },
      include: { supplier: { select: { id: true, companyName: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const used = await this.prisma.productionRecord.count({ where: { materialId: id } });
    if (used > 0) throw new BadRequestException(`Material dipakai di ${used} catatan produksi, tidak bisa dihapus`);
    return this.prisma.material.delete({ where: { id } });
  }

  async dashboard() {
    const [total, items] = await Promise.all([
      this.prisma.material.count(),
      this.prisma.material.findMany(),
    ]);
    const totalStock = items.reduce((s, m) => s + m.stock, 0);
    const lowStock = items.filter((m) => m.lowStockThreshold > 0 && m.stock <= m.lowStockThreshold).length;
    const categories = Array.from(new Set(items.map((m) => m.category).filter(Boolean)));
    return { total, totalStock, lowStock, categories };
  }
}
