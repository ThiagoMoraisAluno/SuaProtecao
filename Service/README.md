# Sua Proteção | Reparo Certo — API Blueprint

> Blueprint completo para construção da Web API do sistema **Sua Proteção | Reparo Certo**, gerado por engenharia reversa do frontend React/TypeScript existente.

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack da API](#2-stack-da-api)
3. [Arquitetura Recomendada](#3-arquitetura-recomendada)
4. [Entidades & Schema Prisma](#4-entidades--schema-prisma)
5. [Módulos da API](#5-módulos-da-api)
6. [Rotas Completas da API](#6-rotas-completas-da-api)
7. [Autenticação & Autorização](#7-autenticação--autorização)
8. [Regras de Negócio por Módulo](#8-regras-de-negócio-por-módulo)
9. [Variáveis de Ambiente](#9-variáveis-de-ambiente)
10. [Guia de Setup Inicial](#10-guia-de-setup-inicial)
11. [Dependências Recomendadas](#11-dependências-recomendadas)
12. [Considerações de Migração (Supabase → Neon)](#12-considerações-de-migração-supabase--neon)

---

## 1. Visão Geral do Projeto

### O que é

**Sua Proteção | Reparo Certo** é uma plataforma SaaS de **assinatura de proteção residencial**. O cliente paga uma mensalidade e tem acesso a:

- **Serviços domésticos** sob demanda (encanador, eletricista, pedreiro, chaveiro, pintor, carpinteiro, diarista)
- **Cobertura financeira** para sinistros (roubo/furto, enchente, dano estrutural, incêndio)

O sistema é multi-tenant com três perfis de acesso distintos e uma cadeia de responsabilidade supervisor → cliente.

### Problema que resolve

Eliminar a dificuldade de encontrar prestadores de serviço confiáveis e a vulnerabilidade financeira diante de imprevistos domésticos, entregando tudo em uma assinatura mensal gerenciada.

### Principais Atores / Usuários

| Ator | Descrição |
|---|---|
| **Admin** | Gestor master do sistema. Gerencia supervisores, clientes, planos e todos os chamados. Acesso irrestrito. |
| **Supervisor** | Consultor de vendas. Cadastra clientes, acompanha sua carteira, visualiza comissão estimada. |
| **Cliente** | Assinante final. Visualiza seu plano, abre chamados de serviço ou cobertura, acompanha histórico. |

### Planos Disponíveis (extraídos do frontend)

| Plano | Preço/mês | Serviços/mês | Cobertura máxima |
|---|---|---|---|
| Básico | R$ 49,99 | 1 | R$ 20.000 |
| Intermediário | R$ 99,90 | 2 | R$ 40.000 |
| Premium | R$ 169,90 | Ilimitado | R$ 80.000 |

---

## 2. Stack da API

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20+ |
| Framework | NestJS 10+ |
| Linguagem | TypeScript 5+ |
| ORM | Prisma 5+ |
| Banco de dados | Neon (PostgreSQL serverless) |
| Autenticação | JWT (access token + refresh token) |
| Validação | class-validator + class-transformer |
| Hash de senha | bcrypt |
| Upload de arquivos | (futuro) AWS S3 / Cloudflare R2 |
| Documentação | Swagger (@nestjs/swagger) |
| Testes | Jest + Supertest |

---

## 3. Arquitetura Recomendada

### Estrutura de Pastas

```
src/
├── main.ts                        # Bootstrap da aplicação
├── app.module.ts                  # Módulo raiz
│
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts     # @Roles('admin', 'supervisor')
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       └── reset-password.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── supervisors/
│   │   ├── supervisors.module.ts
│   │   ├── supervisors.controller.ts
│   │   ├── supervisors.service.ts
│   │   └── dto/
│   │       └── create-supervisor.dto.ts
│   │
│   ├── clients/
│   │   ├── clients.module.ts
│   │   ├── clients.controller.ts
│   │   ├── clients.service.ts
│   │   └── dto/
│   │       ├── create-client.dto.ts
│   │       └── update-client-status.dto.ts
│   │
│   ├── plans/
│   │   ├── plans.module.ts
│   │   ├── plans.controller.ts
│   │   ├── plans.service.ts
│   │   └── dto/
│   │       └── update-plan.dto.ts
│   │
│   ├── requests/
│   │   ├── requests.module.ts
│   │   ├── requests.controller.ts
│   │   ├── requests.service.ts
│   │   └── dto/
│   │       ├── create-service-request.dto.ts
│   │       ├── create-coverage-request.dto.ts
│   │       └── update-request.dto.ts
│   │
│   └── dashboard/
│       ├── dashboard.module.ts
│       ├── dashboard.controller.ts
│       └── dashboard.service.ts
│
└── prisma/
    ├── prisma.module.ts
    ├── prisma.service.ts
    └── schema.prisma
```

### Padrões a seguir

- **Módulos NestJS**: cada domínio encapsulado em seu próprio módulo
- **Controllers**: apenas roteamento, validação de entrada e resposta HTTP
- **Services**: toda lógica de negócio e acesso a dados
- **DTOs**: validados com `class-validator` e transformados com `class-transformer`
- **Guards**: `JwtAuthGuard` (autenticação) + `RolesGuard` (autorização por role)
- **Decorator `@Roles()`**: aplicado nos controllers para controle de acesso
- **PrismaService**: injetado como provider global

---

## 4. Entidades & Schema Prisma

### Diagrama de Relacionamentos

```
User (auth)
  ├── UserProfile (1:1) — username
  ├── RefreshToken (1:N)
  ├── Supervisor (1:1)  — commission
  └── Client (1:1)
        ├── ClientAsset (1:N) — bens do imóvel
        ├── Plan (N:1)        — plano contratado
        └── Request (1:N)     — chamados
```

### Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum UserRole {
  admin
  supervisor
  client
}

enum PlanType {
  basic
  intermediate
  premium
}

enum ClientStatus {
  active
  inactive
  defaulter
}

enum RequestStatus {
  pending      // Serviço: aguardando atendimento
  in_progress  // Serviço: em atendimento
  completed    // Serviço: concluído
  analyzing    // Cobertura: em análise
  approved     // Cobertura: aprovado
  denied       // Cobertura: negado
}

enum RequestType {
  service
  coverage
}

enum ServiceType {
  plumber
  electrician
  mason
  locksmith
  painter
  carpenter
  cleaner
  other
}

enum CoverageType {
  theft
  flood
  structural_damage
  fire
  other
}

// ─── USER ─────────────────────────────────────────────────────────────────────

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         UserRole @default(client)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  profile    UserProfile?
  supervisor Supervisor?
  client     Client?

  refreshTokens RefreshToken[]

  @@map("users")
}

model UserProfile {
  id        String   @id @map("user_id")
  username  String
  phone     String?
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [id], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// ─── SUPERVISOR ───────────────────────────────────────────────────────────────

model Supervisor {
  id         String   @id @map("user_id")
  commission Decimal  @default(10) @db.Decimal(5, 2)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  user    User     @relation(fields: [id], references: [id], onDelete: Cascade)
  clients Client[]

  @@map("supervisors")
}

// ─── PLAN ─────────────────────────────────────────────────────────────────────

model Plan {
  id               String   @id @default(uuid())
  type             PlanType @unique
  name             String
  price            Decimal  @db.Decimal(10, 2)
  servicesPerMonth Int      @map("services_per_month") // -1 = ilimitado
  coverageLimit    Decimal  @map("coverage_limit") @db.Decimal(12, 2)
  features         String[]
  color            String   @default("brand")
  popular          Boolean  @default(false)
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  clients Client[]

  @@map("plans")
}

// ─── CLIENT ───────────────────────────────────────────────────────────────────

model Client {
  id                    String       @id @map("user_id")
  cpf                   String       @unique
  phone                 String?
  planId                String       @map("plan_id")
  supervisorId          String?      @map("supervisor_id")
  status                ClientStatus @default(active)
  totalAssetsValue      Decimal      @default(0) @map("total_assets_value") @db.Decimal(12, 2)
  servicesUsedThisMonth Int          @default(0) @map("services_used_this_month")
  joinedAt              DateTime     @default(now()) @map("joined_at")
  lastPaymentAt         DateTime?    @map("last_payment_at")
  createdAt             DateTime     @default(now()) @map("created_at")
  updatedAt             DateTime     @updatedAt @map("updated_at")

  // Endereço desnormalizado (mesmo padrão do Supabase)
  addressStreet       String  @map("address_street")
  addressNumber       String  @map("address_number")
  addressComplement   String? @map("address_complement")
  addressNeighborhood String  @map("address_neighborhood")
  addressCity         String  @map("address_city")
  addressState        String  @map("address_state")
  addressZipCode      String  @map("address_zip_code")

  user       User        @relation(fields: [id], references: [id], onDelete: Cascade)
  plan       Plan        @relation(fields: [planId], references: [id])
  supervisor Supervisor? @relation(fields: [supervisorId], references: [id])
  assets     ClientAsset[]
  requests   Request[]

  @@index([supervisorId])
  @@index([planId])
  @@index([status])
  @@map("clients")
}

model ClientAsset {
  id             String  @id @default(uuid())
  clientId       String  @map("client_id")
  name           String
  estimatedValue Decimal @map("estimated_value") @db.Decimal(12, 2)

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@map("client_assets")
}

// ─── REQUEST ──────────────────────────────────────────────────────────────────

model Request {
  id          String        @id @default(uuid())
  clientId    String        @map("client_id")
  clientName  String        @map("client_name") // desnormalizado para performance
  type        RequestType
  description String        @db.Text
  status      RequestStatus
  adminNotes  String?       @map("admin_notes") @db.Text
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  // Campos exclusivos de SERVIÇO
  serviceType ServiceType? @map("service_type")
  desiredDate DateTime?    @map("desired_date") @db.Date

  // Campos exclusivos de COBERTURA
  coverageType   CoverageType? @map("coverage_type")
  estimatedLoss  Decimal?      @map("estimated_loss") @db.Decimal(12, 2)
  approvedAmount Decimal?      @map("approved_amount") @db.Decimal(12, 2)
  evidenceUrls   String[]      @map("evidence_urls")

  client Client @relation(fields: [clientId], references: [id])

  @@index([clientId])
  @@index([type])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("requests")
}
```

---

## 5. Módulos da API

### 5.1 Módulo: `auth`

**Responsabilidade:** Autenticação de usuários — login, registro de cliente (self-service), recuperação e redefinição de senha, logout, refresh de token.

#### Endpoints

| Método | Rota | Descrição | Auth? |
|---|---|---|---|
| POST | `/auth/login` | Login com e-mail e senha | Não |
| POST | `/auth/register` | Registro de novo cliente (self-service, 4 etapas no frontend) | Não |
| POST | `/auth/forgot-password` | Envia e-mail de recuperação de senha | Não |
| POST | `/auth/reset-password` | Redefine senha via token | Não |
| POST | `/auth/refresh` | Gera novo access token a partir do refresh token | Não |
| POST | `/auth/logout` | Invalida refresh token | Sim (JWT) |
| GET | `/auth/me` | Retorna dados do usuário autenticado | Sim (JWT) |

#### DTOs

**`LoginDto`**
```typescript
class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**`RegisterDto`** (registro de cliente completo — 4 etapas no frontend)
```typescript
class RegisterDto {
  // Dados pessoais
  @IsString() @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  cpf: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsString() @MinLength(6)
  password: string;

  // Endereço
  @IsString() addressStreet: string;
  @IsString() addressNumber: string;
  @IsOptional() @IsString() addressComplement?: string;
  @IsString() addressNeighborhood: string;
  @IsString() addressCity: string;
  @IsString() @Length(2, 2) addressState: string;
  @IsString() addressZipCode: string;

  // Plano
  @IsString()
  planId: string;

  // Bens
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientAssetDto)
  assets: ClientAssetDto[];
}

class ClientAssetDto {
  @IsString() name: string;
  @IsNumber() @Min(0) estimatedValue: number;
}
```

**`ForgotPasswordDto`**
```typescript
class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
```

**`ResetPasswordDto`**
```typescript
class ResetPasswordDto {
  @IsString()
  token: string; // JWT de recuperação enviado por e-mail

  @IsString() @MinLength(6)
  password: string;
}
```

#### Exemplo de Resposta — Login

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "d3f4a9b2-...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@cliente.com",
    "role": "client",
    "phone": "(11) 91234-5678"
  }
}
```

#### Exemplo de Resposta — GET /auth/me

```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@cliente.com",
  "role": "client",
  "phone": "(11) 91234-5678"
}
```

---

### 5.2 Módulo: `plans`

**Responsabilidade:** CRUD dos planos de assinatura. Apenas admin pode editar. Leitura pública (usada na landing page e formulários de cadastro).

#### Endpoints

| Método | Rota | Descrição | Auth? |
|---|---|---|---|
| GET | `/plans` | Lista todos os planos ordenados por preço | Não |
| GET | `/plans/:id` | Retorna um plano específico | Não |
| PATCH | `/plans/:id` | Atualiza dados do plano | Sim (admin) |

> **Nota:** O frontend não possui tela de criação ou exclusão de planos — apenas edição. Criar/excluir pode ser implementado futuramente.

#### DTOs

**`UpdatePlanDto`**
```typescript
class UpdatePlanDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @IsOptional() @IsInt()
  servicesPerMonth?: number; // -1 = ilimitado

  @IsOptional() @IsNumber() @Min(0)
  coverageLimit?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  features?: string[];
}
```

#### Exemplo de Resposta — GET /plans

```json
[
  {
    "id": "uuid-basic",
    "type": "basic",
    "name": "Plano Básico",
    "price": 49.99,
    "servicesPerMonth": 1,
    "coverageLimit": 20000,
    "features": [
      "1 serviço por mês",
      "Cobertura até R$ 20.000",
      "Suporte via WhatsApp",
      "Encanamento e Elétrica",
      "Atendimento em até 48h"
    ],
    "color": "slate",
    "popular": false
  },
  {
    "id": "uuid-intermediate",
    "type": "intermediate",
    "name": "Plano Intermediário",
    "price": 99.90,
    "servicesPerMonth": 2,
    "coverageLimit": 40000,
    "features": ["..."],
    "color": "brand",
    "popular": true
  },
  {
    "id": "uuid-premium",
    "type": "premium",
    "name": "Plano Premium",
    "price": 169.90,
    "servicesPerMonth": -1,
    "coverageLimit": 80000,
    "features": ["..."],
    "color": "navy",
    "popular": false
  }
]
```

---

### 5.3 Módulo: `supervisors`

**Responsabilidade:** Gerenciamento de supervisores. Apenas admin pode criar e listar todos.

#### Endpoints

| Método | Rota | Descrição | Auth? |
|---|---|---|---|
| GET | `/supervisors` | Lista todos os supervisores | Sim (admin) |
| GET | `/supervisors/:id` | Retorna um supervisor por ID | Sim (admin, supervisor próprio) |
| POST | `/supervisors` | Cria novo supervisor (+ usuário) | Sim (admin) |

#### DTOs

**`CreateSupervisorDto`**
```typescript
class CreateSupervisorDto {
  @IsString() @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsNumber() @Min(0) @Max(100)
  commission: number; // porcentagem, ex: 10 = 10%

  @IsString() @MinLength(6)
  password: string;
}
```

#### Exemplo de Resposta — GET /supervisors

```json
[
  {
    "id": "uuid",
    "name": "Carlos Mendes",
    "email": "carlos@supervisor.com",
    "phone": "(11) 98765-4321",
    "commission": 10,
    "totalClients": 12,
    "activeClients": 10,
    "defaulterClients": 1,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
]
```

> **Nota:** `totalClients`, `activeClients` e `defaulterClients` são campos calculados via aggregation no service, não armazenados na tabela.

---

### 5.4 Módulo: `clients`

**Responsabilidade:** Gerenciamento completo de clientes. Admin vê todos; supervisor vê apenas os seus; cliente vê apenas a si mesmo.

#### Endpoints

| Método | Rota | Descrição | Auth? |
|---|---|---|---|
| GET | `/clients` | Lista todos os clientes | Sim (admin) |
| GET | `/clients/my` | Dados do cliente autenticado | Sim (client) |
| GET | `/clients/:id` | Retorna cliente por ID | Sim (admin, supervisor do cliente, próprio cliente) |
| GET | `/clients/by-supervisor/:supervisorId` | Clientes de um supervisor | Sim (admin, supervisor) |
| POST | `/clients` | Cria novo cliente (pelo supervisor ou admin) | Sim (admin, supervisor) |
| PATCH | `/clients/:id/status` | Atualiza status do cliente | Sim (admin) |
| POST | `/clients/:id/increment-services` | Incrementa contador de serviços usados | Sim (admin, interno) |

#### DTOs

**`CreateClientDto`**
```typescript
class CreateClientDto {
  @IsString() @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  cpf: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsString() @MinLength(6)
  password: string;

  @IsUUID()
  planId: string;

  @IsOptional() @IsUUID()
  supervisorId?: string;

  // Endereço
  @IsString() addressStreet: string;
  @IsString() addressNumber: string;
  @IsOptional() @IsString() addressComplement?: string;
  @IsString() addressNeighborhood: string;
  @IsString() addressCity: string;
  @IsString() @Length(2, 2) addressState: string;
  @IsString() addressZipCode: string;

  // Bens
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientAssetDto)
  assets: ClientAssetDto[];
}

class ClientAssetDto {
  @IsString() name: string;
  @IsNumber() @Min(0) estimatedValue: number;
}
```

**`UpdateClientStatusDto`**
```typescript
class UpdateClientStatusDto {
  @IsEnum(ClientStatus)
  status: ClientStatus; // 'active' | 'inactive' | 'defaulter'
}
```

#### Exemplo de Resposta — GET /clients/:id

```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@cliente.com",
  "role": "client",
  "cpf": "123.456.789-00",
  "phone": "(11) 91234-5678",
  "planId": "uuid-intermediate",
  "supervisorId": "uuid-supervisor",
  "status": "active",
  "totalAssetsValue": 9500,
  "servicesUsedThisMonth": 1,
  "joinedAt": "2024-03-01T00:00:00.000Z",
  "lastPaymentAt": "2025-04-01T00:00:00.000Z",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001-000"
  },
  "assets": [
    { "name": "Geladeira", "estimatedValue": 2500 },
    { "name": "Televisão", "estimatedValue": 3000 },
    { "name": "Ar Condicionado", "estimatedValue": 4000 }
  ],
  "createdAt": "2024-03-01T00:00:00.000Z"
}
```

---

### 5.5 Módulo: `requests`

**Responsabilidade:** Abertura e gerenciamento de chamados de serviço (reparos) e cobertura (sinistros).

#### Endpoints

| Método | Rota | Descrição | Auth? |
|---|---|---|---|
| GET | `/requests` | Lista todos os chamados | Sim (admin) |
| GET | `/requests/my` | Chamados do cliente autenticado | Sim (client) |
| GET | `/requests/:id` | Detalhes de um chamado | Sim (admin, cliente dono) |
| POST | `/requests` | Cria novo chamado (serviço ou cobertura) | Sim (client) |
| PATCH | `/requests/:id` | Atualiza status, notas e valor aprovado | Sim (admin) |

#### DTOs

**`CreateServiceRequestDto`**
```typescript
class CreateServiceRequestDto {
  @IsEnum(RequestType)
  type: 'service';

  @IsEnum(ServiceType)
  serviceType: ServiceType;
  // plumber | electrician | mason | locksmith | painter | carpenter | cleaner | other

  @IsString() @MinLength(10)
  description: string;

  @IsDateString()
  desiredDate: string; // ISO date, não pode ser data passada
}
```

**`CreateCoverageRequestDto`**
```typescript
class CreateCoverageRequestDto {
  @IsEnum(RequestType)
  type: 'coverage';

  @IsEnum(CoverageType)
  coverageType: CoverageType;
  // theft | flood | structural_damage | fire | other

  @IsString() @MinLength(10)
  description: string;

  @IsNumber() @Min(1)
  estimatedLoss: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  evidenceUrls?: string[]; // URLs de upload (funcionalidade futura)
}
```

**`UpdateRequestDto`** (usado pelo admin)
```typescript
class UpdateRequestDto {
  @IsOptional() @IsEnum(RequestStatus)
  status?: RequestStatus;
  // Serviço:   pending | in_progress | completed
  // Cobertura: analyzing | approved | denied

  @IsOptional() @IsString()
  adminNotes?: string;

  @IsOptional() @IsNumber() @Min(0)
  approvedAmount?: number; // Apenas para coberturas com status approved
}
```

#### Exemplo de Resposta — chamado de serviço

```json
{
  "id": "uuid",
  "clientId": "uuid-client",
  "clientName": "João Silva",
  "type": "service",
  "serviceType": "plumber",
  "description": "Vazamento embaixo da pia da cozinha.",
  "desiredDate": "2025-04-20",
  "status": "pending",
  "adminNotes": null,
  "createdAt": "2025-04-15T10:00:00.000Z",
  "updatedAt": "2025-04-15T10:00:00.000Z"
}
```

#### Exemplo de Resposta — chamado de cobertura

```json
{
  "id": "uuid",
  "clientId": "uuid-client",
  "clientName": "Maria Oliveira",
  "type": "coverage",
  "coverageType": "theft",
  "description": "Furto de notebook e celular durante viagem.",
  "estimatedLoss": 8000,
  "approvedAmount": 7500,
  "evidenceUrls": [],
  "status": "approved",
  "adminNotes": "Documentação verificada. Aprovado parcialmente.",
  "createdAt": "2025-04-10T14:30:00.000Z",
  "updatedAt": "2025-04-12T09:00:00.000Z"
}
```

---

### 5.6 Módulo: `dashboard`

**Responsabilidade:** Métricas e dados agregados para os dashboards de cada papel.

#### Endpoints

| Método | Rota | Descrição | Auth? |
|---|---|---|---|
| GET | `/dashboard/admin` | Métricas completas do sistema | Sim (admin) |
| GET | `/dashboard/supervisor` | Métricas do supervisor autenticado | Sim (supervisor) |
| GET | `/dashboard/client` | Dados do cliente autenticado para dashboard | Sim (client) |

#### Exemplo de Resposta — GET /dashboard/admin

```json
{
  "totalClients": 45,
  "activeClients": 38,
  "defaulterClients": 5,
  "inactiveClients": 2,
  "totalSupervisors": 3,
  "openRequests": 7,
  "pendingCoverage": 2,
  "monthlyRevenue": 4250.50,
  "clientsByPlan": {
    "basic": 12,
    "intermediate": 20,
    "premium": 13
  },
  "topSupervisors": [
    {
      "id": "uuid",
      "name": "Carlos Mendes",
      "clients": 18,
      "activeClients": 16
    }
  ],
  "recentRequests": [
    {
      "id": "uuid",
      "clientName": "João Silva",
      "type": "service",
      "description": "Vazamento...",
      "status": "pending",
      "createdAt": "2025-04-15T10:00:00.000Z"
    }
  ]
}
```

#### Exemplo de Resposta — GET /dashboard/supervisor

```json
{
  "totalClients": 18,
  "activeClients": 15,
  "defaulterClients": 2,
  "inactiveClients": 1,
  "estimatedMonthlyCommission": 425.05,
  "commissionPercentage": 10,
  "recentClients": [
    {
      "id": "uuid",
      "name": "João Silva",
      "planId": "uuid-intermediate",
      "planName": "Plano Intermediário",
      "status": "active",
      "joinedAt": "2024-03-01"
    }
  ]
}
```

#### Exemplo de Resposta — GET /dashboard/client

```json
{
  "client": {
    "id": "uuid",
    "name": "João Silva",
    "status": "active",
    "servicesUsedThisMonth": 1
  },
  "plan": {
    "id": "uuid",
    "name": "Plano Intermediário",
    "type": "intermediate",
    "price": 99.90,
    "servicesPerMonth": 2,
    "coverageLimit": 40000,
    "features": ["..."]
  },
  "servicesLeft": 1,
  "coverageUsed": 0,
  "coverageRemaining": 40000,
  "supervisor": {
    "name": "Carlos Mendes",
    "phone": "(11) 98765-4321",
    "email": "carlos@supervisor.com"
  },
  "recentRequests": []
}
```

---

## 6. Rotas Completas da API

| Método | Rota | Descrição | Auth? | Role | Módulo |
|---|---|---|---|---|---|
| POST | `/auth/login` | Login com e-mail e senha | Não | — | auth |
| POST | `/auth/register` | Registro de cliente (self-service) | Não | — | auth |
| POST | `/auth/forgot-password` | Envia e-mail de recuperação | Não | — | auth |
| POST | `/auth/reset-password` | Redefine senha via token | Não | — | auth |
| POST | `/auth/refresh` | Gera novo access token | Não | — | auth |
| POST | `/auth/logout` | Invalida refresh token | Sim | any | auth |
| GET | `/auth/me` | Dados do usuário autenticado | Sim | any | auth |
| GET | `/plans` | Lista todos os planos | Não | — | plans |
| GET | `/plans/:id` | Detalhe de um plano | Não | — | plans |
| PATCH | `/plans/:id` | Edita plano | Sim | admin | plans |
| GET | `/supervisors` | Lista supervisores | Sim | admin | supervisors |
| GET | `/supervisors/:id` | Detalhe do supervisor | Sim | admin, supervisor | supervisors |
| POST | `/supervisors` | Cria supervisor | Sim | admin | supervisors |
| GET | `/clients` | Lista todos os clientes | Sim | admin | clients |
| GET | `/clients/my` | Dados do cliente autenticado | Sim | client | clients |
| GET | `/clients/:id` | Detalhe do cliente | Sim | admin, supervisor, client | clients |
| GET | `/clients/by-supervisor/:supervisorId` | Clientes por supervisor | Sim | admin, supervisor | clients |
| POST | `/clients` | Cria cliente | Sim | admin, supervisor | clients |
| PATCH | `/clients/:id/status` | Atualiza status do cliente | Sim | admin | clients |
| POST | `/clients/:id/increment-services` | Incrementa serviços usados | Sim | admin (interno) | clients |
| GET | `/requests` | Lista todos os chamados | Sim | admin | requests |
| GET | `/requests/my` | Chamados do cliente autenticado | Sim | client | requests |
| GET | `/requests/:id` | Detalhe do chamado | Sim | admin, client | requests |
| POST | `/requests` | Cria chamado | Sim | client | requests |
| PATCH | `/requests/:id` | Atualiza chamado | Sim | admin | requests |
| GET | `/dashboard/admin` | Métricas admin | Sim | admin | dashboard |
| GET | `/dashboard/supervisor` | Métricas supervisor | Sim | supervisor | dashboard |
| GET | `/dashboard/client` | Dados dashboard cliente | Sim | client | dashboard |

---

## 7. Autenticação & Autorização

### Fluxo de Autenticação

#### Login
```
1. POST /auth/login { email, password }
2. Verifica credenciais no banco (bcrypt.compare)
3. Busca role do usuário (campo role na tabela users)
4. Gera accessToken (JWT, expira em 15 min) e refreshToken (UUID, expira em 7 dias)
5. Salva refreshToken na tabela refresh_tokens
6. Retorna { accessToken, refreshToken, user }
```

#### Registro (Self-service — cliente)
```
1. POST /auth/register { dados completos em 4 etapas }
2. Verifica unicidade de email e CPF
3. Gera hash da senha com bcrypt (rounds: 12)
4. Cria registros em transação: users, user_profiles, clients, client_assets
5. Retorna { accessToken, refreshToken, user }
```

#### Registro (por Admin/Supervisor)
```
1. POST /clients ou POST /supervisors (com Bearer token)
2. Guard verifica role (admin ou supervisor)
3. Cria usuário + perfil específico em transação Prisma
4. Retorna dados do criado (sem tokens)
```

#### Refresh Token
```
1. POST /auth/refresh { refreshToken }
2. Verifica token na tabela refresh_tokens (não expirado)
3. Busca usuário associado
4. Gera novo accessToken
5. Rotaciona o refreshToken (recomendado por segurança)
6. Retorna { accessToken, refreshToken }
```

#### Recuperação de Senha
```
1. POST /auth/forgot-password { email }
2. Gera token JWT de curta duração (15 min) com payload { sub: userId, type: 'password-reset' }
3. Envia e-mail com link: https://app.suaprotecao.com/reset-password?token=<JWT>
4. POST /auth/reset-password { token, password }
5. Valida e decodifica token JWT
6. Atualiza senha com bcrypt
7. Invalida todos os refresh tokens do usuário
```

#### Logout
```
1. POST /auth/logout (Bearer token no header)
2. Extrai userId do JWT
3. Deleta todos os refresh tokens do usuário da tabela refresh_tokens
4. Retorna 200 OK
```

### Estratégia JWT

```typescript
// Payload do JWT (accessToken)
interface JwtPayload {
  sub: string;    // userId (UUID)
  email: string;
  role: UserRole; // 'admin' | 'supervisor' | 'client'
  iat: number;
  exp: number;
}
```

### Guards e Decorators

```typescript
// Qualquer usuário autenticado:
@UseGuards(JwtAuthGuard)
@Get('me')
getMe(@CurrentUser() user: JwtPayload) {}

// Apenas admin:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get()
findAll() {}

// Admin ou supervisor:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'supervisor')
@Post()
create() {}
```

### Matriz de Permissões

| Recurso | Admin | Supervisor | Cliente |
|---|---|---|---|
| GET /plans | ✅ | ✅ | ✅ |
| PATCH /plans/:id | ✅ | ❌ | ❌ |
| GET /supervisors | ✅ (todos) | ✅ (próprio) | ❌ |
| POST /supervisors | ✅ | ❌ | ❌ |
| GET /clients | ✅ (todos) | ✅ (próprios) | ❌ |
| POST /clients | ✅ | ✅ | ❌ |
| PATCH /clients/:id/status | ✅ | ❌ | ❌ |
| GET /requests | ✅ (todos) | ❌ | ✅ (próprios) |
| POST /requests | ❌ | ❌ | ✅ |
| PATCH /requests/:id | ✅ | ❌ | ❌ |
| GET /dashboard/admin | ✅ | ❌ | ❌ |
| GET /dashboard/supervisor | ❌ | ✅ | ❌ |
| GET /dashboard/client | ❌ | ❌ | ✅ |

---

## 8. Regras de Negócio por Módulo

### 8.1 Auth

- Senha deve ter no mínimo **6 caracteres**
- E-mail deve ser único no sistema
- CPF deve ser único no sistema
- Na redefinição de senha, o token de recuperação expira em **15 minutos**
- Após redefinir senha, todos os refresh tokens do usuário devem ser invalidados
- O campo `role` determina o redirecionamento pós-login: `admin → /admin`, `supervisor → /supervisor`, `client → /client`
- Usuários criados via admin (POST /supervisors, POST /clients) têm e-mail **já confirmado** (sem fluxo de verificação de e-mail)

### 8.2 Plans

- Existem exatamente **3 planos** com tipos fixos: `basic`, `intermediate`, `premium`
- O campo `servicesPerMonth = -1` indica **serviços ilimitados** (Plano Premium)
- Planos não podem ser excluídos (clientes os referenciam com FK)
- Alterações em planos **não retroagem** para clientes existentes (declarado explicitamente no frontend)
- O campo `popular` deve ser `true` para apenas um plano (Intermediário por padrão)

### 8.3 Supervisors

- Supervisor tem `commission` em **porcentagem** (ex: `10` = 10%)
- Comissão mensal estimada = `sum(plan.price * commission/100)` sobre **clientes ativos** do supervisor
- Ao criar supervisor, o sistema cria também o registro de usuário (email, senha hash)
- Supervisores **não podem** alterar status de clientes — somente admin
- Supervisor enxerga **apenas** os clientes onde `client.supervisorId === supervisor.id`

### 8.4 Clients

- Um cliente **inadimplente** (`defaulter`) **não pode** abrir novos chamados — validar na API no endpoint `POST /requests`
- Um cliente pode ter `supervisorId = null` quando se cadastra pelo formulário público (self-service)
- O campo `servicesUsedThisMonth` deve ser incrementado a cada chamado de **serviço** aceito
- **Verificação de limite de serviços** ao criar chamado de serviço:
  - Se `plan.servicesPerMonth === -1`: ilimitado, sempre permitido
  - Caso contrário: `client.servicesUsedThisMonth < plan.servicesPerMonth` deve ser verdadeiro
- `totalAssetsValue` = soma dos `estimatedValue` de todos os `ClientAsset` do cliente
- O valor total dos bens pode exceder o `coverageLimit` do plano (exibe aviso, não bloqueia)
- O campo `lastPaymentAt` não é gerenciado diretamente pelo sistema atual (candidato a webhook de pagamento futuro)

### 8.5 Requests

- **Chamados de Serviço** são criados com `status = pending`
- **Chamados de Cobertura** são criados com `status = analyzing`
- Transições de status válidas (validar no service):
  - Serviço: `pending → in_progress → completed`
  - Cobertura: `analyzing → approved | denied`
- O campo `approvedAmount` só é preenchido quando cobertura é `approved`; pode ser menor que `estimatedLoss`
- O campo `adminNotes` é livre e opcional em qualquer atualização
- O campo `evidenceUrls` armazena URLs de arquivos — upload não implementado no frontend atual (marcado como "em breve")
- O campo `clientName` é **desnormalizado** na tabela requests para evitar JOINs em queries de listagem
- Ao criar chamado de serviço, a API deve chamar internamente `increment-services` do cliente (no RequestsService, não exposto ao cliente como endpoint separado)
- Um cliente **não pode** criar chamado com `desiredDate` no passado (chamados de serviço)
- O valor de `estimatedLoss` pode exceder o `coverageLimit` — a análise determina o valor aprovado; **não bloquear** na criação

### 8.6 Dashboard

- **Receita mensal** = `sum(plan.price)` de todos os clientes com `status = active`
- **Chamados abertos** = chamados com `status IN (pending, in_progress, analyzing)`
- **Coberturas pendentes** = chamados com `type = coverage AND status = analyzing`
- **Cobertura utilizada pelo cliente** = `sum(approvedAmount)` de chamados `type = coverage AND status = approved` do cliente
- Ranking de supervisores é ordenado por `activeClients DESC`
- Comissão do supervisor é calculada dinamicamente (não armazenada)
- `recentRequests` no dashboard admin retorna os **5 chamados mais recentes** (ordenados por `createdAt DESC`)
- `recentClients` no dashboard supervisor retorna os **5 clientes mais recentes** (ordenados por `joinedAt DESC`)

---

## 9. Variáveis de Ambiente

```env
# .env.example

# ─── BANCO DE DADOS (Neon PostgreSQL) ─────────────────────────────────────────
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/suaprotecao?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/suaprotecao?sslmode=require"

# ─── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET="seu_segredo_super_secreto_de_no_minimo_32_caracteres"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="outro_segredo_diferente_para_refresh_tokens"
JWT_REFRESH_EXPIRES_IN="7d"

# ─── SERVIDOR ─────────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV="development"

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGIN="http://localhost:5173"

# ─── E-MAIL (recuperação de senha) ────────────────────────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@suaprotecao.com"
SMTP_PASS="app_password_aqui"
SMTP_FROM="Sua Proteção <noreply@suaprotecao.com>"

# ─── APP ──────────────────────────────────────────────────────────────────────
APP_URL="http://localhost:5173"

# ─── BCRYPT ───────────────────────────────────────────────────────────────────
BCRYPT_ROUNDS=12

# ─── UPLOAD (futuro — evidências de cobertura) ────────────────────────────────
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AWS_S3_BUCKET=
```

---

## 10. Guia de Setup Inicial

### Passo 1 — Criar projeto NestJS

```bash
npm install -g @nestjs/cli
nest new sua-protecao-api
cd sua-protecao-api
```

### Passo 2 — Instalar dependências

```bash
# Core
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install class-validator class-transformer
npm install @prisma/client

# Swagger
npm install @nestjs/swagger swagger-ui-express

# E-mail
npm install nodemailer @nestjs-modules/mailer

# Config
npm install @nestjs/config

# Utilitários
npm install uuid

# Dev
npm install -D prisma
npm install -D @types/bcrypt @types/passport-jwt @types/nodemailer @types/uuid
```

### Passo 3 — Configurar Prisma com Neon

```bash
npx prisma init
```

Edite `prisma/schema.prisma` com o schema completo da Seção 4 e configure `DATABASE_URL` no `.env`.

### Passo 4 — Rodar migrations

```bash
# Criar e aplicar migration inicial
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate
```

### Passo 5 — Seed dos planos e usuário admin inicial

Crie `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed dos planos
  await prisma.plan.createMany({
    data: [
      {
        type: 'basic',
        name: 'Plano Básico',
        price: 49.99,
        servicesPerMonth: 1,
        coverageLimit: 20000,
        features: [
          '1 serviço por mês',
          'Cobertura até R$ 20.000',
          'Suporte via WhatsApp',
          'Encanamento e Elétrica',
          'Atendimento em até 48h',
        ],
        color: 'slate',
        popular: false,
      },
      {
        type: 'intermediate',
        name: 'Plano Intermediário',
        price: 99.90,
        servicesPerMonth: 2,
        coverageLimit: 40000,
        features: [
          '2 serviços por mês',
          'Cobertura até R$ 40.000',
          'Suporte prioritário',
          'Todos os serviços disponíveis',
          'Atendimento em até 24h',
          'Relatório de visitas',
        ],
        color: 'brand',
        popular: true,
      },
      {
        type: 'premium',
        name: 'Plano Premium',
        price: 169.90,
        servicesPerMonth: -1,
        coverageLimit: 80000,
        features: [
          'Serviços ilimitados',
          'Cobertura até R$ 80.000',
          'Suporte 24/7 prioritário',
          'Todos os serviços + reformas',
          'Atendimento emergencial',
          'Gestor de conta dedicado',
          'Relatórios mensais',
        ],
        color: 'navy',
        popular: false,
      },
    ],
    skipDuplicates: true,
  });

  // Criar usuário admin inicial
  const hash = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@suaprotecao.com' },
    update: {},
    create: {
      email: 'admin@suaprotecao.com',
      passwordHash: hash,
      role: 'admin',
      profile: {
        create: { username: 'Admin Master' },
      },
    },
  });

  console.log('✅ Seed concluído!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Adicione ao `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

```bash
npx prisma db seed
```

### Passo 6 — Configurar `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.CORS_ORIGIN });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Sua Proteção API')
    .setDescription('API do sistema Sua Proteção | Reparo Certo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`API: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Docs: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
```

### Passo 7 — Iniciar o servidor

```bash
# Desenvolvimento (hot reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

---

## 11. Dependências Recomendadas

### `dependencies`

```json
{
  "@nestjs/common": "^10.4.0",
  "@nestjs/config": "^3.3.0",
  "@nestjs/core": "^10.4.0",
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.3",
  "@nestjs/platform-express": "^10.4.0",
  "@nestjs/swagger": "^7.4.0",
  "@nestjs-modules/mailer": "^2.0.2",
  "@prisma/client": "^5.22.0",
  "bcrypt": "^5.1.1",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.1",
  "nodemailer": "^6.9.16",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "reflect-metadata": "^0.2.2",
  "rxjs": "^7.8.1",
  "swagger-ui-express": "^5.0.1",
  "uuid": "^10.0.0"
}
```

### `devDependencies`

```json
{
  "@nestjs/cli": "^10.4.0",
  "@nestjs/schematics": "^10.2.0",
  "@nestjs/testing": "^10.4.0",
  "@types/bcrypt": "^5.0.2",
  "@types/express": "^5.0.0",
  "@types/jest": "^29.5.14",
  "@types/nodemailer": "^6.4.17",
  "@types/passport-jwt": "^4.0.1",
  "@types/supertest": "^6.0.2",
  "@types/uuid": "^10.0.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "eslint": "^9.0.0",
  "jest": "^29.7.0",
  "prettier": "^3.4.0",
  "prisma": "^5.22.0",
  "supertest": "^7.0.0",
  "ts-jest": "^29.2.5",
  "ts-node": "^10.9.2",
  "typescript": "^5.7.0"
}
```

---

## 12. Considerações de Migração (Supabase → Neon)

### Substituição das funcionalidades do Supabase

#### Autenticação (`supabase.auth.*`)

| Supabase | Nova API |
|---|---|
| `signInWithPassword(email, password)` | `POST /auth/login` com bcrypt + JWT |
| `signUp(email, password)` | `POST /auth/register` ou criação pelo admin/supervisor |
| `signOut()` | `POST /auth/logout` — invalida refresh token |
| `resetPasswordForEmail(email)` | `POST /auth/forgot-password` — envia JWT por e-mail |
| `updateUser({ password })` | `POST /auth/reset-password` — valida token JWT e atualiza hash |
| `getSession()` | No frontend: verificar validade do JWT armazenado |
| `onAuthStateChange()` | No frontend: interceptor de axios detecta 401 e chama refresh |
| `auth.admin.createUser()` (Edge Function) | `POST /clients` e `POST /supervisors` com role guard |

#### Tabelas do Supabase → Models Prisma

| Tabela Supabase | Model Prisma | Observações |
|---|---|---|
| `auth.users` (gerenciada internamente) | `User` | Agora gerenciada pela aplicação |
| `user_profiles` | `UserProfile` | Mantida como 1:1 com User |
| `user_roles` | Campo `role` em `User` | Simplificado — role direto no model User |
| `supervisors` | `Supervisor` | Mantida |
| `clients` | `Client` | Mantida (endereço desnormalizado) |
| `client_assets` | `ClientAsset` | Mantida |
| `plans` | `Plan` | Mantida |
| `requests` | `Request` | Mantida (tipo discriminado em modelo único) |

#### Row Level Security (RLS) → Guards NestJS

O Supabase usava RLS com `auth.uid()` para isolar dados. Na nova API:

- `JwtAuthGuard` verifica autenticidade do token
- `RolesGuard` + `@Roles()` controla acesso por papel
- **Lógica nos Services**: supervisor verifica `client.supervisorId === userId`; cliente verifica `request.clientId === userId`

#### Realtime

O frontend **não utiliza** subscriptions realtime — usa `useEffect` + refetch manual. **Nenhuma implementação de WebSocket/SSE é necessária** neste momento.

#### Storage (Supabase Storage)

Upload de evidências marcado como **"em breve"** no frontend. Quando implementado:
- Usar AWS S3 ou Cloudflare R2
- Endpoint: `POST /requests/:id/evidence` → retorna URL pública assinada

#### Edge Function `admin-actions` → Endpoints REST

| Ação (Edge Function) | Substituição |
|---|---|
| `action: "create_user", role: "supervisor"` | `POST /supervisors` |
| `action: "create_user", role: "client"` | `POST /clients` |
| `action: "create_user", role: "admin"` | Seed manual / endpoint admin futuro |

### Checklist de Migração

- [ ] Exportar dados do Supabase (tabelas: `plans`, `clients`, `client_assets`, `supervisors`, `requests`)
- [ ] Criar banco no Neon e executar `npx prisma migrate dev`
- [ ] Importar dados via script de migração (mapear colunas snake_case)
- [ ] **Senhas**: o Supabase gerencia hashes internamente — será necessário **resetar todas as senhas** ou implementar fluxo de "primeiro acesso"
- [ ] Atualizar frontend: substituir chamadas `supabase.*` por `fetch/axios` apontando para a nova API
- [ ] Substituir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` por `VITE_API_URL` no frontend
- [ ] Implementar armazenamento do JWT no frontend (preferencialmente `httpOnly` cookie ou `localStorage` + renovação automática)
- [ ] Implementar interceptor de axios/fetch para renovação automática do access token via refresh token

---

## Apêndice — Tipos de Referência Completos

### Enums

```typescript
type UserRole     = 'admin' | 'supervisor' | 'client';
type PlanType     = 'basic' | 'intermediate' | 'premium';
type ClientStatus = 'active' | 'inactive' | 'defaulter';
type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'analyzing' | 'approved' | 'denied';
type RequestType  = 'service' | 'coverage';
type ServiceType  = 'plumber' | 'electrician' | 'mason' | 'locksmith' | 'painter' | 'carpenter' | 'cleaner' | 'other';
type CoverageType = 'theft' | 'flood' | 'structural_damage' | 'fire' | 'other';
```

### Labels dos Enums (para o frontend)

| ServiceType | Label PT-BR |
|---|---|
| `plumber` | Encanador |
| `electrician` | Eletricista |
| `mason` | Pedreiro |
| `locksmith` | Chaveiro |
| `painter` | Pintor |
| `carpenter` | Carpinteiro |
| `cleaner` | Diarista |
| `other` | Outro |

| CoverageType | Label PT-BR |
|---|---|
| `theft` | Roubo / Furto |
| `flood` | Enchente / Alagamento |
| `structural_damage` | Dano Estrutural |
| `fire` | Incêndio |
| `other` | Outro Sinistro |

### Lista predefinida de Bens (sugerida no cadastro)

```
Geladeira, Fogão / Forno, Micro-ondas, Máquina de Lavar, Secadora,
Televisão, Ar Condicionado, Computador / Notebook, Sofá / Estofado,
Mesa / Cadeiras, Guarda-roupa, Cama / Colchão, Liquidificador,
Batedeira, Aspirador, Ventilador, Jogo de Louças, Impressora, Videogame
```

---

> **README gerado por engenharia reversa completa do frontend** em 21/04/2026.
> Este documento é suficiente para construir a API completa sem necessidade de consultar o frontend.

Changes made via OnSpace will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in OnSpace.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [OnSpace]() and click on Share -> Publish.
