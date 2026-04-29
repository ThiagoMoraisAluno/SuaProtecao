import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateNotificationInput,
  INotificationsRepository,
  NOTIFICATIONS_REPOSITORY_TOKEN,
} from './interfaces/notifications-repository.interface';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
} from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY_TOKEN)
    private readonly notificationsRepository: INotificationsRepository,
  ) {}

  /** Cria uma notificação para um único usuário. */
  create(input: CreateNotificationInput): Promise<NotificationResponseDto> {
    return this.notificationsRepository.create(input);
  }

  /** Cria a mesma notificação para muitos usuários. */
  async createForMany(
    userIds: string[],
    payload: Omit<CreateNotificationInput, 'userId'>,
  ): Promise<number> {
    const inputs = userIds.map((userId) => ({ ...payload, userId }));
    return this.notificationsRepository.createMany(inputs);
  }

  /** Notifica todos os masters/admins ativos. */
  async notifyAllAdmins(
    payload: Omit<CreateNotificationInput, 'userId'>,
  ): Promise<number> {
    const adminIds = await this.notificationsRepository.findAdminUserIds();
    return this.createForMany(adminIds, payload);
  }

  list(
    userId: string,
    options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
  ): Promise<NotificationListResponseDto> {
    return this.notificationsRepository.list({
      userId,
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      unreadOnly: options.unreadOnly ?? false,
    });
  }

  async markRead(userId: string, id: string): Promise<{ message: string }> {
    const ok = await this.notificationsRepository.markRead(userId, id);
    if (!ok) throw new NotFoundException('Notificação não encontrada.');
    return { message: 'Notificação marcada como lida.' };
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const updated = await this.notificationsRepository.markAllRead(userId);
    return { updated };
  }
}
