import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QcGrade } from "@prisma/client";

@Injectable()
export class QcService {
  constructor(private prisma: PrismaService) {}

  findAll(grade?: QcGrade) {
    return this.prisma.qcInspection.findMany({
      where: grade ? { grade } : {},
      include: { ticket: { include: { supplier: { select: { companyName: true } } } } },
      orderBy: { inspectedAt: "desc" },
    });
  }

  findOne(id: string) {
    return this.prisma.qcInspection.findUnique({
      where: { id },
      include: { ticket: true, officer: { select: { name: true } } },
    });
  }

  create(dto: any) {
    return this.prisma.qcInspection.create({
      data: dto,
      include: { ticket: true },
    });
  }

  gradeStats() {
    return this.prisma.qcInspection.groupBy({ by: ["grade"], _count: true });
  }
}
