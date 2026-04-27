# ARCHITECTURE.md — Sua Proteção UI

Decisões arquiteturais relevantes para quem for manter ou evoluir este projeto.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 (strict mode) |
| UI | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Estado remoto | TanStack React Query 5 |
| Formulários | React Hook Form 7 + Zod |
| HTTP Client | Axios (instância singleton com interceptors) |
| Animações | Framer Motion |
| Mapa interativo | react-simple-maps (seção Coverage na landing) |

---

## Estrutura de Camadas

```
src/
├── app/                        # Pages e API routes (Next.js App Router)
│   ├── (public)/               # Rotas públicas (landing, login, register)
│   ├── (private)/              # Rotas privadas (admin, supervisor, client)
│   └── api/auth/               # Proxy routes (login, logout, refresh)
│
├── domain/                     # Domínio — independente de framework
│   ├── entities/index.ts       # Tipos canônicos (User, Client, Plan, Request…)
│   └── repositories/           # Contratos (interfaces I*Repository)
│
├── application/
│   └── usecases/               # Hooks de casos de uso (useAdminDashboard, useRequestsFilter…)
│
├── infrastructure/
│   ├── auth/tokenService.ts    # Única fonte de verdade para tokens
│   ├── http/api.ts             # Cliente Axios singleton
│   ├── http/interceptors/      # authInterceptor, refreshInterceptor, errorInterceptor
│   └── repositories/           # Implementações concretas dos contratos de domínio
│
├── services/                   # Shims de compatibilidade → infrastructure/repositories
├── contexts/AuthContext.tsx    # Estado global de autenticação
├── components/
│   ├── layouts/DashboardLayout.tsx  # Sidebar unificada (admin, supervisor, client)
│   ├── features/               # Componentes de produto (MetricCard, StatusBadge)
│   ├── landing/                # Componentes da landing page
│   └── ui/                     # shadcn/ui + PageSkeleton
├── lib/                        # Shims de compatibilidade + utils
└── types/index.ts              # Shim → domain/entities (backward compat)
```

---

## Modelo de Segurança — Autenticação

### Problema
Cookies acessíveis via JavaScript (`js-cookie`) expõem tokens a ataques XSS.

### Solução Adotada

| Token | Onde fica | Por quê |
|---|---|---|
| `refresh_token` | Cookie **httpOnly** (servidor) | Invisível ao JS → não roubável por XSS |
| `access_token` | `sessionStorage` + variável de módulo | Short-lived; recriado via refresh automático |
| `user` | Cookie regular | Necessário pelo middleware Edge para role-routing |

### Fluxo de Login

```
Browser → POST /api/auth/login (Next.js)
         → POST {API_URL}/auth/login (backend)
         ← { accessToken, refreshToken, user }
Browser ← { accessToken, user }  +  Set-Cookie: refresh_token (httpOnly)
```

### Renovação de Token (401)

```
Browser → qualquer API call → 401
refreshInterceptor → POST /api/auth/refresh (Next.js)
                   → cookie httpOnly lido server-side
                   → POST {API_URL}/auth/refresh
                   ← { accessToken }
refreshInterceptor → retry da request original com novo token
```

### Proteção de Rotas (Middleware Edge)

O `src/middleware.ts` lê o cookie `refresh_token` (httpOnly) para decidir se o usuário está autenticado. Lê o cookie `user` (regular) para redirecionar à role correta se acessar rota de outra role.

---

## Decisões de Dependências

### Zustand — removido
Instalado mas nunca utilizado. O estado global de autenticação é gerenciado pelo `AuthContext` (React Context API), que é suficiente para o escopo atual.

### react-simple-maps — mantido
Usado no componente `Coverage.tsx` da landing page para o mapa interativo do Brasil. O `transpilePackages` no `next.config.ts` é necessário para o funcionamento correto no App Router.

---

## Repositórios e Serviços

Os arquivos em `src/services/*.service.ts` são **shims de compatibilidade** — re-exportam os repositórios reais de `src/infrastructure/repositories/`. Código existente que importa de `@/services` continua funcionando sem mudança.

O `createBaseRepository<T>(basePath)` em `src/infrastructure/repositories/base.repository.ts` elimina o boilerplate de `findAll/findOne` que se repetia em todos os serviços CRUD.

---

## Hooks de Casos de Uso

Lógica de negócio extraída das páginas para `src/application/usecases/`:

| Hook | Responsabilidade |
|---|---|
| `useAdminDashboard` | 4 queries + métricas, ranking, requests recentes |
| `useRequestsFilter` | Query de chamados + filtros de busca/tipo/status |
| `useRequestUpdate` | Mutation de atualização de chamado + estado do modal |
| `useSupervisorDashboard` | 2 queries + stats, comissão, clientes recentes |

Páginas são responsáveis apenas por renderizar o que os hooks retornam.

---

## Formulários

O `register/page.tsx` usa **React Hook Form + Zod** com validação por etapa via `trigger(stepFields[step])`. Os 4 steps compartilham um único `useForm` instance. Erros de validação são exibidos por campo via `formState.errors`.

---

## Variáveis de Ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base do backend NestJS (ex: `http://localhost:3001`) |
