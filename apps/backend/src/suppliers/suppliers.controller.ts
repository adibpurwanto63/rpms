import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, SupplierStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.DIRECTOR)
  findAll(@Query('status') status?: SupplierStatus) {
    return this.suppliersService.findAll(status);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.DIRECTOR)
  stats() { return this.suppliersService.stats(); }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER)
  findOne(@Param('id') id: string) { return this.suppliersService.findOne(id); }

  @Get(':id/history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUPPLIER)
  getHistory(@Param('id') id: string) { return this.suppliersService.getHistory(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER)
  create(@Body() dto: any) { return this.suppliersService.create(dto); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER)
  update(@Param('id') id: string, @Body() dto: any) { return this.suppliersService.update(id, dto); }

  @Put(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER)
  updateStatus(@Param('id') id: string, @Body('status') status: SupplierStatus) {
    return this.suppliersService.updateStatus(id, status);
  }

  @Put(':id/rating')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER)
  updateRating(@Param('id') id: string, @Body() dto: { rating: number }) {
    return this.suppliersService.updateRating(id, dto.rating);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROCUREMENT_MANAGER)
  delete(@Param('id') id: string) {
    return this.suppliersService.delete(id);
  }
}
