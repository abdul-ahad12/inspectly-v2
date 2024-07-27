/*
  Warnings:

  - You are about to drop the column `appreciationJustification` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `askingPriceCompetitive` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `futureDevelopmentPlans` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `immediateRepairsNeeded` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `legalOrZoningIssues` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `parkingAvailable` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `parkingDetails` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `potentialAppreciation` on the `RealEstateInspectionReport` table. All the data in the column will be lost.
  - You are about to drop the column `propertyCondition` on the `RealEstateInspectionReport` table. All the data in the column will be lost.

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
ALTER TABLE "RealEstateInspectionReport" DROP COLUMN "appreciationJustification",
DROP COLUMN "askingPriceCompetitive",
DROP COLUMN "futureDevelopmentPlans",
DROP COLUMN "immediateRepairsNeeded",
DROP COLUMN "legalOrZoningIssues",
DROP COLUMN "parkingAvailable",
DROP COLUMN "parkingDetails",
DROP COLUMN "potentialAppreciation",
DROP COLUMN "propertyCondition",
ADD COLUMN     "isAskingPriceCompetitive" BOOLEAN,
ADD COLUMN     "isFutureDevelopmentPlans" BOOLEAN,
ADD COLUMN     "isImmediateRepairsNeeded" BOOLEAN,
ADD COLUMN     "isLegalOrZoningIssues" BOOLEAN,
ADD COLUMN     "isParkingAvailable" BOOLEAN,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4(),
ALTER COLUMN "proximityToMajorRoads" DROP NOT NULL;

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
