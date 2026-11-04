-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "regnr" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT,
    "year" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT,
    "engineCode" TEXT,
    "nextInspection" TIMESTAMP(3),
    "dataSource" TEXT NOT NULL DEFAULT 'mock',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'INDEPENDENT',
    "tier" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "isGodkandBilverkstad" BOOLEAN NOT NULL DEFAULT false,
    "isMrf" BOOLEAN NOT NULL DEFAULT false,
    "isAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "authorizedMakes" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleSv" TEXT NOT NULL,
    "descriptionSv" TEXT,
    "category" TEXT NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL,
    "typicalPartsSek" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandardService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteAudit" (
    "id" TEXT NOT NULL,
    "regnr" TEXT,
    "workshopId" TEXT,
    "serviceType" TEXT NOT NULL,
    "rawText" TEXT,
    "quotedHours" DOUBLE PRECISION,
    "quotedLaborSek" INTEGER NOT NULL,
    "quotedPartsSek" INTEGER NOT NULL,
    "benchmarkHours" DOUBLE PRECISION,
    "benchmarkLowSek" INTEGER NOT NULL,
    "benchmarkTotalSek" INTEGER NOT NULL,
    "benchmarkHighSek" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "suspectedUpsell" BOOLEAN NOT NULL DEFAULT false,
    "adviceSv" TEXT NOT NULL,
    "aiModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_regnr_key" ON "Vehicle"("regnr");

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_slug_key" ON "Workshop"("slug");

-- CreateIndex
CREATE INDEX "Workshop_municipality_idx" ON "Workshop"("municipality");

-- CreateIndex
CREATE INDEX "Workshop_postalCode_idx" ON "Workshop"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "StandardService_slug_key" ON "StandardService"("slug");

-- CreateIndex
CREATE INDEX "QuoteAudit_regnr_idx" ON "QuoteAudit"("regnr");

-- CreateIndex
CREATE INDEX "QuoteAudit_workshopId_serviceType_idx" ON "QuoteAudit"("workshopId", "serviceType");

-- AddForeignKey
ALTER TABLE "QuoteAudit" ADD CONSTRAINT "QuoteAudit_regnr_fkey" FOREIGN KEY ("regnr") REFERENCES "Vehicle"("regnr") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteAudit" ADD CONSTRAINT "QuoteAudit_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
