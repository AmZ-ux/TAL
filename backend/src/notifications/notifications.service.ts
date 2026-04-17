import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const notificationSelection = {
  id: true,
  userId: true,
  type: true,
  title: true,
  message: true,
  read: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        select: notificationSelection,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
      select: notificationSelection,
    });
  }

  async createIfNotExists(input: CreateNotificationInput) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
      },
      select: { id: true },
    });

    if (existing) {
      return {
        created: false,
      };
    }

    await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
      },
      select: { id: true },
    });

    return {
      created: true,
    };
  }
}
