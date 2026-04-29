import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateNotificationInput,
  INotificationsRepository,
  ListNotificationsFilter,
} from './interfaces/notifications-repository.interface';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
} from './dto/notification-response.dto';

type PrismaNotification = {
  id: string;
  type: NotificationResponseDto['type'];
  title: string;
  body: string;
  metadata: Prisma.JsonValue | null;
  isRead: boolean;
  createdAt: Date;
};

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateNotificationInput,
  ): Promise<NotificationResponseDto> {
    const created = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });
    return this.map(created);
  }

  async createMany(inputs: CreateNotificationInput[]): Promise<number> {
    if (inputs.length === 0) return 0;
    const result = await this.prisma.notification.createMany({
      data: inputs.map((i) => ({
        userId: i.userId,
        type: i.type,
        title: i.title,
        body: i.body,
        metadata: i.metadata
          ? (i.metadata as Prisma.InputJsonValue)
          : Prisma.DbNull,
      })),
    });
    return result.count;
  }

  async findAdminUserIds(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.admin },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  }

  async list(
    filter: ListNotificationsFilter,
  ): Promise<NotificationListResponseDto> {
    const where = {
      userId: filter.userId,
      ...(filter.unreadOnly ? { isRead: false } : {}),
    };
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        take: filter.limit,
        skip: filter.offset,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId: filter.userId, isRead: false },
      }),
    ]);
    return {
      items: items.map(this.map),
      total,
      unreadCount,
    };
  }

  async markRead(userId: string, id: string): Promise<boolean> {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return result.count > 0;
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }

  private map(n: PrismaNotification): NotificationResponseDto {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      metadata:
        n.metadata && typeof n.metadata === 'object' && !Array.isArray(n.metadata)
          ? (n.metadata as Record<string, unknown>)
          : null,
      isRead: n.isRead,
      createdAt: n.createdAt,
    };
  }
}
