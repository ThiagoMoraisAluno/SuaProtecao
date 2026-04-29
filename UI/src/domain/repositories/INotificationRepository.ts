import type { NotificationListResponse } from "@/domain/entities";

export interface ListNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export interface INotificationRepository {
  list(options?: ListNotificationsOptions): Promise<NotificationListResponse>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<{ updated: number }>;
}
