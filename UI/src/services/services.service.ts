// Shim de compatibilidade — implementação em src/infrastructure/repositories/service.repository.ts
export { serviceRepository as servicesService } from "@/infrastructure/repositories/service.repository";
export type {
  CreateServiceInput,
  UpdateServiceInput,
} from "@/domain/repositories/IServiceRepository";
