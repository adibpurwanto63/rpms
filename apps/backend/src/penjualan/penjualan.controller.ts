import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { PenjualanService } from "./penjualan.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SalesOrderStatus } from "@prisma/client";

@ApiTags("Penjualan")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("penjualan")
export class PenjualanController {
  constructor(private svc: PenjualanService) {}

  @Get()
  findAll(@Query("status") status?: string) {
    return this.svc.findAll(status);
  }

  @Get("dashboard")
  getDashboard(@Query("date") date?: string) {
    return this.svc.getDashboard(date);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: {
    customerName: string;
    itemName: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    notes?: string;
  }) {
    return this.svc.create(dto);
  }

  @Put(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: SalesOrderStatus) {
    return this.svc.updateStatus(id, status);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.svc.delete(id);
  }
}
