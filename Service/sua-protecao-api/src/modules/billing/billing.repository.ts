import { Injectable } from '@nestjs/common';
import { ClientStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IBillingRepository,
  OverdueClientRow,
} from './interfaces/billing-repository.interface';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class BillingRepository implements IBillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOverdueClients(
    gracePeriodDays: number,
  ): Promise<OverdueClientRow[]> {
    const cutoff = new Date(Date.now() - gracePeriodDays * MS_PER_DAY);

    // Pagamentos críticos (já overdue OU pending vencido + graceDays) cujo
    // cliente ainda está active (defaulters já estão marcados).
    const overduePayments = await this.prisma.payment.findMany({
      where: {
        OR: [
          { status: PaymentStatus.overdue },
          {
            status: PaymentStatus.pending,
            dueDate: { lt: cutoff },
          },
        ],
        client: { status: ClientStatus.active },
      },
      include: {
        client: {
          include: {
            user: { include: { profile: true } },
            supervisor: { include: { user: { include: { profile: true } } } },
          },
        },
      },
      distinct: ['clientId'],
    });

    return overduePayments.map((p) => ({
      clientId: p.client.id,
      clientUserId: p.client.id,
      clientName: p.client.user.profile?.username ?? '',
      supervisorUserId: p.client.supervisorId,
      supervisorName: p.client.supervisor?.user.profile?.username ?? null,
    }));
  }

  async markAsDefaulter(clientId: string): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: { status: ClientStatus.defaulter },
    });
  }
}
