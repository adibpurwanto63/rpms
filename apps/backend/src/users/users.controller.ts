import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() { return this.usersService.findAll(); }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: { name: string; email: string; password: string; role: UserRole }) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.update(id, dto);
  }

  @Put(':id/reset-password')
  @Roles(UserRole.SUPER_ADMIN)
  resetPassword(@Param('id') id: string, @Body() dto: { password: string }) {
    return this.usersService.resetPassword(id, dto.password);
  }
}
