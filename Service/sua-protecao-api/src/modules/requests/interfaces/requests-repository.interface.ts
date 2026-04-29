import { ClientStatus, RequestStatus, RequestType } from '@prisma/client';
import { CreateServiceRequestDto } from '../dto/create-service-request.dto';
import { CreateCoverageRequestDto } from '../dto/create-coverage-request.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { RequestResponseDto } from '../dto/request-response.dto';

export interface ClientForRequest {
  id: string;
  status: ClientStatus;
  servicesUsedThisMonth: number;
  planId: string;
  supervisorId: string | null;
  plan: { coverageLimit: { toNumber(): number } };
  user: { profile: { username: string } | null };
  supervisor: { user: { profile: { username: string } | null } } | null;
}

export interface RequestRecord {
  id: string;
  type: RequestType;
  status: RequestStatus;
  clientId: string;
}

export interface ServiceRuleEnforcement {
  serviceId: string;
  maxPerMonth: number;
  maxPerYear: number;
  coverageLimit: number;
}

export interface IRequestsRepository {
  findClientForRequest(clientId: string): Promise<ClientForRequest | null>;
  sumApprovedCoverageThisYear(clientId: string): Promise<number>;
  createServiceRequest(
    dto: CreateServiceRequestDto,
    clientId: string,
    clientName: string,
    rule: ServiceRuleEnforcement,
  ): Promise<RequestResponseDto>;
  createCoverageRequest(
    dto: CreateCoverageRequestDto,
    clientId: string,
    clientName: string,
  ): Promise<RequestResponseDto>;
  findAll(): Promise<RequestResponseDto[]>;
  findByClientId(clientId: string): Promise<RequestResponseDto[]>;
  findById(id: string): Promise<RequestResponseDto | null>;
  findRecordById(id: string): Promise<RequestRecord | null>;
  update(id: string, dto: UpdateRequestDto): Promise<RequestResponseDto>;
}

export const REQUESTS_REPOSITORY_TOKEN = 'REQUESTS_REPOSITORY';
