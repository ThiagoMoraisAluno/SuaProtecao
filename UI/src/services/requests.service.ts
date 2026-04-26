// Shim de compatibilidade — implementação em src/infrastructure/repositories/request.repository.ts
export { requestRepository as requestsService } from "@/infrastructure/repositories/request.repository";
export type {
  CreateServiceRequestDto,
  CreateCoverageRequestDto,
  UpdateRequestDto,
} from "@/domain/repositories/IRequestRepository";
