import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole, InvoiceType, PaymentStatus } from "@prisma/client";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Finance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("finance")
export class FinanceController {
  constructor(private svc: FinanceService) {}

  @Get("dashboard")
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER, UserRole.DIRECTOR)
  dashboard() { return this.svc.dashboard(); }

  @Get("invoices")
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER, UserRole.DIRECTOR)
  getInvoices(@Query("type") type?: InvoiceType, @Query("status") status?: PaymentStatus) {
    return this.svc.getInvoices(type, status);
  }

  @Post("invoices")
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER)
  createInvoice(@Body() dto: any) { return this.svc.createInvoice(dto); }

  @Put("invoices/:id/payment")
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER)
  updatePayment(@Param("id") id: string, @Body() dto: { amount: number }) {
    return this.svc.updatePayment(id, dto.amount);
  }
}
