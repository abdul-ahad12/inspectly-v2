/*
  Warnings:

  - You are about to drop the column `abn` on the `Mechanic` table. All the data in the column will be lost.
  - You are about to drop the column `approvalRID` on the `Mechanic` table. All the data in the column will be lost.
  - You are about to drop the column `approvalStatus` on the `Mechanic` table. All the data in the column will be lost.
  - You are about to drop the column `experienceYears` on the `Mechanic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[street,suburb,city,zipcode]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mechanicId]` on the table `ApprovalRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Package` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mechanicId` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Mechanic" DROP CONSTRAINT "Mechanic_approvalStatus_approvalRID_experienceYears_abn_fkey";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ApprovalRequest" ADD COLUMN     "mechanicId" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "InspectionReport" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Mechanic" DROP COLUMN "abn",
DROP COLUMN "approvalRID",
DROP COLUMN "approvalStatus",
DROP COLUMN "experienceYears",
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_street_suburb_city_zipcode_key" ON "Address"("street", "suburb", "city", "zipcode");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRequest_mechanicId_key" ON "ApprovalRequest"("mechanicId");

-- CreateIndex
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
