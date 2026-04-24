import { ClientStatus } from '@prisma/client';

export type SupervisorClientItemDto = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  status: ClientStatus;
  planId: string;
  planName: string;
  joinedAt: Date;
};

export type SupervisorResponseDto = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  commission: number;
  totalClients: number;
  activeClients: number;
  defaulterClients: number;
  createdAt: Date;
};

export type SupervisorCommissionDto = {
  supervisorId: string;
  commissionPercentage: number;
  activeClients: number;
  totalActiveRevenue: number;
  estimatedMonthlyCommission: number;
};
