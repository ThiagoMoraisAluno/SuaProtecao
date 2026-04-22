# 🏠 Sua Proteção | Reparo Certo

> Plataforma SaaS de **assinatura de proteção residencial** — serviços domésticos sob demanda + cobertura financeira para sinistros, tudo em uma mensalidade.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Planos](#-planos)
- [Perfis de Usuário](#-perfis-de-usuário)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [API — Endpoints](#-api--endpoints)
- [Banco de Dados](#-banco-de-dados)
- [Roadmap](#-roadmap)

---

## 🎯 Sobre o Projeto

O **Sua Proteção | Reparo Certo** resolve dois problemas comuns para proprietários de imóveis:

1. **A dificuldade de encontrar prestadores de serviço confiáveis** — encanadores, eletricistas, pedreiros, chaveiros, pintores, carpinteiros e diaristas, todos acessíveis com um chamado.
2. **A vulnerabilidade financeira diante de imprevistos domésticos** — cobertura para roubo/furto, enchente, dano estrutural e incêndio incluída na assinatura.

O sistema é **multi-tenant** com três perfis de acesso (Admin, Supervisor e Cliente) e uma cadeia de responsabilidade onde supervisores gerenciam suas próprias carteiras de clientes.

---

## ✨ Funcionalidades

### Para o Cliente
- Visualizar plano contratado, cobertura e serviços disponíveis no mês
- Abrir chamados de **serviço** (encanador, eletricista, etc.)
- Abrir chamados de **cobertura** (sinistros)
- Acompanhar histórico e status dos chamados
- Gerenciar bens cadastrados no imóvel

### Para o Supervisor
- Cadastrar novos clientes vinculados à sua carteira
- Acompanhar status de todos os clientes da carteira
- Visualizar comissão estimada do mês
- Monitorar chamados abertos pelos seus clientes

### Para o Admin
- Gestão completa de supervisores e clientes
- Atualizar planos e valores
- Alterar status de clientes (ativo, inativo, inadimplente)
- Atribuir prestadores e atualizar status de qualquer chamado
- Dashboard com métricas gerais da plataforma

---

## 💳 Planos

| Plano | Preço/mês | Serviços/mês | Cobertura máxima |
|---|---|---|---|
| 🥉 **Básico** | R$ 49,99 | 1 | R$ 20.000 |
| 🥈 **Intermediário** | R$ 99,90 | 2 | R$ 40.000 |
| 🥇 **Premium** | R$ 169,90 | Ilimitado | R$ 80.000 |

---

## 👥 Perfis de Usuário

| Perfil | Descrição |
|---|---|
| **Admin** | Gestor master. Acesso irrestrito a todo o sistema. |
| **Supervisor** | Consultor de vendas. Gerencia sua carteira de clientes. |
| **Cliente** | Assinante final. Abre chamados e acompanha seu plano. |

---

## 📁 Estrutura do Repositório

Este repositório é organizado como um **monorepo**:

```
SuaProtecao/
│
├── UI/                          # Frontend — React + TypeScript
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis (shadcn/ui)
│   │   ├── pages/               # Telas da aplicação
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilitários e configurações
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
└── Service/                     # Backend — NestJS + Prisma
    └── sua-protecao-api/
        ├── src/
        │   ├── common/          # Guards, decorators, filtros globais
        │   └── modules/
        │       ├── auth/        # Autenticação JWT
        │       ├── users/       # Perfil do usuário
        │       ├── supervisors/ # Gestão de supervisores
        │       ├── clients/     # Gestão de clientes
        │       ├── plans/       # Planos de assinatura
        │       ├── requests/    # Chamados de serviço e cobertura
        │       └── dashboard/   # Métricas por perfil
        ├── prisma/
        │   ├── schema.prisma    # Schema completo do banco
        │   ├── migrations/
        │   └── seed.ts          # Seed inicial (planos + admin)
        ├── .env.example
        └── package.json
```

---

## 🛠️ Stack Tecnológica

### Frontend (`UI/`)

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | Framework UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 5 | Bundler |
| shadcn/ui | latest | Componentes de UI |
| Tailwind CSS | 3 | Estilização |
| React Router | 6 | Roteamento |
| React Query | 5 | Gerenciamento de estado servidor |
| React Hook Form | 7 | Formulários |
| Zod | 3 | Validação de schemas |
| Axios | 1 | Cliente HTTP |
| Recharts | 2 | Gráficos e dashboards |

### Backend (`Service/`)

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20+ | Runtime |
| NestJS | 10 | Framework |
| TypeScript | 5 | Tipagem estática |
| Prisma | 5 | ORM |
| Neon | — | PostgreSQL serverless |
| JWT | — | Autenticação (access + refresh token) |
| bcrypt | 5 | Hash de senhas |
| class-validator | 0.14 | Validação de DTOs |
| Swagger | 7 | Documentação da API |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│  Admin UI  │  Supervisor UI  │  Cliente UI           │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (JWT Bearer)
                      ▼
┌─────────────────────────────────────────────────────┐
│               API REST (NestJS)                      │
│                                                      │
│  /auth  /users  /supervisors  /clients               │
│  /plans  /requests  /dashboard                       │
│                                                      │
│  JwtAuthGuard ──► RolesGuard ──► Controller          │
│                                     │                │
│                                  Service             │
│                                     │                │
│                               PrismaService          │
└─────────────────────────────────────┬───────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────┐
│          Neon — PostgreSQL Serverless                │
│                                                      │
│  User · Supervisor · Client · Plan · Request         │
│  ClientAsset · RefreshToken · UserProfile            │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no [Neon](https://neon.tech) (banco de dados)

### 1. Clone o repositório

```bash
git clone https://github.com/ThiagoMoraisAluno/SuaProtecao.git
cd SuaProtecao
```

### 2. Configurar e iniciar o Backend

```bash
cd Service/sua-protecao-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Neon e JWT secrets

# Rodar migrations
npx prisma migrate dev

# Popular banco com dados iniciais (planos + admin)
npx prisma db seed

# Iniciar em desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3000`
Documentação Swagger em `http://localhost:3000/api/docs`

### 3. Configurar e iniciar o Frontend

```bash
cd UI

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da sua API

# Iniciar em desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:8080`

---

## 🔐 Variáveis de Ambiente

### Backend (`Service/sua-protecao-api/.env`)

```env
# Banco de dados Neon
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

# JWT
JWT_SECRET=seu-segredo-aqui
JWT_REFRESH_SECRET=seu-segredo-refresh-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Servidor
PORT=3000

# Admin padrão (seed)
ADMIN_EMAIL=admin@suaprotecao.com.br
ADMIN_PASSWORD=senha-forte-aqui
```

### Frontend (`UI/.env`)

```env
# URL da API
VITE_API_URL=http://localhost:3000
```

---

## 📡 API — Endpoints

### Autenticação
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login com email e senha | ❌ |
| POST | `/auth/refresh` | Renovar access token | ❌ |
| POST | `/auth/logout` | Invalidar refresh token | ✅ |
| POST | `/auth/forgot-password` | Enviar email de recuperação | ❌ |
| POST | `/auth/reset-password` | Redefinir senha | ❌ |

### Usuários
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/users/me` | Perfil do usuário autenticado | ✅ |
| PATCH | `/users/me` | Atualizar perfil | ✅ |

### Supervisores
| Método | Rota | Descrição | Roles |
|---|---|---|---|
| POST | `/supervisors` | Criar supervisor | Admin |
| GET | `/supervisors` | Listar todos | Admin |
| GET | `/supervisors/:id` | Detalhe | Admin, Supervisor |
| GET | `/supervisors/:id/clients` | Carteira de clientes | Admin, Supervisor |
| GET | `/supervisors/:id/commission` | Comissão estimada | Admin, Supervisor |

### Clientes
| Método | Rota | Descrição | Roles |
|---|---|---|---|
| POST | `/clients` | Criar cliente | Admin, Supervisor |
| GET | `/clients` | Listar clientes | Admin, Supervisor |
| GET | `/clients/:id` | Detalhe do cliente | Admin, Supervisor, Cliente |
| PATCH | `/clients/:id/status` | Alterar status | Admin |
| POST | `/clients/:id/assets` | Adicionar bem | Admin, Supervisor |
| DELETE | `/clients/:id/assets/:assetId` | Remover bem | Admin, Supervisor |
| PATCH | `/clients/:id/plan` | Alterar plano | Admin, Supervisor |

### Chamados
| Método | Rota | Descrição | Roles |
|---|---|---|---|
| POST | `/requests/service` | Abrir chamado de serviço | Cliente |
| POST | `/requests/coverage` | Abrir chamado de cobertura | Cliente |
| GET | `/requests` | Listar chamados | Todos |
| GET | `/requests/:id` | Detalhe do chamado | Todos |
| PATCH | `/requests/:id/status` | Atualizar status | Admin |
| PATCH | `/requests/:id/assign` | Atribuir prestador | Admin |

### Dashboard
| Método | Rota | Descrição | Roles |
|---|---|---|---|
| GET | `/dashboard/admin` | Métricas gerais | Admin |
| GET | `/dashboard/supervisor` | Métricas da carteira | Supervisor |
| GET | `/dashboard/client` | Resumo do plano | Cliente |

---

## 🗄️ Banco de Dados

### Diagrama de Entidades

```
User
 ├── UserProfile (1:1)
 ├── RefreshToken (1:N)
 ├── Supervisor (1:1)
 │     └── Client (1:N)
 └── Client (1:1)
       ├── Plan (N:1)
       ├── ClientAsset (1:N)
       └── Request (1:N)
```

### Enums principais

```
UserRole:      admin | supervisor | client
PlanType:      basic | intermediate | premium
ClientStatus:  active | inactive | defaulter
RequestType:   service | coverage
RequestStatus: pending | in_progress | completed | analyzing | approved | denied
ServiceType:   plumber | electrician | mason | locksmith | painter | carpenter | cleaner | other
CoverageType:  theft | flood | structural_damage | fire | other
```

---

## 🗺️ Roadmap

- [x] Estrutura do projeto (monorepo)
- [x] Schema Prisma completo
- [x] Módulo de autenticação JWT
- [x] CRUD de supervisores e clientes
- [x] Sistema de chamados (serviço e cobertura)
- [x] Dashboards por perfil
- [ ] Upload de evidências para chamados (AWS S3 / Cloudflare R2)
- [ ] Notificações por e-mail
- [ ] Integração com gateway de pagamento
- [ ] Testes automatizados (Jest + Supertest)
- [ ] Deploy (frontend + API)

---

## 📄 Licença

Este projeto é privado e de uso restrito.

---

<p align="center">
  Desenvolvido por <strong>Thiago Morais</strong>
</p>
