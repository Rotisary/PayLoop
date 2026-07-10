-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "merchantId" UUID NOT NULL,
    "environment" "Environment" NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "externalProductId" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT NOT NULL,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_merchantId_environment_idx" ON "Product"("merchantId", "environment");

-- CreateIndex
CREATE INDEX "Product_merchantId_externalProductId_idx" ON "Product"("merchantId", "externalProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_merchantId_environment_externalProductId_key" ON "Product"("merchantId", "environment", "externalProductId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
