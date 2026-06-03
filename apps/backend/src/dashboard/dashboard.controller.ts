import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private svc: DashboardService) {}

  @Get("executive")
  getExecutive(@Query("date") date?: string) { return this.svc.getExecutiveDashboard(date); }

  @Get("kpi-trend")
  getKpiTrend(@Query("days") days?: string) { return this.svc.getKpiTrend(days ? parseInt(days) : 7); }
}
