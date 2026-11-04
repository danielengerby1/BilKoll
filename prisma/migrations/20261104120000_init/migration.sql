-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regnr" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT,
    "year" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT,
    "engineCode" TEXT,
    "nextInspection" DATETIME,
    "dataSource" TEXT NOT NULL DEFAULT 'mock',
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'INDEPENDENT',
    "tier" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "isGodkandBilverkstad" BOOLEAN NOT NULL DEFAULT false,
    "isMrf" BOOLEAN NOT NULL DEFAULT false,
    "isAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "authorizedMakes" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "verifiedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StandardService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleSv" TEXT NOT NULL,
    "descriptionSv" TEXT,
    "category" TEXT NOT NULL,
    "estimatedHours" REAL NOT NULL,
    "typicalPartsSek" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "QuoteAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regnr" TEXT,
    "workshopId" TEXT,
    "serviceType" TEXT NOT NULL,
    "rawText" TEXT,
    "quotedHours" REAL,
    "quotedLaborSek" INTEGER NOT NULL,
    "quotedPartsSek" INTEGER NOT NULL,
    "benchmarkHours" REAL,
    "benchmarkLowSek" INTEGER NOT NULL,
    "benchmarkTotalSek" INTEGER NOT NULL,
    "benchmarkHighSek" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "suspectedUpsell" BOOLEAN NOT NULL DEFAULT false,
    "adviceSv" TEXT NOT NULL,
    "aiModel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteAudit_regnr_fkey" FOREIGN KEY ("regnr") REFERENCES "Vehicle" ("regnr") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuoteAudit_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
