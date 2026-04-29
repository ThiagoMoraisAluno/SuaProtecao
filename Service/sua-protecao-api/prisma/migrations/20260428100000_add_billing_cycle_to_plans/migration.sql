-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'annual');

-- AlterTable
ALTER TABLE "plans" ADD COLUMN "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'monthly';
