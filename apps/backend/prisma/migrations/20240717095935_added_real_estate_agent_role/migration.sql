/*
  Warnings:

  - You are about to drop the column `askingPriceJustification` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `conditionElaboration` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `crimeRateDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `developmentPlanDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `energyEfficiencyDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `energyEfficient` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `floodOrDisasterDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `floodOrDisasterProne` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `goodSchoolDistrict` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `legalOrZoningDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `otherVibeDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `repairDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `schoolDistrictDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - Added the required column `additionalInfo` to the `RealEstateInspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallCondition` to the `RealEstateInspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyInfo` to the `RealEstateInspectionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RealEstateInspectionReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'REAGENT';

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
ALTER TABLE "RealEstateAgent" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "RealEstateInspectionReport" DROP COLUMN "askingPriceJustification",
DROP COLUMN "conditionElaboration",
DROP COLUMN "crimeRateDetails",
DROP COLUMN "developmentPlanDetails",
DROP COLUMN "energyEfficiencyDetails",
DROP COLUMN "energyEfficient",
DROP COLUMN "floodOrDisasterDetails",
DROP COLUMN "floodOrDisasterProne",
DROP COLUMN "goodSchoolDistrict",
DROP COLUMN "legalOrZoningDetails",
DROP COLUMN "otherVibeDetails",
DROP COLUMN "repairDetails",
DROP COLUMN "schoolDistrictDetails",
ADD COLUMN     "additionalInfo" JSONB NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "overallCondition" "PropertyCondition" NOT NULL,
ADD COLUMN     "propertyInfo" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

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
