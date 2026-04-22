-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'supervisor', 'client');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('basic', 'intermediate', 'premium');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('active', 'inactive', 'defaulter');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'in_progress', 'completed', 'analyzing', 'approved', 'denied');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('service', 'coverage');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('plumber', 'electrician', 'mason', 'locksmith', 'painter', 'carpenter', 'cleaner', 'other');

-- CreateEnum
CREATE TYPE "CoverageType" AS ENUM ('theft', 'flood', 'structural_damage', 'fire', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'client',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisors" (
    "user_id" TEXT NOT NULL,
    "commission" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "services_per_month" INTEGER NOT NULL,
    "coverage_limit" DECIMAL(12,2) NOT NULL,
    "features" TEXT[],
    "color" TEXT NOT NULL DEFAULT 'brand',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "user_id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT,
    "plan_id" TEXT NOT NULL,
    "supervisor_id" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'active',
    "total_assets_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "services_used_this_month" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_payment_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "address_street" TEXT NOT NULL,
    "address_number" TEXT NOT NULL,
    "address_complement" TEXT,
    "address_neighborhood" TEXT NOT NULL,
    "address_city" TEXT NOT NULL,
    "address_state" TEXT NOT NULL,
    "address_zip_code" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "client_assets" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimated_value" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "client_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "service_type" "ServiceType",
    "desired_date" DATE,
    "coverage_type" "CoverageType",
    "estimated_loss" DECIMAL(12,2),
    "approved_amount" DECIMAL(12,2),
    "evidence_urls" TEXT[],

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_type_key" ON "plans"("type");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- CreateIndex
CREATE INDEX "clients_supervisor_id_idx" ON "clients"("supervisor_id");

-- CreateIndex
CREATE INDEX "clients_plan_id_idx" ON "clients"("plan_id");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE INDEX "client_assets_client_id_idx" ON "client_assets"("client_id");

-- CreateIndex
CREATE INDEX "requests_client_id_idx" ON "requests"("client_id");

-- CreateIndex
CREATE INDEX "requests_type_idx" ON "requests"("type");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "requests_created_at_idx" ON "requests"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_assets" ADD CONSTRAINT "client_assets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
