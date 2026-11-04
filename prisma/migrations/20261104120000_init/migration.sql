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
    "name" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'INDEPENDENT',
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
    "hourlyRateSek" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "nextAvailableAt" DATETIME,
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
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WorkshopServicePrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workshopId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "fixedPriceSek" INTEGER NOT NULL,
    "partsPriceSek" INTEGER NOT NULL,
    "noteSv" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkshopServicePrice_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkshopServicePrice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "StandardService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regnr" TEXT,
    "serviceType" TEXT NOT NULL,
    "rawText" TEXT,
    "quotedHours" REAL,
    "quotedLaborSek" INTEGER NOT NULL,
    "quotedPartsSek" INTEGER NOT NULL,
    "benchmarkHours" REAL,
    "benchmarkTotalSek" INTEGER,
    "verdict" TEXT NOT NULL,
    "adviceSv" TEXT NOT NULL,
    "aiModel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteAudit_regnr_fkey" FOREIGN KEY ("regnr") REFERENCES "Vehicle" ("regnr") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workshopId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "regnr" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "preferredDate" DATETIME NOT NULL,
    "messageSv" TEXT,
    "quotedTotalSek" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SKICKAD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookingRequest_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookingRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "StandardService" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookingRequest_regnr_fkey" FOREIGN KEY ("regnr") REFERENCES "Vehicle" ("regnr") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_regnr_key" ON "Vehicle"("regnr");

-- CreateIndex
CREATE INDEX "Workshop_municipality_idx" ON "Workshop"("municipality");

-- CreateIndex
CREATE INDEX "Workshop_postalCode_idx" ON "Workshop"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "StandardService_slug_key" ON "StandardService"("slug");

-- CreateIndex
CREATE INDEX "WorkshopServicePrice_serviceId_idx" ON "WorkshopServicePrice"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopServicePrice_workshopId_serviceId_key" ON "WorkshopServicePrice"("workshopId", "serviceId");

-- CreateIndex
CREATE INDEX "QuoteAudit_regnr_idx" ON "QuoteAudit"("regnr");

-- CreateIndex
CREATE INDEX "BookingRequest_workshopId_idx" ON "BookingRequest"("workshopId");

-- CreateIndex
CREATE INDEX "BookingRequest_regnr_idx" ON "BookingRequest"("regnr");
