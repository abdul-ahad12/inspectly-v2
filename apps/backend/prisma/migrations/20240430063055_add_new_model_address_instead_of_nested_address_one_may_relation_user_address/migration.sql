/*
  Warnings:

  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `long` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suburb` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zipcode` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,phoneNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,phoneNumber]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `approvalStatus` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isAgreedToPolicies` to the `Mechanic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_zipcode_phoneNumber_fkey";

-- DropForeignKey
ALTER TABLE "Mechanic" DROP CONSTRAINT "Mechanic_userId_zipcode_phoneNumber_fkey";

-- DropIndex
DROP INDEX "Customer_userId_zipcode_phoneNumber_key";

-- DropIndex
DROP INDEX "Mechanic_userId_zipcode_phoneNumber_key";

-- DropIndex
DROP INDEX "User_id_zipcode_phoneNumber_key";

-- DropIndex
DROP INDEX "User_lat_long_zipcode_street_suburb_city_key";

-- DropIndex
DROP INDEX "User_zipcode_idx";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Mechanic" ADD COLUMN     "approvalStatus" BOOLEAN NOT NULL,
ADD COLUMN     "isAgreedToPolicies" BOOLEAN NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" DROP COLUMN "city",
DROP COLUMN "lat",
DROP COLUMN "long",
DROP COLUMN "street",
DROP COLUMN "suburb",
DROP COLUMN "zipcode",
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "zipcode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "userId" UUID,
    "mechanicId" UUID,
    "customerId" UUID,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_zipcode_idx" ON "Address"("zipcode");

-- CreateIndex
CREATE INDEX "Address_suburb_idx" ON "Address"("suburb");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_phoneNumber_key" ON "Customer"("userId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_userId_phoneNumber_key" ON "Mechanic"("userId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_phoneNumber_key" ON "User"("id", "phoneNumber");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_userId_phoneNumber_fkey" FOREIGN KEY ("userId", "phoneNumber") REFERENCES "User"("id", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_phoneNumber_fkey" FOREIGN KEY ("userId", "phoneNumber") REFERENCES "User"("id", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
