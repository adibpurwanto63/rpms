import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ProductionService } from "./production.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Production")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("production")
export class ProductionController {
  constructor(private svc: ProductionService) {}

  @Get("machines")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.DIRECTOR, UserRole.WAREHOUSE_SUPERVISOR)
  getMachines() { return this.svc.getMachines(); }

  @Put("machines/:id/status")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR)
  updateMachine(@Param("id") id: string, @Body() dto: { status: any }) { return this.svc.updateMachineStatus(id, dto.status); }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.DIRECTOR, UserRole.WAREHOUSE_SUPERVISOR)
  getRecords(@Query("machineId") machineId?: string) { return this.svc.getRecords(machineId); }

  @Get("stats/today")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.DIRECTOR)
  todayStats() { return this.svc.todayStats(); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR)
  create(@Body() dto: any) { return this.svc.createRecord(dto); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR)
  update(@Param('id') id: string, @Body() dto: any) { return this.svc.updateRecord(id, dto); }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR)
  delete(@Param('id') id: string) { return this.svc.deleteRecord(id); }
}
