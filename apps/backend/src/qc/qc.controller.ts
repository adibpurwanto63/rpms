import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { QcService } from "./qc.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole, QcGrade } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("QC")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("qc")
export class QcController {
  constructor(private svc: QcService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.QC_OFFICER, UserRole.DIRECTOR, UserRole.PROCUREMENT_MANAGER)
  findAll(@Query("grade") grade?: QcGrade) { return this.svc.findAll(grade); }

  @Get("stats")
  @Roles(UserRole.SUPER_ADMIN, UserRole.QC_OFFICER, UserRole.DIRECTOR)
  stats() { return this.svc.gradeStats(); }

  @Get(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.QC_OFFICER)
  findOne(@Param("id") id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.QC_OFFICER)
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.create({ ...dto, officerId: user.id });
  }
}
