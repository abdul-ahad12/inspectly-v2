/*
  Warnings:

  - You are about to drop the column `isAgreedToPolicies` on the `Mechanic` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleUserType` on the `Mechanic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[status,id,experience,ABN]` on the table `ApprovalRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ABN` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressId` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certificate_3` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicLiabilityInsurance` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approvalRID` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasAgreedToPolicies` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleUseType` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `experienceYears` on the `Mechanic` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `approvalStatus` on the `Mechanic` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'REUPLOAD_REQUESTED');

-- CreateEnum
CREATE TYPE "MechanicExperience" AS ENUM ('UnderOneYear', 'UnderTwoYears', 'UnderThreeYears', 'UnderFiveYears', 'MoreThanFiveYears');

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ApprovalRequest" ADD COLUMN     "ABN" TEXT NOT NULL,
ADD COLUMN     "addressId" UUID NOT NULL,
ADD COLUMN     "ausIdentificationDoc" TEXT[],
ADD COLUMN     "certificate_3" TEXT NOT NULL,
ADD COLUMN     "certificate_4" TEXT,
ADD COLUMN     "experience" "MechanicExperience" NOT NULL,
ADD COLUMN     "professionalIndemnityInsurance" TEXT,
ADD COLUMN     "publicLiabilityInsurance" TEXT NOT NULL,
ADD COLUMN     "status" "ApprovalStatus" NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "InspectionReport" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Mechanic" DROP COLUMN "isAgreedToPolicies",
DROP COLUMN "vehicleUserType",
ADD COLUMN     "approvalRID" UUID NOT NULL,
ADD COLUMN     "hasAgreedToPolicies" BOOLEAN NOT NULL,
ADD COLUMN     "level" INTEGER DEFAULT 1,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "vehicleUseType" "VehicleUseType" NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4(),
DROP COLUMN "experienceYears",
ADD COLUMN     "experienceYears" "MechanicExperience" NOT NULL,
ALTER COLUMN "available" SET DEFAULT false,
DROP COLUMN "approvalStatus",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "isVerified" BOOLEAN,
    "message" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "photos" TEXT[],
    "customerId" UUID NOT NULL,
    "mechanicId" UUID NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRequest_status_id_experience_ABN_key" ON "ApprovalRequest"("status", "id", "experience", "ABN");

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_approvalStatus_approvalRID_experienceYears_abn_fkey" FOREIGN KEY ("approvalStatus", "approvalRID", "experienceYears", "abn") REFERENCES "ApprovalRequest"("status", "id", "experience", "ABN") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
