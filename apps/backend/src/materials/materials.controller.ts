import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { MaterialsService } from "./materials.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Materials")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("materials")
export class MaterialsController {
  constructor(private svc: MaterialsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.WAREHOUSE_SUPERVISOR, UserRole.PROCUREMENT_MANAGER, UserRole.DIRECTOR)
  findAll(@Query("search") search?: string, @Query("lowStock") lowStock?: string) {
    return this.svc.findAll(search, lowStock);
  }

  @Get("dashboard")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.WAREHOUSE_SUPERVISOR, UserRole.PROCUREMENT_MANAGER, UserRole.DIRECTOR)
  dashboard() {
    return this.svc.dashboard();
  }

  @Get(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.WAREHOUSE_SUPERVISOR, UserRole.PROCUREMENT_MANAGER, UserRole.DIRECTOR)
  findOne(@Param("id") id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.WAREHOUSE_SUPERVISOR)
  create(@Body() dto: { name: string; category?: string; stock?: number; unit?: string; lowStockThreshold?: number; supplierId?: string; notes?: string }) {
    return this.svc.create(dto);
  }

  @Put(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.WAREHOUSE_SUPERVISOR)
  update(@Param("id") id: string, @Body() dto: { name?: string; category?: string; stock?: number; unit?: string; lowStockThreshold?: number; supplierId?: string; notes?: string }) {
    return this.svc.update(id, dto);
  }

  @Post(":id/adjust")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR, UserRole.WAREHOUSE_SUPERVISOR)
  adjust(@Param("id") id: string, @Body("delta") delta: number) {
    return this.svc.adjustStock(id, Number(delta));
  }

  @Delete(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PRODUCTION_SUPERVISOR)
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }
}
