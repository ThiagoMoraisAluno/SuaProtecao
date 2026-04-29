-- Habilita gen_random_uuid() para os INSERTs de seed/backfill abaixo
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── ENTREGA 2: catálogo dinâmico de serviços ────────────────────────────────

-- CreateTable services
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE INDEX "services_is_active_idx" ON "services"("is_active");

-- Seed: 1:1 com o enum ServiceType (mantém retrocompat)
INSERT INTO "services" (id, name, slug, icon, is_active, updated_at) VALUES
  (gen_random_uuid(), 'Encanador',    'plumber',     '🔧', true, NOW()),
  (gen_random_uuid(), 'Eletricista',  'electrician', '⚡', true, NOW()),
  (gen_random_uuid(), 'Pedreiro',     'mason',       '🧱', true, NOW()),
  (gen_random_uuid(), 'Chaveiro',     'locksmith',   '🔑', true, NOW()),
  (gen_random_uuid(), 'Pintor',       'painter',     '🎨', true, NOW()),
  (gen_random_uuid(), 'Carpinteiro',  'carpenter',   '🪚', true, NOW()),
  (gen_random_uuid(), 'Limpeza',      'cleaner',     '🧽', true, NOW()),
  (gen_random_uuid(), 'Outros',       'other',       '🛠️', true, NOW());

-- CreateTable plan_service_rules
CREATE TABLE "plan_service_rules" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "max_per_month" INTEGER NOT NULL,
    "max_per_year" INTEGER NOT NULL,
    "coverage_limit" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_service_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "plan_service_rules_plan_id_service_id_key" ON "plan_service_rules"("plan_id", "service_id");
CREATE INDEX "plan_service_rules_plan_id_idx" ON "plan_service_rules"("plan_id");
CREATE INDEX "plan_service_rules_service_id_idx" ON "plan_service_rules"("service_id");

ALTER TABLE "plan_service_rules" ADD CONSTRAINT "plan_service_rules_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_service_rules" ADD CONSTRAINT "plan_service_rules_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed regras default: cada plano × cada serviço, herdando os limites globais do plano.
-- max_per_year = max_per_month × 12 (ou -1 se ilimitado). O Master ajusta no painel.
INSERT INTO "plan_service_rules" (id, plan_id, service_id, max_per_month, max_per_year, coverage_limit, updated_at)
SELECT
  gen_random_uuid(),
  p.id,
  s.id,
  p.services_per_month,
  CASE WHEN p.services_per_month = -1 THEN -1 ELSE p.services_per_month * 12 END,
  p.coverage_limit,
  NOW()
FROM "plans" p CROSS JOIN "services" s;

-- AlterTable requests: adiciona service_id FK (nullable, retrocompat com enum service_type)
ALTER TABLE "requests" ADD COLUMN "service_id" TEXT;
CREATE INDEX "requests_service_id_idx" ON "requests"("service_id");
ALTER TABLE "requests" ADD CONSTRAINT "requests_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: copia o enum service_type para a FK service_id casando pelo slug
UPDATE "requests" r
   SET service_id = s.id
  FROM "services" s
 WHERE r.service_type IS NOT NULL
   AND r.service_type::text = s.slug;

-- ─── ENTREGA 3: notificações ─────────────────────────────────────────────────

CREATE TYPE "NotificationType" AS ENUM ('request_opened', 'request_updated', 'request_closed', 'payment_overdue');

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
