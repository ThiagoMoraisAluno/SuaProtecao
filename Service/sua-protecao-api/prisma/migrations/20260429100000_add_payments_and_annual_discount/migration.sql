-- ─── ENUMS ──────────────────────────────────────────────────────────────────
CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'boleto', 'credit_card');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'confirmed', 'overdue', 'refunded', 'cancelled');

-- Adiciona valor 'payment_confirmed' ao enum NotificationType existente
ALTER TYPE "NotificationType" ADD VALUE 'payment_confirmed';

-- ─── ALTER TABLE: clients ──────────────────────────────────────────────────
ALTER TABLE "clients" ADD COLUMN "asaas_customer_id" TEXT;
CREATE UNIQUE INDEX "clients_asaas_customer_id_key" ON "clients"("asaas_customer_id");

-- ─── ALTER TABLE: plans ────────────────────────────────────────────────────
ALTER TABLE "plans" ADD COLUMN "annual_discount" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- ─── CREATE TABLE: payments ────────────────────────────────────────────────
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "asaas_payment_id" TEXT NOT NULL,
    "asaas_customer_id" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "paid_at" TIMESTAMP(3),
    "installment" INTEGER,
    "total_installments" INTEGER,
    "pix_code" TEXT,
    "pix_qr_code" TEXT,
    "boleto_url" TEXT,
    "boleto_bar_code" TEXT,
    "invoice_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_asaas_payment_id_key" ON "payments"("asaas_payment_id");
CREATE INDEX "payments_client_id_idx" ON "payments"("client_id");
CREATE INDEX "payments_plan_id_idx" ON "payments"("plan_id");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_due_date_idx" ON "payments"("due_date");
CREATE INDEX "payments_client_id_created_at_idx" ON "payments"("client_id", "created_at" DESC);

ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
