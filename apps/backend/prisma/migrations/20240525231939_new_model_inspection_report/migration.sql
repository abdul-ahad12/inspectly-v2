/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `InspectionReport` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mechanicId]` on the table `InspectionReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `additionalComments` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bodyStructure` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineAndPeripherals` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalChecks` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interior` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mechanicId` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `odometer` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendation` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suspensionAndBrakes` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transmission` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transmissionDrivetrain` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleColor` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wheelsAndTires` to the `InspectionReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AUTOMATIC', 'MANUAL', 'HYBRID');

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "InspectionReport" ADD COLUMN     "additionalComments" TEXT NOT NULL,
ADD COLUMN     "bodyStructure" JSONB NOT NULL,
ADD COLUMN     "bookingId" UUID NOT NULL,
ADD COLUMN     "engineAndPeripherals" JSONB NOT NULL,
ADD COLUMN     "finalChecks" JSONB NOT NULL,
ADD COLUMN     "interior" JSONB NOT NULL,
ADD COLUMN     "mechanicId" UUID NOT NULL,
ADD COLUMN     "odometer" BIGINT NOT NULL,
ADD COLUMN     "recommendation" JSONB NOT NULL,
ADD COLUMN     "suspensionAndBrakes" JSONB NOT NULL,
ADD COLUMN     "transmission" "Transmission" NOT NULL,
ADD COLUMN     "transmissionDrivetrain" JSONB NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "vehicleColor" TEXT NOT NULL,
ADD COLUMN     "wheelsAndTires" JSONB NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

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
CREATE UNIQUE INDEX "InspectionReport_bookingId_key" ON "InspectionReport"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReport_mechanicId_key" ON "InspectionReport"("mechanicId");

-- AddForeignKey
ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
