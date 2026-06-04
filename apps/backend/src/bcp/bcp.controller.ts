import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from "@nestjs/common";
import { BcpService } from "./bcp.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole, IncidentStatus } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("BCP")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("bcp")
export class BcpController {
  constructor(private svc: BcpService) {}

  @Get("alerts")
  alertSummary() { return this.svc.alertSummary(); }

  @Get("incidents")
  getIncidents(@Query("status") status?: IncidentStatus) { return this.svc.getIncidents(status); }

  @Post("incidents")
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.PRODUCTION_SUPERVISOR, UserRole.WAREHOUSE_SUPERVISOR, UserRole.LOGISTICS_MANAGER)
  createIncident(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createIncident({ ...dto, reportedBy: user.id });
  }

  @Put("incidents/:id/resolve")
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTOR)
  resolve(@Param("id") id: string) { return this.svc.resolveIncident(id); }

  @Put("incidents/:id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTOR)
  updateStatus(@Param("id") id: string, @Body("status") status: IncidentStatus) {
    return this.svc.updateIncidentStatus(id, status);
  }

  @Get("risks")
  getRisks() { return this.svc.getRiskRegister(); }

  @Post("risks")
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTOR)
  createRisk(@Body() dto: any) { return this.svc.createRisk(dto); }
}
