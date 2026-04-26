// Shim de compatibilidade — implementação em src/infrastructure/repositories/supervisor.repository.ts
export { supervisorRepository as supervisorsService } from "@/infrastructure/repositories/supervisor.repository";
export type {
  CreateSupervisorDto,
  CommissionInfo,
} from "@/domain/repositories/ISupervisorRepository";
