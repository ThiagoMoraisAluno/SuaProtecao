// Shim de compatibilidade — implementação em src/infrastructure/repositories/client.repository.ts
export { clientRepository as clientsService } from "@/infrastructure/repositories/client.repository";
export type { CreateClientDto } from "@/domain/repositories/IClientRepository";
