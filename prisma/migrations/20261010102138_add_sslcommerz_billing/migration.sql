/*
  Warnings:

  - The values [BASIC,PREMIUM] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `refundAmount` on the `SubscriptionPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[sslcommerzSessionKey]` on the table `SubscriptionPayment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sslcommerzValId]` on the table `SubscriptionPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('FREE', 'STARTER', 'PRO');
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "SubscriptionPlan_new" USING ("plan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
COMMIT;

-- DropIndex
DROP INDEX "Assessment_recruiterId_idx";

-- DropIndex
DROP INDEX "Assessment_status_idx";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "refundAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "SubscriptionPayment" ADD COLUMN     "sslcommerzSessionKey" TEXT,
ADD COLUMN     "sslcommerzValId" TEXT,
ALTER COLUMN "refundAmount" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_sslcommerzSessionKey_key" ON "SubscriptionPayment"("sslcommerzSessionKey");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_sslcommerzValId_key" ON "SubscriptionPayment"("sslcommerzValId");
