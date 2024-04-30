/*
  Warnings:

  - You are about to drop the column `email` on the `Mechanic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,zipcode,phoneNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,zipcode,phoneNumber]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,zipcode,phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vehicleFuelType` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleTypes` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleUserType` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleWheels` to the `Mechanic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'TRUCK', 'TRACTOR');

-- CreateEnum
CREATE TYPE "VehicleFuelType" AS ENUM ('ELECTRIC', 'GAS', 'PETROL', 'DIESEL');

-- CreateEnum
CREATE TYPE "VehicleUseType" AS ENUM ('SPORT', 'SEMISPORT', 'COMMERCIAL', 'NONCOMMERCIAL');

-- CreateEnum
CREATE TYPE "VehicleWheels" AS ENUM ('TWO', 'FOUR');

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_zipcode_email_phoneNumber_fkey";

-- DropForeignKey
ALTER TABLE "Mechanic" DROP CONSTRAINT "Mechanic_userId_zipcode_email_phoneNumber_fkey";

-- DropIndex
DROP INDEX "Customer_email_idx";

-- DropIndex
DROP INDEX "Customer_userId_zipcode_email_phoneNumber_key";

-- DropIndex
DROP INDEX "Customer_zipcode_key";

-- DropIndex
DROP INDEX "Mechanic_email_idx";

-- DropIndex
DROP INDEX "Mechanic_email_key";

-- DropIndex
DROP INDEX "Mechanic_userId_zipcode_email_phoneNumber_key";

-- DropIndex
DROP INDEX "Mechanic_zipcode_key";

-- DropIndex
DROP INDEX "User_id_zipcode_email_phoneNumber_key";

-- DropIndex
DROP INDEX "User_zipcode_key";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4(),
ALTER COLUMN "profilePic" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mechanic" DROP COLUMN "email",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "vehicleFuelType" "VehicleFuelType" NOT NULL,
ADD COLUMN     "vehicleTypes" "VehicleType" NOT NULL,
ADD COLUMN     "vehicleUserType" "VehicleUseType" NOT NULL,
ADD COLUMN     "vehicleWheels" "VehicleWheels" NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4(),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "isPhoneVerified" DROP NOT NULL,
ALTER COLUMN "verifiedOn" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "carType" "VehicleType" NOT NULL,
    "fuelType" "VehicleFuelType" NOT NULL,
    "useType" "VehicleUseType" NOT NULL,
    "noOfWheels" "VehicleWheels" NOT NULL,
    "ownerId" UUID NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "regNumber" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "ownerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "mechanicId" UUID NOT NULL,
    "dateTimeOfBooking" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "price" BIGINT NOT NULL,
    "strikePrice" BIGINT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "items" TEXT[],
    "perks" TEXT[],

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerId" UUID NOT NULL,
    "isFullfilled" BOOLEAN NOT NULL,
    "paymentId" TEXT NOT NULL,
    "mechanicId" UUID NOT NULL,
    "totalOrderValue" BIGINT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vehicle_id_idx" ON "Vehicle"("id");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_idx" ON "Vehicle"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_vehicleId_key" ON "Booking"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Customer_zipcode_idx" ON "Customer"("zipcode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_zipcode_phoneNumber_key" ON "Customer"("userId", "zipcode", "phoneNumber");

-- CreateIndex
CREATE INDEX "Mechanic_zipcode_idx" ON "Mechanic"("zipcode");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_userId_zipcode_phoneNumber_key" ON "Mechanic"("userId", "zipcode", "phoneNumber");

-- CreateIndex
CREATE INDEX "User_zipcode_idx" ON "User"("zipcode");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_zipcode_phoneNumber_key" ON "User"("id", "zipcode", "phoneNumber");

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_userId_zipcode_phoneNumber_fkey" FOREIGN KEY ("userId", "zipcode", "phoneNumber") REFERENCES "User"("id", "zipcode", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_zipcode_phoneNumber_fkey" FOREIGN KEY ("userId", "zipcode", "phoneNumber") REFERENCES "User"("id", "zipcode", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
