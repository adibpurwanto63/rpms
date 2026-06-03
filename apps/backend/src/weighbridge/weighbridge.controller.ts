import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { WeighbridgeService } from "./weighbridge.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Weighbridge")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("weighbridge")
export class WeighbridgeController {
  constructor(private svc: WeighbridgeService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.QC_OFFICER, UserRole.DIRECTOR, UserRole.LOGISTICS_MANAGER)
  findAll(@Query("from") from?: string, @Query("to") to?: string) {
    return this.svc.findAll(from, to);
  }

  @Get("stats/today")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.DIRECTOR)
  todayStats() { return this.svc.todayStats(); }

  @Get(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.QC_OFFICER)
  findOne(@Param("id") id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER)
  create(@Body() dto: any) { return this.svc.create(dto); }
}
