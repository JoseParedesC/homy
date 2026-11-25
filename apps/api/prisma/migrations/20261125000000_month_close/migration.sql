-- CreateTable
CREATE TABLE "MonthClose" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedBy" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    CONSTRAINT "MonthClose_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "MonthClose_month_key" ON "MonthClose"("month");
