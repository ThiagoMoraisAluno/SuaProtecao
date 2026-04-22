import type { Plan, ServiceType, CoverageType } from "@/types";

export const PLANS: Plan[] = [
  {
    id: "basic",
    type: "basic",
    name: "Plano Básico",
    price: 49.99,
    servicesPerMonth: 1,
    coverageLimit: 20000,
    color: "slate",
    features: [
      "1 serviço por mês",
      "Cobertura até R$ 20.000",
      "Suporte via WhatsApp",
      "Encanamento e Elétrica",
      "Atendimento em até 48h",
    ],
  },
  {
    id: "intermediate",
    type: "intermediate",
    name: "Plano Intermediário",
    price: 99.90,
    servicesPerMonth: 2,
    coverageLimit: 40000,
    color: "brand",
    popular: true,
    features: [
      "2 serviços por mês",
      "Cobertura até R$ 40.000",
      "Suporte prioritário",
      "Todos os serviços disponíveis",
      "Atendimento em até 24h",
      "Relatório de visitas",
    ],
  },
  {
    id: "premium",
    type: "premium",
    name: "Plano Premium",
    price: 169.90,
    servicesPerMonth: -1,
    coverageLimit: 80000,
    color: "navy",
    features: [
      "Serviços ilimitados",
      "Cobertura até R$ 80.000",
      "Suporte 24/7 prioritário",
      "Todos os serviços + reformas",
      "Atendimento emergencial",
      "Gestor de conta dedicado",
      "Relatórios mensais",
    ],
  },
];

export const SERVICE_TYPES: Array<{ value: ServiceType; label: string; icon: string }> = [
  { value: "plumber", label: "Encanador", icon: "🔧" },
  { value: "electrician", label: "Eletricista", icon: "⚡" },
  { value: "mason", label: "Pedreiro", icon: "🏗️" },
  { value: "locksmith", label: "Chaveiro", icon: "🔑" },
  { value: "painter", label: "Pintor", icon: "🎨" },
  { value: "carpenter", label: "Carpinteiro", icon: "🪚" },
  { value: "cleaner", label: "Diarista", icon: "🧹" },
  { value: "other", label: "Outro", icon: "🛠️" },
];

export const COVERAGE_TYPES: Array<{ value: CoverageType; label: string; icon: string }> = [
  { value: "theft", label: "Roubo / Furto", icon: "🔓" },
  { value: "flood", label: "Enchente / Alagamento", icon: "💧" },
  { value: "structural_damage", label: "Dano Estrutural", icon: "🏚️" },
  { value: "fire", label: "Incêndio", icon: "🔥" },
  { value: "other", label: "Outro Sinistro", icon: "⚠️" },
];

export const APPLIANCES_LIST = [
  "Geladeira",
  "Fogão / Forno",
  "Micro-ondas",
  "Máquina de Lavar",
  "Secadora",
  "Televisão",
  "Ar Condicionado",
  "Computador / Notebook",
  "Sofá / Estofado",
  "Mesa / Cadeiras",
  "Guarda-roupa",
  "Cama / Colchão",
  "Liquidificador",
  "Batedeira",
  "Aspirador",
  "Ventilador",
  "Jogo de Louças",
  "Microondas",
  "Impressora",
  "Videogame",
];

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const WHATSAPP_NUMBER = "5511999999999";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá!%20Preciso%20de%20suporte%20do%20Sua%20Proteção%20|%20Reparo%20Certo.`;
