import { ClientStatus, UserRole } from '@prisma/client';

export type ClientAssetDto = {
  id: string;
  name: string;
  estimatedValue: number;
};

export type ClientAddressDto = {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export type ClientResponseDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf: string;
  phone: string | null;
  planId: string;
  supervisorId: string | null;
  status: ClientStatus;
  totalAssetsValue: number;
  servicesUsedThisMonth: number;
  joinedAt: Date;
  lastPaymentAt: Date | null;
  address: ClientAddressDto;
  assets: ClientAssetDto[];
  createdAt: Date;
};

export type ClientListItemDto = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  status: ClientStatus;
  planId: string;
  planName: string;
  supervisorId: string | null;
  totalAssetsValue: number;
  servicesUsedThisMonth: number;
  joinedAt: Date;
  createdAt: Date;
};
