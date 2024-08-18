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
CREATE TABLE "StripeConnectAccount" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "connectAcctId" TEXT NOT NULL,
    "payoutsEnabled" BOOLEAN NOT NULL,
    "bankAccountDetails" JSONB[],
    "bankAccountStatus" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "mechId" UUID,
    "reAgentId" UUID,
    "lastOrder" TIMESTAMP(3),
    "lastMechOrderId" UUID,
    "lastReAgentOrderId" UUID,
    "totalEarnings" BIGINT,

    CONSTRAINT "StripeConnectAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeConnectAccount_connectAcctId_key" ON "StripeConnectAccount"("connectAcctId");

-- CreateIndex
CREATE INDEX "StripeConnectAccount_connectAcctId_mechId_idx" ON "StripeConnectAccount"("connectAcctId", "mechId");

-- CreateIndex
CREATE INDEX "StripeConnectAccount_connectAcctId_reAgentId_idx" ON "StripeConnectAccount"("connectAcctId", "reAgentId");

-- AddForeignKey
ALTER TABLE "StripeConnectAccount" ADD CONSTRAINT "StripeConnectAccount_mechId_fkey" FOREIGN KEY ("mechId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeConnectAccount" ADD CONSTRAINT "StripeConnectAccount_reAgentId_fkey" FOREIGN KEY ("reAgentId") REFERENCES "RealEstateAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeConnectAccount" ADD CONSTRAINT "StripeConnectAccount_lastMechOrderId_fkey" FOREIGN KEY ("lastMechOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeConnectAccount" ADD CONSTRAINT "StripeConnectAccount_lastReAgentOrderId_fkey" FOREIGN KEY ("lastReAgentOrderId") REFERENCES "RE_Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
