import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: { name: string; email: string; password: string; role: UserRole }) {
    const hash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash: hash, role: dto.role },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
  }

  async update(id: string, dto: Partial<{ name: string; role: UserRole; isActive: boolean }>) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  async resetPassword(id: string, password: string) {
    const hash = await bcrypt.hash(password, 12);
    return this.prisma.user.update({ where: { id }, data: { passwordHash: hash } });
  }
}
