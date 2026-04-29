import { RequestStatus, RequestType } from '@prisma/client';

export type RequestResponseDto = {
  id: string;
  clientId: string;
  clientName: string;
  type: RequestType;
  description: string;
  status: RequestStatus;
  adminNotes: string | null;
  serviceId: string | null;
  serviceType: string | null;
  serviceName: string | null;
  serviceIcon: string | null;
  desiredDate: Date | null;
  coverageType: string | null;
  estimatedLoss: number | null;
  approvedAmount: number | null;
  evidenceUrls: string[];
  createdAt: Date;
  updatedAt: Date;
};
