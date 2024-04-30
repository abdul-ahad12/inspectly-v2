/*
  Warnings:

  - You are about to drop the column `addressId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[zipcode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,zipcode,email,phoneNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zipcode]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,zipcode,email,phoneNumber]` on the table `Mechanic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zipcode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,zipcode,email,phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lat,long,zipcode,street,suburb,city]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipcode` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipcode` to the `Mechanic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lat` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `long` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suburb` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipcode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Mechanic" DROP CONSTRAINT "Mechanic_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_addressId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "zipcode" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "Mechanic" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "zipcode" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" DROP COLUMN "addressId",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "long" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "suburb" TEXT NOT NULL,
ADD COLUMN     "zipcode" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT public.uuid_generate_v4();

-- DropTable
DROP TABLE "Address";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_zipcode_key" ON "Customer"("zipcode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phoneNumber_key" ON "Customer"("phoneNumber");

-- CreateIndex
CREATE INDEX "Customer_id_idx" ON "Customer"("id");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phoneNumber_idx" ON "Customer"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_zipcode_email_phoneNumber_key" ON "Customer"("userId", "zipcode", "email", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_zipcode_key" ON "Mechanic"("zipcode");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_userId_key" ON "Mechanic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_email_key" ON "Mechanic"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_phoneNumber_key" ON "Mechanic"("phoneNumber");

-- CreateIndex
CREATE INDEX "Mechanic_available_idx" ON "Mechanic"("available");

-- CreateIndex
CREATE INDEX "Mechanic_id_idx" ON "Mechanic"("id");

-- CreateIndex
CREATE INDEX "Mechanic_email_idx" ON "Mechanic"("email");

-- CreateIndex
CREATE INDEX "Mechanic_phoneNumber_idx" ON "Mechanic"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_userId_zipcode_email_phoneNumber_key" ON "Mechanic"("userId", "zipcode", "email", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_zipcode_key" ON "User"("zipcode");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isPhoneVerified_idx" ON "User"("isPhoneVerified");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_zipcode_email_phoneNumber_key" ON "User"("id", "zipcode", "email", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_lat_long_zipcode_street_suburb_city_key" ON "User"("lat", "long", "zipcode", "street", "suburb", "city");

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_userId_zipcode_email_phoneNumber_fkey" FOREIGN KEY ("userId", "zipcode", "email", "phoneNumber") REFERENCES "User"("id", "zipcode", "email", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_zipcode_email_phoneNumber_fkey" FOREIGN KEY ("userId", "zipcode", "email", "phoneNumber") REFERENCES "User"("id", "zipcode", "email", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
