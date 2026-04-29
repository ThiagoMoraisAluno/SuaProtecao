import api from "@/infrastructure/http/api";
import type { NotificationListResponse } from "@/domain/entities";
import type {
  INotificationRepository,
  ListNotificationsOptions,
} from "@/domain/repositories/INotificationRepository";

export const notificationRepository: INotificationRepository = {
  async list(
    options: ListNotificationsOptions = {},
  ): Promise<NotificationListResponse> {
    const { data } = await api.get<NotificationListResponse>("/notifications", {
      params: {
        ...(options.limit !== undefined && { limit: options.limit }),
        ...(options.offset !== undefined && { offset: options.offset }),
        ...(options.unreadOnly && { unreadOnly: "true" }),
      },
    });
    return data;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<{ updated: number }> {
    const { data } = await api.patch<{ updated: number }>(
      "/notifications/read-all",
    );
    return data;
  },
};
