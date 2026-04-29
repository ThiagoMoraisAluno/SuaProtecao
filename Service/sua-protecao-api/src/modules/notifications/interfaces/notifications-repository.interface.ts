import { NotificationType } from '@prisma/client';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
} from '../dto/notification-response.dto';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface ListNotificationsFilter {
  userId: string;
  limit: number;
  offset: number;
  unreadOnly: boolean;
}

export interface INotificationsRepository {
  create(input: CreateNotificationInput): Promise<NotificationResponseDto>;
  createMany(inputs: CreateNotificationInput[]): Promise<number>;
  findAdminUserIds(): Promise<string[]>;
  list(filter: ListNotificationsFilter): Promise<NotificationListResponseDto>;
  markRead(userId: string, id: string): Promise<boolean>;
  markAllRead(userId: string): Promise<number>;
}

export const NOTIFICATIONS_REPOSITORY_TOKEN = 'NOTIFICATIONS_REPOSITORY';
