import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryStatus, InventoryArea, QcGrade } from "@prisma/client";

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  // ─── READ ───────────────────────────────────────────────────────────────────
  findAll(area?: InventoryArea, status?: InventoryStatus, grade?: QcGrade, pendingApproval?: boolean) {
    return this.prisma.inventoryItem.findMany({
      where: {
        ...(area ? { area } : {}),
        ...(status ? { status } : {}),
        ...(grade ? { grade } : {}),
        ...(pendingApproval !== undefined ? { pendingApproval } : {}),
      },
      orderBy: { productionDate: "asc" },
    });
  }

  findOne(id: string) { return this.prisma.inventoryItem.findUnique({ where: { id } }); }

  async summaryByArea() {
    const result = await this.prisma.inventoryItem.groupBy({
      by: ["area", "status"],
      _count: true,
      _sum: { weight: true },
      where: { pendingApproval: false },
    });
    return result;
  }

  fifoQueue(grade?: QcGrade) {
    return this.prisma.inventoryItem.findMany({
      where: { status: InventoryStatus.IN_STOCK, pendingApproval: false, ...(grade ? { grade } : {}) },
      orderBy: { productionDate: "asc" },
      take: 100,
    });
  }

  // ─── INBOUND ─────────────────────────────────────────────────────────────────
  async create(dto: any) {
    const isManual = !dto.productionId;
    
    if (!dto.baleId) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const count = await this.prisma.inventoryItem.count({
        where: { createdAt: { gte: startOfDay } }
      });
      
      dto.baleId = `BALE-${dateStr}-${String(count + 1).padStart(4, "0")}`;
    }

    return this.prisma.inventoryItem.create({
      data: { ...dto, pendingApproval: isManual },
    });
  }

  /** Operator submits a pending inbound receipt for Supervisor to approve */
  async submitInbound(dto: { baleId?: string; weight: number; grade: QcGrade; location?: string; notes?: string; submittedBy?: string }) {
    let baleId = dto.baleId;
    if (!baleId) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const count = await this.prisma.inventoryItem.count({
        where: { createdAt: { gte: startOfDay } }
      });
      
      baleId = `BALE-${dateStr}-${String(count + 1).padStart(4, "0")}`;
    }

    const item = await this.prisma.inventoryItem.create({
      data: {
        baleId,
        weight: dto.weight,
        grade: dto.grade,
        area: InventoryArea.RAW_MATERIAL,
        location: dto.location,
        status: InventoryStatus.IN_STOCK,
        pendingApproval: true,
        productionDate: new Date(),
      },
    });
    await this.prisma.stockMovement.create({
      data: {
        inventoryId: item.id,
        baleId: item.baleId,
        movementType: "INBOUND_PENDING",
        toArea: InventoryArea.RAW_MATERIAL,
        toStatus: InventoryStatus.IN_STOCK,
        weight: dto.weight,
        notes: dto.notes || "Menunggu persetujuan Supervisor",
        performedBy: dto.submittedBy,
      },
    });
    return item;
  }

  /** Supervisor approves a pending inbound receipt */
  async approveInbound(id: string, approvedBy: string) {
    const item = await this.prisma.inventoryItem.update({
      where: { id },
      data: { pendingApproval: false, approvedBy },
    });
    await this.prisma.stockMovement.create({
      data: {
        inventoryId: item.id,
        baleId: item.baleId,
        movementType: "INBOUND_APPROVED",
        toArea: item.area,
        toStatus: item.status,
        weight: item.weight,
        notes: "Penerimaan disetujui oleh Supervisor",
        performedBy: approvedBy,
      },
    });
    return item;
  }

  /** Supervisor rejects a pending inbound — deletes it */
  async rejectInbound(id: string, rejectedBy: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new Error("Item not found");
    await this.prisma.stockMovement.create({
      data: {
        inventoryId: item.id,
        baleId: item.baleId,
        movementType: "INBOUND_REJECTED",
        fromArea: item.area,
        weight: item.weight,
        notes: "Penerimaan ditolak oleh Supervisor",
        performedBy: rejectedBy,
      },
    });
    await this.prisma.inventoryItem.delete({ where: { id } });
    return { rejected: true };
  }

  // ─── MOVE ────────────────────────────────────────────────────────────────────
  async moveItem(id: string, toArea: InventoryArea, toLocation: string, performedBy?: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new Error("Item not found");
    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: { area: toArea, location: toLocation },
    });
    await this.prisma.stockMovement.create({
      data: {
        inventoryId: id,
        baleId: item.baleId,
        movementType: "MOVE",
        fromArea: item.area,
        toArea,
        fromLocation: item.location,
        toLocation,
        weight: item.weight,
        notes: `Dipindah dari ${item.area}/${item.location || "-"} ke ${toArea}/${toLocation}`,
        performedBy,
      },
    });
    return updated;
  }

  // ─── RESERVE ─────────────────────────────────────────────────────────────────
  async reserveItems(ids: string[], performedBy?: string) {
    const items = await this.prisma.inventoryItem.findMany({ where: { id: { in: ids } } });
    await this.prisma.inventoryItem.updateMany({ where: { id: { in: ids } }, data: { status: InventoryStatus.RESERVED } });
    await this.prisma.stockMovement.createMany({
      data: items.map((item) => ({
        inventoryId: item.id,
        baleId: item.baleId,
        movementType: "RESERVE",
        fromStatus: item.status,
        toStatus: InventoryStatus.RESERVED,
        fromArea: item.area,
        toArea: item.area,
        weight: item.weight,
        notes: "Direservasi untuk pengiriman",
        performedBy,
      })),
    });
    return { reserved: ids.length };
  }

  // ─── DISPATCH / LOAD DO ──────────────────────────────────────────────────────
  async loadIntoDO(deliveryOrderId: string, ids: string[], performedBy?: string) {
    const items = await this.prisma.inventoryItem.findMany({ where: { id: { in: ids } } });
    await this.prisma.inventoryItem.updateMany({ 
      where: { id: { in: ids } }, 
      data: { status: InventoryStatus.RESERVED, deliveryOrderId } 
    });
    
    await this.prisma.stockMovement.createMany({
      data: items.map((item) => ({
        inventoryId: item.id,
        baleId: item.baleId,
        movementType: "LOAD_DO",
        fromStatus: item.status,
        toStatus: InventoryStatus.RESERVED,
        fromArea: item.area,
        toArea: item.area,
        weight: item.weight,
        notes: `Dimuat ke Delivery Order (ID: ${deliveryOrderId})`,
        performedBy,
      })),
    });
    return { loaded: ids.length, deliveryOrderId };
  }

  // legacy dispatch (direct to shipped without DO) - left for backwards compatibility
  async dispatchItems(ids: string[], performedBy?: string) {
    const items = await this.prisma.inventoryItem.findMany({ where: { id: { in: ids } } });
    await this.prisma.inventoryItem.updateMany({ where: { id: { in: ids } }, data: { status: InventoryStatus.SHIPPED } });
    await this.prisma.stockMovement.createMany({
      data: items.map((item) => ({
        inventoryId: item.id,
        baleId: item.baleId,
        movementType: "OUTBOUND",
        fromStatus: item.status,
        toStatus: InventoryStatus.SHIPPED,
        fromArea: item.area,
        toArea: item.area,
        weight: item.weight,
        notes: "Dikirim (FIFO Outbound)",
        performedBy,
      })),
    });
    return { dispatched: ids.length };
  }

  // ─── STATUS ──────────────────────────────────────────────────────────────────
  updateStatus(id: string, status: InventoryStatus) {
    return this.prisma.inventoryItem.update({ where: { id }, data: { status } });
  }

  // ─── MUTATIONS ───────────────────────────────────────────────────────────────
  getMovements(inventoryId?: string) {
    return this.prisma.stockMovement.findMany({
      where: inventoryId ? { inventoryId } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { inventory: { select: { baleId: true, area: true } } },
    });
  }

  // ─── TODAY STATS ─────────────────────────────────────────────────────────────
  async todayStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const [inbound, outbound, pending] = await Promise.all([
      this.prisma.stockMovement.count({ where: { movementType: "INBOUND_APPROVED", createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.stockMovement.count({ where: { movementType: "OUTBOUND", createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.inventoryItem.count({ where: { pendingApproval: true } }),
    ]);
    return { inbound, outbound, pending };
  }
}
