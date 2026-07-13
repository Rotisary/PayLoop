-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'PAST_DUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL,
    "merchantId" UUID NOT NULL,
    "environment" "Environment" NOT NULL,
    "customerId" UUID NOT NULL,
    "mandateId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "billingInterval" "BillingInterval" NOT NULL,
    "nextChargeDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToSubscription" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductToSubscription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_mandateId_key" ON "Subscription"("mandateId");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_environment_idx" ON "Subscription"("merchantId", "environment");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_environment_status_idx" ON "Subscription"("merchantId", "environment", "status");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_environment_nextChargeDate_idx" ON "Subscription"("merchantId", "environment", "nextChargeDate");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE INDEX "_ProductToSubscription_B_index" ON "_ProductToSubscription"("B");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_mandateId_fkey" FOREIGN KEY ("mandateId") REFERENCES "Mandate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSubscription" ADD CONSTRAINT "_ProductToSubscription_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSubscription" ADD CONSTRAINT "_ProductToSubscription_B_fkey" FOREIGN KEY ("B") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
