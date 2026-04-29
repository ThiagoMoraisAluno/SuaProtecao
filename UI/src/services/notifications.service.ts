// Shim de compatibilidade — implementação em src/infrastructure/repositories/notification.repository.ts
export { notificationRepository as notificationsService } from "@/infrastructure/repositories/notification.repository";
export type { ListNotificationsOptions } from "@/domain/repositories/INotificationRepository";
