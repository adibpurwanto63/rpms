import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnreadNotifications() {
    return this.prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }

  async markAllAsRead() {
    await this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    return { success: true };
  }

  async createNotification(title: string, message: string) {
    return this.prisma.notification.create({
      data: { title, message }
    });
  }
}
