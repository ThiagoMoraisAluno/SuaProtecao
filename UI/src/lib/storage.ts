import type { Client, Supervisor, Request, Plan, User } from "@/types";
import { PLANS } from "@/constants";

const KEYS = {
  CURRENT_USER: "sp_current_user",
  CLIENTS: "sp_clients",
  SUPERVISORS: "sp_supervisors",
  REQUESTS: "sp_requests",
  PLANS: "sp_plans",
  USERS: "sp_users",
};

// --- SEED DATA ---
const SEED_SUPERVISORS: Supervisor[] = [
  {
    id: "sup-1",
    name: "Carlos Mendes",
    email: "carlos@supervisor.com",
    role: "supervisor",
    phone: "(11) 98765-4321",
    commission: 10,
    totalClients: 12,
    activeClients: 10,
    createdAt: "2024-01-15",
  },
  {
    id: "sup-2",
    name: "Ana Souza",
    email: "ana@supervisor.com",
    role: "supervisor",
    phone: "(11) 97654-3210",
    commission: 10,
    totalClients: 8,
    activeClients: 7,
    createdAt: "2024-02-01",
  },
  {
    id: "sup-3",
    name: "Roberto Lima",
    email: "roberto@supervisor.com",
    role: "supervisor",
    phone: "(11) 96543-2109",
    commission: 12,
    totalClients: 15,
    activeClients: 12,
    createdAt: "2024-01-01",
  },
];

const SEED_CLIENTS: Client[] = [
  {
    id: "cli-1",
    name: "João Silva",
    email: "joao@cliente.com",
    role: "client",
    cpf: "123.456.789-00",
    phone: "(11) 91234-5678",
    address: {
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001-000",
    },
    planId: "intermediate",
    supervisorId: "sup-1",
    status: "active",
    assets: [
      { name: "Geladeira", estimatedValue: 2500 },
      { name: "Televisão", estimatedValue: 3000 },
      { name: "Ar Condicionado", estimatedValue: 4000 },
    ],
    totalAssetsValue: 9500,
    servicesUsedThisMonth: 1,
    joinedAt: "2024-03-01",
    lastPaymentAt: "2025-04-01",
    createdAt: "2024-03-01",
  },
  {
    id: "cli-2",
    name: "Maria Oliveira",
    email: "maria@cliente.com",
    role: "client",
    cpf: "987.654.321-00",
    phone: "(11) 92345-6789",
    address: {
      street: "Av. Paulista",
      number: "1000",
      complement: "Cobertura",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
    },
    planId: "premium",
    supervisorId: "sup-1",
    status: "active",
    assets: [
      { name: "Geladeira", estimatedValue: 4000 },
      { name: "Computador / Notebook", estimatedValue: 6000 },
    ],
    totalAssetsValue: 10000,
    servicesUsedThisMonth: 0,
    joinedAt: "2024-02-15",
    lastPaymentAt: "2025-04-01",
    createdAt: "2024-02-15",
  },
  {
    id: "cli-3",
    name: "Pedro Santos",
    email: "pedro@cliente.com",
    role: "client",
    cpf: "456.789.123-00",
    phone: "(11) 93456-7890",
    address: {
      street: "Rua Augusta",
      number: "500",
      neighborhood: "Consolação",
      city: "São Paulo",
      state: "SP",
      zipCode: "01305-000",
    },
    planId: "basic",
    supervisorId: "sup-2",
    status: "defaulter",
    assets: [{ name: "Televisão", estimatedValue: 1500 }],
    totalAssetsValue: 1500,
    servicesUsedThisMonth: 0,
    joinedAt: "2024-04-01",
    createdAt: "2024-04-01",
  },
  {
    id: "cli-4",
    name: "Lucia Ferreira",
    email: "lucia@cliente.com",
    role: "client",
    cpf: "321.654.987-00",
    phone: "(11) 94567-8901",
    address: {
      street: "Rua Oscar Freire",
      number: "200",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zipCode: "01426-001",
    },
    planId: "intermediate",
    supervisorId: "sup-3",
    status: "active",
    assets: [
      { name: "Ar Condicionado", estimatedValue: 5000 },
      { name: "Máquina de Lavar", estimatedValue: 2000 },
    ],
    totalAssetsValue: 7000,
    servicesUsedThisMonth: 0,
    joinedAt: "2024-05-01",
    lastPaymentAt: "2025-04-10",
    createdAt: "2024-05-01",
  },
  {
    id: "cli-5",
    name: "Fernando Costa",
    email: "fernando@cliente.com",
    role: "client",
    cpf: "789.123.456-00",
    phone: "(11) 95678-9012",
    address: {
      street: "Rua da Consolação",
      number: "750",
      neighborhood: "Higienópolis",
      city: "São Paulo",
      state: "SP",
      zipCode: "01302-000",
    },
    planId: "basic",
    supervisorId: "sup-2",
    status: "active",
    assets: [{ name: "Geladeira", estimatedValue: 2000 }],
    totalAssetsValue: 2000,
    servicesUsedThisMonth: 1,
    joinedAt: "2024-06-01",
    lastPaymentAt: "2025-04-05",
    createdAt: "2024-06-01",
  },
];

const SEED_REQUESTS: Request[] = [
  {
    id: "req-1",
    clientId: "cli-1",
    clientName: "João Silva",
    type: "service",
    serviceType: "plumber",
    description: "Vazamento embaixo da pia da cozinha. A água está escorrendo constantemente.",
    desiredDate: "2025-04-20",
    status: "pending",
    createdAt: "2025-04-15T10:00:00Z",
    updatedAt: "2025-04-15T10:00:00Z",
  },
  {
    id: "req-2",
    clientId: "cli-2",
    clientName: "Maria Oliveira",
    type: "coverage",
    coverageType: "flood",
    description: "Chuvas fortes causaram alagamento no apartamento. Vários eletrodomésticos danificados.",
    estimatedLoss: 15000,
    evidenceUrls: [],
    status: "analyzing",
    createdAt: "2025-04-14T14:00:00Z",
    updatedAt: "2025-04-14T14:00:00Z",
  },
  {
    id: "req-3",
    clientId: "cli-4",
    clientName: "Lucia Ferreira",
    type: "service",
    serviceType: "electrician",
    description: "Curto-circuito no quadro de distribuição. Alguns cômodos sem energia.",
    desiredDate: "2025-04-18",
    status: "in_progress",
    createdAt: "2025-04-13T09:00:00Z",
    updatedAt: "2025-04-14T11:00:00Z",
    adminNotes: "Técnico agendado para quarta-feira às 14h.",
  },
  {
    id: "req-4",
    clientId: "cli-5",
    clientName: "Fernando Costa",
    type: "service",
    serviceType: "mason",
    description: "Rachaduras na parede da sala. Precisa de avaliação e reparo.",
    desiredDate: "2025-04-22",
    status: "completed",
    createdAt: "2025-04-10T08:00:00Z",
    updatedAt: "2025-04-12T16:00:00Z",
    adminNotes: "Serviço concluído com sucesso.",
  },
  {
    id: "req-5",
    clientId: "cli-1",
    clientName: "João Silva",
    type: "coverage",
    coverageType: "theft",
    description: "Notebook roubado durante arrombamento. Boletim de ocorrência registrado.",
    estimatedLoss: 4500,
    evidenceUrls: [],
    status: "approved",
    approvedAmount: 4000,
    createdAt: "2025-03-20T10:00:00Z",
    updatedAt: "2025-03-25T15:00:00Z",
    adminNotes: "Aprovado. Valor de R$ 4.000 será ressarcido em até 15 dias úteis.",
  },
];

const SEED_USERS: Array<User & { password: string }> = [
  {
    id: "admin-1",
    name: "Admin Master",
    email: "admin@demo.com",
    role: "admin",
    password: "123456",
    phone: "(11) 99999-0001",
    createdAt: "2024-01-01",
  },
  {
    id: "sup-1",
    name: "Carlos Mendes",
    email: "supervisor@demo.com",
    role: "supervisor",
    password: "123456",
    phone: "(11) 98765-4321",
    createdAt: "2024-01-15",
  },
  {
    id: "cli-1",
    name: "João Silva",
    email: "cliente@demo.com",
    role: "client",
    password: "123456",
    phone: "(11) 91234-5678",
    createdAt: "2024-03-01",
  },
];

// --- INITIALIZATION ---
export function initializeStorage() {
  if (!localStorage.getItem(KEYS.SUPERVISORS)) {
    localStorage.setItem(KEYS.SUPERVISORS, JSON.stringify(SEED_SUPERVISORS));
  }
  if (!localStorage.getItem(KEYS.CLIENTS)) {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS));
  }
  if (!localStorage.getItem(KEYS.REQUESTS)) {
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
  }
  if (!localStorage.getItem(KEYS.PLANS)) {
    localStorage.setItem(KEYS.PLANS, JSON.stringify(PLANS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
  }
}

// --- AUTH ---
export function login(email: string, password: string): User | null {
  const users: Array<User & { password: string }> = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
}

export function logout() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

// --- CLIENTS ---
export function getClients(): Client[] {
  return JSON.parse(localStorage.getItem(KEYS.CLIENTS) || "[]");
}

export function getClientById(id: string): Client | undefined {
  return getClients().find((c) => c.id === id);
}

export function getClientsBySupervisor(supervisorId: string): Client[] {
  return getClients().filter((c) => c.supervisorId === supervisorId);
}

export function saveClient(client: Client) {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
}

export function addClient(client: Client) {
  const clients = getClients();
  clients.push(client);
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  const users: Array<User & { password: string }> = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  users.push({ ...client, password: "123456" });
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function updateClientStatus(clientId: string, status: Client["status"]) {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx >= 0) {
    clients[idx].status = status;
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  }
}

// --- SUPERVISORS ---
export function getSupervisors(): Supervisor[] {
  return JSON.parse(localStorage.getItem(KEYS.SUPERVISORS) || "[]");
}

export function getSupervisorById(id: string): Supervisor | undefined {
  return getSupervisors().find((s) => s.id === id);
}

export function saveSupervisor(supervisor: Supervisor) {
  const supervisors = getSupervisors();
  const idx = supervisors.findIndex((s) => s.id === supervisor.id);
  if (idx >= 0) {
    supervisors[idx] = supervisor;
  } else {
    supervisors.push(supervisor);
  }
  localStorage.setItem(KEYS.SUPERVISORS, JSON.stringify(supervisors));
}

export function addSupervisor(supervisor: Supervisor) {
  const supervisors = getSupervisors();
  supervisors.push(supervisor);
  localStorage.setItem(KEYS.SUPERVISORS, JSON.stringify(supervisors));
  const users: Array<User & { password: string }> = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  users.push({ ...supervisor, password: "123456" });
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

// --- REQUESTS ---
export function getRequests(): Request[] {
  return JSON.parse(localStorage.getItem(KEYS.REQUESTS) || "[]");
}

export function getRequestsByClient(clientId: string): Request[] {
  return getRequests().filter((r) => r.clientId === clientId);
}

export function addRequest(request: Request) {
  const requests = getRequests();
  requests.unshift(request);
  localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
}

export function updateRequest(requestId: string, updates: Partial<Request>) {
  const requests = getRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx >= 0) {
    requests[idx] = { ...requests[idx], ...updates, updatedAt: new Date().toISOString() } as Request;
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
  }
}

// --- PLANS ---
export function getPlans(): Plan[] {
  return JSON.parse(localStorage.getItem(KEYS.PLANS) || "[]");
}

export function getPlanById(id: string): Plan | undefined {
  return getPlans().find((p) => p.id === id);
}

export function savePlan(plan: Plan) {
  const plans = getPlans();
  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) {
    plans[idx] = plan;
    localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
  }
}

// --- HELPERS ---
export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
