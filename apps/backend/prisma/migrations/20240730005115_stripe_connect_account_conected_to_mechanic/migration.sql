/*
  Warnings:

  - You are about to drop the column `mechId` on the `StripeConnectAccount` table. All the data in the column will be lost.
  - You are about to drop the column `reAgentId` on the `StripeConnectAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeConnectAccountId]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeConnectAccountId]` on the table `RealEstateAgent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeConnectAccountId` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeConnectAccountId` to the `RealEstateAgent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StripeConnectAccount" DROP CONSTRAINT "StripeConnectAccount_mechId_fkey";

-- DropForeignKey
ALTER TABLE "StripeConnectAccount" DROP CONSTRAINT "StripeConnectAccount_reAgentId_fkey";

-- DropIndex
DROP INDEX "StripeConnectAccount_connectAcctId_mechId_idx";

-- DropIndex
DROP INDEX "StripeConnectAccount_connectAcctId_reAgentId_idx";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "InspectionReport" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "InspectionService" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Mechanic" ADD COLUMN     "stripeConnectAccountId" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "PropSeller" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RE_Booking" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RE_InspectionService" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RE_Order" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RE_Package" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ReAgentApprovalRequest" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RealEstateAgent" ADD COLUMN     "stripeConnectAccountId" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RealEstateInspectionReport" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Seller" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "StripeConnectAccount" DROP COLUMN "mechId",
DROP COLUMN "reAgentId",
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "StripeCustomerAccount" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_stripeConnectAccountId_key" ON "Mechanic"("stripeConnectAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAgent_stripeConnectAccountId_key" ON "RealEstateAgent"("stripeConnectAccountId");

-- CreateIndex
CREATE INDEX "StripeConnectAccount_connectAcctId_idx" ON "StripeConnectAccount"("connectAcctId");

-- AddForeignKey
ALTER TABLE "RealEstateAgent" ADD CONSTRAINT "RealEstateAgent_stripeConnectAccountId_fkey" FOREIGN KEY ("stripeConnectAccountId") REFERENCES "StripeConnectAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_stripeConnectAccountId_fkey" FOREIGN KEY ("stripeConnectAccountId") REFERENCES "StripeConnectAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
