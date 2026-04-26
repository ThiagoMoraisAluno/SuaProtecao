import api from "@/infrastructure/http/api";
import { createBaseRepository } from "./base.repository";
import type { Request } from "@/domain/entities";
import type {
  IRequestRepository,
  CreateServiceRequestDto,
  CreateCoverageRequestDto,
  UpdateRequestDto,
} from "@/domain/repositories/IRequestRepository";

export const requestRepository: IRequestRepository = {
  ...createBaseRepository<Request>("/requests"),

  async createService(dto: CreateServiceRequestDto): Promise<Request> {
    const { data } = await api.post<Request>("/requests/service", dto);
    return data;
  },

  async createCoverage(dto: CreateCoverageRequestDto): Promise<Request> {
    const { data } = await api.post<Request>("/requests/coverage", dto);
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
