import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { PembelianService } from "./pembelian.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { PurchaseOrderStatus } from "@prisma/client";

@ApiTags("Pembelian")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("pembelian")
export class PembelianController {
  constructor(private svc: PembelianService) {}

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
    supplierId: string;
    itemName: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    notes?: string;
    deliveryDate?: string;
  }) {
    return this.svc.create(dto);
  }

  @Put(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: PurchaseOrderStatus) {
    return this.svc.updateStatus(id, status);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.svc.delete(id);
  }
}
