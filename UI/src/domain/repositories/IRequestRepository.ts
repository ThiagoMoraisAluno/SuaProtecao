import type { Request, CoverageType, RequestStatus } from "@/domain/entities";

export interface CreateServiceRequestDto {
  serviceId: string;
  description: string;
  desiredDate: string;
}

export interface CreateCoverageRequestDto {
  coverageType: CoverageType;
  description: string;
  estimatedLoss: number;
  evidenceUrls?: string[];
}

export interface UpdateRequestDto {
  status?: RequestStatus;
  adminNotes?: string;
  approvedAmount?: number;
}

export interface IRequestRepository {
  findAll(): Promise<Request[]>;
  findOne(id: string): Promise<Request>;
  createService(dto: CreateServiceRequestDto): Promise<Request>;
  createCoverage(dto: CreateCoverageRequestDto): Promise<Request>;
  updateStatus(id: string, dto: UpdateRequestDto): Promise<Request>;
}
