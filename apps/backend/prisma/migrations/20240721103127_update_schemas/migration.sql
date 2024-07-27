/*
  Warnings:

  - Added the required column `rE_PackageId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('RENTAL', 'LEASE', 'PURCHASE');

-- CreateEnum
CREATE TYPE "PurchaseReason" AS ENUM ('INVESTMENT', 'RESIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "OccupierType" AS ENUM ('FAMILY', 'BACHELOR');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'CONDO', 'LAND', 'OFFICE_SPACE', 'STANDALONE', 'FARM_HOUSE', 'PENT_HOUSE', 'OTHER');

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "rE_PackageId" UUID NOT NULL,
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
ALTER TABLE "Order" ADD COLUMN     "rE_PackageId" UUID,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

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

-- CreateTable
CREATE TABLE "PropSeller" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "PropSeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "isResidential" BOOLEAN NOT NULL,
    "isFrequentTraveller" BOOLEAN NOT NULL,
    "dealType" "DealType" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "purchaseReason" "PurchaseReason" NOT NULL,
    "occupierType" "OccupierType" NOT NULL,
    "inspectionForId" UUID NOT NULL,
    "sellerId" UUID,
    "propertyAddressId" UUID NOT NULL,
    "totalArea" TEXT,
    "numberOfRooms" TEXT,
    "isNew" BOOLEAN,
    "reBookingId" UUID,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_Booking" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "ownerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "agentId" UUID,
    "dateTimeOfBooking" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inspectionServiceId" UUID NOT NULL,
    "realEstateInspectionReportId" UUID,

    CONSTRAINT "RE_Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_Order" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "isFullfilled" BOOLEAN NOT NULL,
    "paymentId" TEXT,
    "reAgentId" UUID,
    "totalOrderValue" INTEGER NOT NULL,

    CONSTRAINT "RE_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_InspectionService" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "name" TEXT NOT NULL,

    CONSTRAINT "RE_InspectionService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_Package" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "price" INTEGER NOT NULL,
    "strikePrice" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "items" TEXT[],
    "perks" TEXT[],

    CONSTRAINT "RE_Package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_id_idx" ON "Property"("id");

-- CreateIndex
CREATE INDEX "Property_inspectionForId_idx" ON "Property"("inspectionForId");

-- CreateIndex
CREATE UNIQUE INDEX "RE_Order_bookingId_key" ON "RE_Order"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "RE_InspectionService_name_key" ON "RE_InspectionService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RE_Package_name_key" ON "RE_Package"("name");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_inspectionForId_fkey" FOREIGN KEY ("inspectionForId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_reBookingId_fkey" FOREIGN KEY ("reBookingId") REFERENCES "RE_Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "PropSeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_propertyAddressId_fkey" FOREIGN KEY ("propertyAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_rE_PackageId_fkey" FOREIGN KEY ("rE_PackageId") REFERENCES "RE_Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_rE_PackageId_fkey" FOREIGN KEY ("rE_PackageId") REFERENCES "RE_Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "RE_Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_inspectionServiceId_fkey" FOREIGN KEY ("inspectionServiceId") REFERENCES "RE_InspectionService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "RealEstateAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_realEstateInspectionReportId_fkey" FOREIGN KEY ("realEstateInspectionReportId") REFERENCES "RealEstateInspectionReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "RE_Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RE_Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_reAgentId_fkey" FOREIGN KEY ("reAgentId") REFERENCES "RealEstateAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
