import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from "@nestjs/common";
import { LogisticsService } from "./logistics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole, DeliveryStatus } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Logistics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("logistics")
export class LogisticsController {
  constructor(private svc: LogisticsService) {}

  @Get("vehicles")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.DIRECTOR)
  getVehicles() { return this.svc.getVehicles(); }

  @Post("vehicles")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.WAREHOUSE_SUPERVISOR)
  createVehicle(@Body() dto: any) { return this.svc.createVehicle(dto); }

  @Put("vehicles/:id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.WAREHOUSE_SUPERVISOR)
  updateVehicle(@Param("id") id: string, @Body() dto: any) { return this.svc.updateVehicle(id, dto); }

  @Get("deliveries")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.DIRECTOR, UserRole.WAREHOUSE_SUPERVISOR)
  getDeliveries(@Query("status") status?: DeliveryStatus) { return this.svc.getDeliveries(status); }

  @Get("stats")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.DIRECTOR)
  stats() { return this.svc.stats(); }

  @Get("stats/today")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.DIRECTOR)
  todayStats() { return this.svc.todayStats(); }

  @Post("deliveries")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.WAREHOUSE_SUPERVISOR)
  create(@Body() dto: any) { return this.svc.createDelivery(dto); }

  @Put("deliveries/:id/status")
  @Roles(UserRole.SUPER_ADMIN, UserRole.LOGISTICS_MANAGER, UserRole.WAREHOUSE_SUPERVISOR)
  updateStatus(@Param("id") id: string, @Body() dto: { status: DeliveryStatus }) {
    return this.svc.updateStatus(id, dto.status);
  }
}
