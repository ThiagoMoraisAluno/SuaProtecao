import { Injectable } from '@nestjs/common';
import { BillingCycle, ClientStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IBillingRepository,
  OverdueClientRow,
} from './interfaces/billing-repository.interface';

const CYCLE_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  annual: 365,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class BillingRepository implements IBillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOverdueClients(
    gracePeriodDays: number,
  ): Promise<OverdueClientRow[]> {
    const candidates = await this.prisma.client.findMany({
      where: { status: ClientStatus.active },
      include: {
        plan: { select: { billingCycle: true } },
        user: { include: { profile: true } },
        supervisor: { include: { user: { include: { profile: true } } } },
      },
    });

    const now = Date.now();
    const overdue: OverdueClientRow[] = [];

    for (const client of candidates) {
      const reference = client.lastPaymentAt ?? client.joinedAt;
      const cycleDays = CYCLE_DAYS[client.plan.billingCycle];
      const nextDueAt = reference.getTime() + cycleDays * MS_PER_DAY;
      const cutoff = nextDueAt + gracePeriodDays * MS_PER_DAY;
      if (now > cutoff) {
        overdue.push({
          clientId: client.id,
          clientUserId: client.id,
          clientName: client.user.profile?.username ?? '',
          supervisorUserId: client.supervisorId,
          supervisorName: client.supervisor?.user.profile?.username ?? null,
        });
      }
    }

    return overdue;
  }

  async markAsDefaulter(clientId: string): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: { status: ClientStatus.defaulter },
    });
  }
}
