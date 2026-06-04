import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IncidentStatus } from "@prisma/client";

@Injectable()
export class BcpService {
  constructor(private prisma: PrismaService) {}

  getIncidents(status?: IncidentStatus) {
    return this.prisma.incident.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
    });
  }

  createIncident(dto: any) { return this.prisma.incident.create({ data: dto }); }

  resolveIncident(id: string) {
    return this.prisma.incident.update({ where: { id }, data: { status: IncidentStatus.RESOLVED, resolvedAt: new Date() } });
  }

  updateIncidentStatus(id: string, status: IncidentStatus) {
    return this.prisma.incident.update({ where: { id }, data: { status, resolvedAt: status === IncidentStatus.RESOLVED || status === IncidentStatus.CLOSED ? new Date() : null } });
  }

  getRiskRegister() { return this.prisma.riskRegister.findMany({ orderBy: { createdAt: "desc" } }); }
  createRisk(dto: any) { return this.prisma.riskRegister.create({ data: dto }); }

  async alertSummary() {
    const open = await this.prisma.incident.count({ where: { status: IncidentStatus.OPEN } });
    const critical = await this.prisma.incident.count({ where: { status: IncidentStatus.OPEN, severity: "CRITICAL" } });
    const highRisk = await this.prisma.riskRegister.count({ where: { AND: [{ likelihood: { gte: 4 } }, { impact: { gte: 4 } }] } });
    return { openIncidents: open, criticalIncidents: critical, highRiskItems: highRisk };
  }
}
