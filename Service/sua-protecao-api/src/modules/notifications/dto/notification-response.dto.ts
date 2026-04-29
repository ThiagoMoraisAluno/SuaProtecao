import { NotificationType } from '@prisma/client';

export type NotificationResponseDto = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
};

export type NotificationListResponseDto = {
  items: NotificationResponseDto[];
  total: number;
  unreadCount: number;
};
