/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PropSeller` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `PropSeller` will be added. If there are existing duplicate values, this will fail.

*/
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
ALTER TABLE "Mechanic" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

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
ALTER TABLE "RealEstateAgent" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RealEstateInspectionReport" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Seller" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "StripeCustomerAccount" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- CreateIndex
CREATE UNIQUE INDEX "PropSeller_email_key" ON "PropSeller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PropSeller_phoneNumber_key" ON "PropSeller"("phoneNumber");

-- CreateIndex
CREATE INDEX "PropSeller_email_idx" ON "PropSeller"("email");

-- CreateIndex
CREATE INDEX "PropSeller_phoneNumber_idx" ON "PropSeller"("phoneNumber");
