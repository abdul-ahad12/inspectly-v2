/*
  Warnings:

  - You are about to drop the column `rE_PackageId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `rE_PackageId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_rE_PackageId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_rE_PackageId_fkey";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "rE_PackageId",
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

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
ALTER TABLE "Order" DROP COLUMN "rE_PackageId",
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

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
