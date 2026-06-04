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
  findAll(
    @Query("area") area?: InventoryArea,
    @Query("status") status?: InventoryStatus,
    @Query("grade") grade?: QcGrade,
    @Query("pendingApproval") pendingApproval?: string,
  ) {
    const pending = pendingApproval === "true" ? true : pendingApproval === "false" ? false : undefined;
    return this.svc.findAll(area, status, grade, pending);
  }

  @Get("summary")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.DIRECTOR)
  summary() { return this.svc.summaryByArea(); }

  @Get("stats/today")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.DIRECTOR)
  todayStats() { return this.svc.todayStats(); }

  @Get("fifo")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.LOGISTICS_MANAGER)
  fifo(@Query("grade") grade?: QcGrade) { return this.svc.fifoQueue(grade); }

  @Get("movements")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.DIRECTOR)
  movements(@Query("inventoryId") inventoryId?: string) { return this.svc.getMovements(inventoryId); }

  @Get(":id")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  findOne(@Param("id") id: string) { return this.svc.findOne(id); }

  // ─── INBOUND ──────────────────────────────────────────────────────────────
  @Post("inbound")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.PRODUCTION_SUPERVISOR)
  submitInbound(@Body() dto: any) { return this.svc.submitInbound(dto); }

  @Put("inbound/:id/approve")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  approveInbound(@Param("id") id: string, @Body() dto: { approvedBy?: string }) {
    return this.svc.approveInbound(id, dto.approvedBy || "Supervisor");
  }

  @Put("inbound/:id/reject")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  rejectInbound(@Param("id") id: string, @Body() dto: { rejectedBy?: string }) {
    return this.svc.rejectInbound(id, dto.rejectedBy || "Supervisor");
  }

  // ─── STOCK OPERATIONS ─────────────────────────────────────────────────────
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  create(@Body() dto: any) { return this.svc.create(dto); }

  @Put(":id/move")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  moveItem(@Param("id") id: string, @Body() dto: { toArea: InventoryArea; toLocation: string; performedBy?: string }) {
    return this.svc.moveItem(id, dto.toArea, dto.toLocation, dto.performedBy);
  }

  @Post("reserve")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.LOGISTICS_MANAGER)
  reserve(@Body() dto: { ids: string[]; performedBy?: string }) {
    return this.svc.reserveItems(dto.ids, dto.performedBy);
  }

  @Post("load-do")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.LOGISTICS_MANAGER)
  loadIntoDO(@Body() dto: { deliveryOrderId: string; ids: string[]; performedBy?: string }) {
    return this.svc.loadIntoDO(dto.deliveryOrderId, dto.ids, dto.performedBy);
  }

  @Post("dispatch")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR, UserRole.LOGISTICS_MANAGER)
  dispatch(@Body() dto: { ids: string[]; performedBy?: string }) {
    return this.svc.dispatchItems(dto.ids, dto.performedBy);
  }

  @Put(":id/status")
  @Roles(UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_SUPERVISOR)
  updateStatus(@Param("id") id: string, @Body() dto: { status: InventoryStatus }) {
    return this.svc.updateStatus(id, dto.status);
  }
}
