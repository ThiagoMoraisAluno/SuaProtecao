import api from "@/lib/api";
import type { Request, ServiceType, CoverageType, RequestStatus } from "@/types";

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

export const requestsService = {
  async createService(dto: CreateServiceRequestDto): Promise<Request> {
    const { data } = await api.post<Request>("/requests/service", dto);
    return data;
  },

  async createCoverage(dto: CreateCoverageRequestDto): Promise<Request> {
    const { data } = await api.post<Request>("/requests/coverage", dto);
    return data;
  },

  async findAll(): Promise<Request[]> {
    const { data } = await api.get<Request[]>("/requests");
    return data;
  },

  async findOne(id: string): Promise<Request> {
    const { data } = await api.get<Request>(`/requests/${id}`);
    return data;
  },

  async updateStatus(id: string, dto: UpdateRequestDto): Promise<Request> {
    const { data } = await api.patch<Request>(`/requests/${id}/status`, dto);
    return data;
  },

  async assign(id: string, assignedTo: string): Promise<Request> {
    const { data } = await api.patch<Request>(`/requests/${id}/assign`, { assignedTo });
    return data;
  },
};
