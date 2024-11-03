-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER', 'MODERATOR', 'MECHANIC', 'REAGENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'REUPLOAD_REQUESTED');

-- CreateEnum
CREATE TYPE "MechanicExperience" AS ENUM ('UnderOneYear', 'UnderTwoYears', 'UnderThreeYears', 'UnderFiveYears', 'MoreThanFiveYears');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'TRUCK', 'TRACTOR');

-- CreateEnum
CREATE TYPE "VehicleFuelType" AS ENUM ('ELECTRIC', 'GAS', 'PETROL', 'DIESEL');

-- CreateEnum
CREATE TYPE "VehicleUseType" AS ENUM ('SPORT', 'SEMISPORT', 'COMMERCIAL', 'NONCOMMERCIAL');

-- CreateEnum
CREATE TYPE "VehicleWheels" AS ENUM ('TWO', 'FOUR');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AUTOMATIC', 'MANUAL', 'HYBRID');

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

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('RENTAL', 'LEASE', 'PURCHASE');

-- CreateEnum
CREATE TYPE "PurchaseReason" AS ENUM ('INVESTMENT', 'RESIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "OccupierType" AS ENUM ('FAMILY', 'BACHELOR');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'CONDO', 'LAND', 'OFFICE_SPACE', 'STANDALONE', 'FARM_HOUSE', 'PENT_HOUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'BANK_ACCOUNT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "BankVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTITY_DOCUMENT', 'BANK_OWNERSHIP_VERIFICATION', 'BUSINESS_LICENSE');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('IDENTITY', 'BANK_ACCOUNT', 'BUSINESS_LICENSE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "PlatformTransactionType" AS ENUM ('PAYMENT', 'PAYOUT', 'REFUND', 'TRANSFER', 'FEE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AdminStripeActionType" AS ENUM ('REFUND', 'ACCOUNT_UPDATE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "isPhoneVerified" BOOLEAN DEFAULT false,
    "verifiedOn" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isBanned" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "ReAgentApprovalRequest" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "status" "ApprovalStatus" NOT NULL,
    "ausIdentificationDoc" TEXT NOT NULL,
    "ABN" TEXT NOT NULL,
    "experience" "RealEstateAgentExperience" NOT NULL,
    "agentId" UUID NOT NULL,

    CONSTRAINT "ReAgentApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mechanic" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "vehicleTypes" "VehicleType" NOT NULL,
    "vehicleFuelType" "VehicleFuelType" NOT NULL,
    "vehicleUseType" "VehicleUseType" NOT NULL,
    "vehicleWheels" "VehicleWheels" NOT NULL,
    "description" TEXT,
    "profilePic" TEXT NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "level" INTEGER DEFAULT 1,
    "hasAgreedToPolicies" BOOLEAN NOT NULL,
    "avv" TEXT,
    "certifications" TEXT[],
    "licences" TEXT[],
    "available" BOOLEAN NOT NULL DEFAULT false,
    "deviceIds" TEXT[],
    "userId" UUID NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "status" "ApprovalStatus" NOT NULL,
    "certificate_3" TEXT NOT NULL,
    "certificate_4" TEXT,
    "publicLiabilityInsurance" TEXT NOT NULL,
    "professionalIndemnityInsurance" TEXT,
    "ausIdentificationDoc" TEXT NOT NULL,
    "ABN" TEXT NOT NULL,
    "addressId" UUID NOT NULL,
    "experience" "MechanicExperience" NOT NULL,
    "mechanicId" UUID NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "profilePic" TEXT,
    "alternateNumber" TEXT,
    "userId" UUID NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "zipcode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "name" TEXT,
    "landmark" TEXT,
    "userId" UUID,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "carType" "VehicleType" NOT NULL,
    "fuelType" "VehicleFuelType" NOT NULL,
    "useType" "VehicleUseType" NOT NULL,
    "noOfWheels" "VehicleWheels" NOT NULL,
    "ownerId" UUID NOT NULL,
    "vehicleAddressId" UUID NOT NULL,
    "sellerId" UUID,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "regNumber" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropSeller" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "PropSeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "isResidential" BOOLEAN NOT NULL,
    "isFrequentTraveller" BOOLEAN NOT NULL,
    "dealType" "DealType" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "purchaseReason" "PurchaseReason" NOT NULL,
    "occupierType" "OccupierType" NOT NULL,
    "inspectionForId" UUID NOT NULL,
    "sellerId" UUID,
    "propertyAddressId" UUID NOT NULL,
    "totalArea" TEXT,
    "numberOfRooms" INTEGER,
    "isNew" BOOLEAN,
    "reBookingId" UUID,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "ownerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "mechanicId" UUID,
    "dateTimeOfBooking" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inspectionServiceId" UUID NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "isFullfilled" BOOLEAN NOT NULL,
    "paymentId" TEXT,
    "mechanicId" UUID,
    "totalOrderValue" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_Booking" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "ownerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "agentId" UUID,
    "dateTimeOfBooking" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inspectionServiceId" UUID NOT NULL,
    "realEstateInspectionReportId" UUID,

    CONSTRAINT "RE_Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_Order" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "isFullfilled" BOOLEAN NOT NULL,
    "paymentId" TEXT,
    "reAgentId" UUID,
    "totalOrderValue" INTEGER NOT NULL,

    CONSTRAINT "RE_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionReport" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "bookingId" UUID NOT NULL,
    "mechanicId" UUID NOT NULL,
    "odometer" INTEGER NOT NULL,
    "vehicleColor" TEXT NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "engineAndPeripherals" JSONB NOT NULL,
    "transmissionDrivetrain" JSONB NOT NULL,
    "bodyStructure" JSONB NOT NULL,
    "interior" JSONB NOT NULL,
    "suspensionAndBrakes" JSONB NOT NULL,
    "wheelsAndTires" JSONB NOT NULL,
    "finalChecks" JSONB NOT NULL,
    "additionalComments" TEXT NOT NULL,
    "recommendation" JSONB NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "InspectionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstateInspectionReport" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "propertyAddress" TEXT NOT NULL,
    "inspectorId" UUID NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "isAskingPriceCompetitive" BOOLEAN,
    "isLegalOrZoningIssues" BOOLEAN,
    "isImmediateRepairsNeeded" BOOLEAN,
    "isFutureDevelopmentPlans" BOOLEAN,
    "isParkingAvailable" BOOLEAN,
    "proximityToMajorRoads" TEXT,
    "propertyInfo" JSONB NOT NULL,
    "nearbyFacilities" JSONB NOT NULL,
    "additionalInfo" JSONB NOT NULL,
    "overallCondition" "PropertyCondition" NOT NULL,
    "crimeRate" "CrimeRate" NOT NULL,
    "neighborhoodVibe" "NeighborhoodVibe" NOT NULL,
    "additionalComments" TEXT,
    "reportUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateInspectionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionService" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "name" TEXT NOT NULL,

    CONSTRAINT "InspectionService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_InspectionService" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "name" TEXT NOT NULL,

    CONSTRAINT "RE_InspectionService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "price" INTEGER NOT NULL,
    "strikePrice" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "items" TEXT[],
    "perks" TEXT[],

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RE_Package" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "price" INTEGER NOT NULL,
    "strikePrice" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "items" TEXT[],
    "perks" TEXT[],

    CONSTRAINT "RE_Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerStripeData" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerId" UUID NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "CustomerStripeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPaymentIntent" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerStripeDataId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,

    CONSTRAINT "CustomerPaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPaymentMethod" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerStripeDataId" UUID NOT NULL,
    "stripeMethodId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "last4" TEXT,
    "brand" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerPaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "customerStripeDataId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "paymentMethodType" "PaymentMethodType" NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeChargeId" TEXT NOT NULL,

    CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderStripeData" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "serviceProviderId" UUID NOT NULL,

    CONSTRAINT "ServiceProviderStripeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectAccount" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "serviceProviderStripeDataId" UUID NOT NULL,
    "stripeConnectId" TEXT NOT NULL,
    "accountStatus" TEXT NOT NULL,
    "payoutsEnabled" BOOLEAN NOT NULL,
    "chargesEnabled" BOOLEAN NOT NULL,
    "detailsSubmitted" BOOLEAN NOT NULL,
    "businessUrl" TEXT,
    "abn" TEXT,

    CONSTRAINT "ConnectAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderBankAccount" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "serviceProviderStripeDataId" UUID NOT NULL,
    "stripeConnectId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "status" "BankVerificationStatus" NOT NULL,

    CONSTRAINT "ServiceProviderBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderPayout" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "serviceProviderStripeDataId" UUID NOT NULL,
    "stripePayoutId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ServiceProviderPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderDocument" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "serviceProviderStripeDataId" UUID NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "verificationType" "VerificationType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL,
    "stripePurpose" TEXT NOT NULL,

    CONSTRAINT "ServiceProviderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformStripeData" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "transactionType" "PlatformTransactionType" NOT NULL,

    CONSTRAINT "PlatformStripeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminStripeActionHistory" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "adminId" TEXT NOT NULL,
    "actionType" "AdminStripeActionType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminStripeActionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isPhoneVerified_idx" ON "User"("isPhoneVerified");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_phoneNumber_key" ON "User"("id", "phoneNumber");

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

-- CreateIndex
CREATE UNIQUE INDEX "ReAgentApprovalRequest_agentId_key" ON "ReAgentApprovalRequest"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "ReAgentApprovalRequest_status_id_experience_ABN_key" ON "ReAgentApprovalRequest"("status", "id", "experience", "ABN");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_userId_key" ON "Mechanic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_phoneNumber_key" ON "Mechanic"("phoneNumber");

-- CreateIndex
CREATE INDEX "Mechanic_available_idx" ON "Mechanic"("available");

-- CreateIndex
CREATE INDEX "Mechanic_id_idx" ON "Mechanic"("id");

-- CreateIndex
CREATE INDEX "Mechanic_phoneNumber_idx" ON "Mechanic"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_userId_phoneNumber_key" ON "Mechanic"("userId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRequest_mechanicId_key" ON "ApprovalRequest"("mechanicId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRequest_status_id_experience_ABN_key" ON "ApprovalRequest"("status", "id", "experience", "ABN");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phoneNumber_key" ON "Customer"("phoneNumber");

-- CreateIndex
CREATE INDEX "Customer_id_idx" ON "Customer"("id");

-- CreateIndex
CREATE INDEX "Customer_phoneNumber_idx" ON "Customer"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_phoneNumber_key" ON "Customer"("userId", "phoneNumber");

-- CreateIndex
CREATE INDEX "Address_zipcode_idx" ON "Address"("zipcode");

-- CreateIndex
CREATE INDEX "Address_suburb_idx" ON "Address"("suburb");

-- CreateIndex
CREATE UNIQUE INDEX "Address_street_suburb_city_zipcode_key" ON "Address"("street", "suburb", "city", "zipcode");

-- CreateIndex
CREATE INDEX "Vehicle_id_idx" ON "Vehicle"("id");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_idx" ON "Vehicle"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "PropSeller_email_key" ON "PropSeller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PropSeller_phoneNumber_key" ON "PropSeller"("phoneNumber");

-- CreateIndex
CREATE INDEX "PropSeller_email_idx" ON "PropSeller"("email");

-- CreateIndex
CREATE INDEX "PropSeller_phoneNumber_idx" ON "PropSeller"("phoneNumber");

-- CreateIndex
CREATE INDEX "Property_id_idx" ON "Property"("id");

-- CreateIndex
CREATE INDEX "Property_inspectionForId_idx" ON "Property"("inspectionForId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_vehicleId_key" ON "Booking"("vehicleId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_bookingId_key" ON "Order"("bookingId");

-- CreateIndex
CREATE INDEX "RE_Booking_status_idx" ON "RE_Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RE_Order_bookingId_key" ON "RE_Order"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReport_bookingId_key" ON "InspectionReport"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReport_mechanicId_key" ON "InspectionReport"("mechanicId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionService_name_key" ON "InspectionService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RE_InspectionService_name_key" ON "RE_InspectionService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RE_Package_name_key" ON "RE_Package"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerStripeData_customerId_key" ON "CustomerStripeData"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerStripeData_stripeCustomerId_key" ON "CustomerStripeData"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPaymentIntent_stripePaymentIntentId_key" ON "CustomerPaymentIntent"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPaymentMethod_stripeMethodId_key" ON "CustomerPaymentMethod"("stripeMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPayment_orderId_key" ON "CustomerPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderStripeData_serviceProviderId_key" ON "ServiceProviderStripeData"("serviceProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectAccount_serviceProviderStripeDataId_key" ON "ConnectAccount"("serviceProviderStripeDataId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectAccount_stripeConnectId_key" ON "ConnectAccount"("stripeConnectId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderBankAccount_serviceProviderStripeDataId_key" ON "ServiceProviderBankAccount"("serviceProviderStripeDataId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderPayout_serviceProviderStripeDataId_key" ON "ServiceProviderPayout"("serviceProviderStripeDataId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderDocument_serviceProviderStripeDataId_key" ON "ServiceProviderDocument"("serviceProviderStripeDataId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformStripeData_transactionId_key" ON "PlatformStripeData"("transactionId");

-- AddForeignKey
ALTER TABLE "RealEstateAgent" ADD CONSTRAINT "RealEstateAgent_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateAgent" ADD CONSTRAINT "RealEstateAgent_userId_phoneNumber_fkey" FOREIGN KEY ("userId", "phoneNumber") REFERENCES "User"("id", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReAgentApprovalRequest" ADD CONSTRAINT "ReAgentApprovalRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "RealEstateAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_userId_phoneNumber_fkey" FOREIGN KEY ("userId", "phoneNumber") REFERENCES "User"("id", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_phoneNumber_fkey" FOREIGN KEY ("userId", "phoneNumber") REFERENCES "User"("id", "phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicleAddressId_fkey" FOREIGN KEY ("vehicleAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_inspectionForId_fkey" FOREIGN KEY ("inspectionForId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_reBookingId_fkey" FOREIGN KEY ("reBookingId") REFERENCES "RE_Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "PropSeller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_propertyAddressId_fkey" FOREIGN KEY ("propertyAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_inspectionServiceId_fkey" FOREIGN KEY ("inspectionServiceId") REFERENCES "InspectionService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "RE_Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_inspectionServiceId_fkey" FOREIGN KEY ("inspectionServiceId") REFERENCES "RE_InspectionService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "RealEstateAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Booking" ADD CONSTRAINT "RE_Booking_realEstateInspectionReportId_fkey" FOREIGN KEY ("realEstateInspectionReportId") REFERENCES "RealEstateInspectionReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "RE_Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RE_Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RE_Order" ADD CONSTRAINT "RE_Order_reAgentId_fkey" FOREIGN KEY ("reAgentId") REFERENCES "RealEstateAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateInspectionReport" ADD CONSTRAINT "RealEstateInspectionReport_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "RealEstateAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStripeData" ADD CONSTRAINT "CustomerStripeData_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentIntent" ADD CONSTRAINT "CustomerPaymentIntent_customerStripeDataId_fkey" FOREIGN KEY ("customerStripeDataId") REFERENCES "CustomerStripeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentMethod" ADD CONSTRAINT "CustomerPaymentMethod_customerStripeDataId_fkey" FOREIGN KEY ("customerStripeDataId") REFERENCES "CustomerStripeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_customerStripeDataId_fkey" FOREIGN KEY ("customerStripeDataId") REFERENCES "CustomerStripeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderStripeData" ADD CONSTRAINT "ServiceProviderStripeData_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectAccount" ADD CONSTRAINT "ConnectAccount_serviceProviderStripeDataId_fkey" FOREIGN KEY ("serviceProviderStripeDataId") REFERENCES "ServiceProviderStripeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderBankAccount" ADD CONSTRAINT "ServiceProviderBankAccount_serviceProviderStripeDataId_fkey" FOREIGN KEY ("serviceProviderStripeDataId") REFERENCES "ServiceProviderStripeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderPayout" ADD CONSTRAINT "ServiceProviderPayout_serviceProviderStripeDataId_fkey" FOREIGN KEY ("serviceProviderStripeDataId") REFERENCES "ServiceProviderStripeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderDocument" ADD CONSTRAINT "ServiceProviderDocument_serviceProviderStripeDataId_fkey" FOREIGN KEY ("serviceProviderStripeDataId") REFERENCES "ServiceProviderStripeData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
