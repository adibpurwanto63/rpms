import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from "@nestjs/common";
import { WarehouseService } from "./warehouse.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole, InventoryArea, InventoryStatus, QcGrade } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Warehouse")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("warehouse")
export class WarehouseController {
  constructor(private svc: WarehouseService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.DIRECTOR, UserRole.PRODUCTION_SUPERVISOR, UserRole.LOGISTICS_MANAGER)
  findAll(@Query("area") area?: InventoryArea, @Query("status") status?: InventoryStatus, @Query("grade") grade?: QcGrade) {
    return this.svc.findAll(area, status, grade);
  }

  @Get("summary")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.DIRECTOR)
  summary() { return this.svc.summaryByArea(); }

  @Get("fifo")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.LOGISTICS_MANAGER)
  fifo(@Query("grade") grade?: QcGrade) { return this.svc.fifoQueue(grade); }

  @Get(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  findOne(@Param("id") id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  create(@Body() dto: any) { return this.svc.create(dto); }

  @Put(":id/status")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  updateStatus(@Param("id") id: string, @Body() dto: { status: InventoryStatus }) {
    return this.svc.updateStatus(id, dto.status);
  }
}
