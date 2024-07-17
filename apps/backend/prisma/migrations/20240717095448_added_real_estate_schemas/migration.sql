-- CreateEnum
CREATE TYPE "AreasOfSpecialization" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'LAND');

-- CreateEnum
CREATE TYPE "RealEstateAgentExperience" AS ENUM ('UnderOneYear', 'UnderTwoYears', 'UnderThreeYears', 'UnderFiveYears', 'MoreThanFiveYears');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "CrimeRate" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "NeighborhoodVibe" AS ENUM ('FAMILY_FRIENDLY', 'QUIET', 'BUSTLING', 'TRENDY', 'OTHER');

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
CREATE TABLE "RealEstateAgent" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "description" TEXT,
    "email" TEXT NOT NULL,
    "profilePic" TEXT NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "level" INTEGER DEFAULT 1,
    "hasAgreedToPolicies" BOOLEAN NOT NULL,
    "realEstateLicenceNumber" TEXT NOT NULL,
    "abn" TEXT NOT NULL,
    "companyName" TEXT,
    "areaOfSpecialization" "AreasOfSpecialization" NOT NULL,
    "experience" "RealEstateAgentExperience" NOT NULL,
    "identificationDocument" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "deviceIds" TEXT[],
    "userId" UUID NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "addressId" UUID NOT NULL,

    CONSTRAINT "RealEstateAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstateInspectionReport" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "propertyAddress" TEXT NOT NULL,
    "inspectorId" UUID NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "askingPriceCompetitive" BOOLEAN NOT NULL,
    "askingPriceJustification" TEXT NOT NULL,
    "legalOrZoningIssues" BOOLEAN NOT NULL,
    "legalOrZoningDetails" TEXT,
    "propertyCondition" "PropertyCondition" NOT NULL,
    "conditionElaboration" TEXT NOT NULL,
    "floodOrDisasterProne" BOOLEAN NOT NULL,
    "floodOrDisasterDetails" TEXT,
    "immediateRepairsNeeded" BOOLEAN NOT NULL,
    "repairDetails" TEXT,
    "energyEfficient" BOOLEAN NOT NULL,
    "energyEfficiencyDetails" TEXT,
    "goodSchoolDistrict" BOOLEAN NOT NULL,
    "schoolDistrictDetails" TEXT,
    "crimeRate" "CrimeRate" NOT NULL,
    "crimeRateDetails" TEXT NOT NULL,
    "potentialAppreciation" BOOLEAN NOT NULL,
    "appreciationJustification" TEXT NOT NULL,
    "nearbyFacilities" JSONB NOT NULL,
    "neighborhoodVibe" "NeighborhoodVibe" NOT NULL,
    "otherVibeDetails" TEXT,
    "proximityToMajorRoads" TEXT NOT NULL,
    "futureDevelopmentPlans" BOOLEAN NOT NULL,
    "developmentPlanDetails" TEXT,
    "parkingAvailable" BOOLEAN NOT NULL,
    "parkingDetails" TEXT,
    "additionalComments" TEXT,
    "reportUrl" TEXT,

    CONSTRAINT "RealEstateInspectionReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAgent_email_key" ON "RealEstateAgent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAgent_userId_key" ON "RealEstateAgent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAgent_phoneNumber_key" ON "RealEstateAgent"("phoneNumber");

-- CreateIndex
CREATE INDEX "RealEstateAgent_available_idx" ON "RealEstateAgent"("available");

-- CreateIndex
CREATE INDEX "RealEstateAgent_id_idx" ON "RealEstateAgent"("id");

-- CreateIndex
CREATE INDEX "RealEstateAgent_phoneNumber_idx" ON "RealEstateAgent"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAgent_userId_phoneNumber_key" ON "RealEstateAgent"("userId", "phoneNumber");

-- AddForeignKey
ALTER TABLE "RealEstateAgent" ADD CONSTRAINT "RealEstateAgent_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateAgent" ADD CONSTRAINT "RealEstateAgent_userId_phoneNumber_fkey" FOREIGN KEY ("userId", "phoneNumber") REFERENCES "User"("id", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateInspectionReport" ADD CONSTRAINT "RealEstateInspectionReport_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "RealEstateAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
