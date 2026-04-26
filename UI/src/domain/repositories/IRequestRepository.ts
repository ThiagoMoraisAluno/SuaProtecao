import type { Request, ServiceType, CoverageType, RequestStatus } from "@/domain/entities";

export interface CreateServiceRequestDto {
  serviceType: ServiceType;
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
  assignedTo?: string;
}

export interface IRequestRepository {
  findAll(): Promise<Request[]>;
  findOne(id: string): Promise<Request>;
  createService(dto: CreateServiceRequestDto): Promise<Request>;
  createCoverage(dto: CreateCoverageRequestDto): Promise<Request>;
  updateStatus(id: string, dto: UpdateRequestDto): Promise<Request>;
  assign(id: string, assignedTo: string): Promise<Request>;
}
