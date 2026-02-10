-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('QUARTERLY', 'ANNUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('DRAFT', 'COMPLETED', 'REVIEWED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OpportunityCategory" AS ENUM ('DEDUCTION', 'CREDIT', 'TIMING', 'EXPENSE_OPTIMIZATION');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FilingType" AS ENUM ('ECF', 'ETR', 'DARF', 'ANNUAL_RETURN', 'DECLARATION');

-- CreateEnum
CREATE TYPE "FilingStatus" AS ENUM ('PENDING', 'FILED', 'OVERDUE', 'EXEMPT');

-- CreateTable
CREATE TABLE "TaxAnalysis" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountantId" TEXT,
    "analysisType" "AnalysisType" NOT NULL,
    "quarter" INTEGER,
    "year" INTEGER NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxData" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "grossRevenue" BIGINT NOT NULL,
    "deductions" JSONB,
    "expenses" JSONB,
    "taxCredits" JSONB,
    "previousPayments" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxComparison" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "simplasNacional" JSONB NOT NULL,
    "lucroPresumido" JSONB NOT NULL,
    "lucroReal" JSONB NOT NULL,
    "recommendedRegime" "RegimeType" NOT NULL,
    "estimatedSavings" BIGINT NOT NULL,
    "analysisDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxOpportunity" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "category" "OpportunityCategory" NOT NULL,
    "opportunity" TEXT NOT NULL,
    "estimatedValue" BIGINT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "implementation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxFiling" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filingType" "FilingType" NOT NULL,
    "quarter" INTEGER,
    "year" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "FilingStatus" NOT NULL DEFAULT 'PENDING',
    "filedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxFiling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaxAnalysis_companyId_idx" ON "TaxAnalysis"("companyId");

-- CreateIndex
CREATE INDEX "TaxAnalysis_accountantId_idx" ON "TaxAnalysis"("accountantId");

-- CreateIndex
CREATE INDEX "TaxAnalysis_status_idx" ON "TaxAnalysis"("status");

-- CreateIndex
CREATE INDEX "TaxAnalysis_year_idx" ON "TaxAnalysis"("year");

-- CreateIndex
CREATE UNIQUE INDEX "TaxAnalysis_companyId_analysisType_quarter_year_key" ON "TaxAnalysis"("companyId", "analysisType", "quarter", "year");

-- CreateIndex
CREATE UNIQUE INDEX "TaxData_analysisId_key" ON "TaxData"("analysisId");

-- CreateIndex
CREATE INDEX "TaxData_analysisId_idx" ON "TaxData"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxComparison_analysisId_key" ON "TaxComparison"("analysisId");

-- CreateIndex
CREATE INDEX "TaxComparison_analysisId_idx" ON "TaxComparison"("analysisId");

-- CreateIndex
CREATE INDEX "TaxOpportunity_analysisId_idx" ON "TaxOpportunity"("analysisId");

-- CreateIndex
CREATE INDEX "TaxOpportunity_category_idx" ON "TaxOpportunity"("category");

-- CreateIndex
CREATE INDEX "TaxFiling_companyId_idx" ON "TaxFiling"("companyId");

-- CreateIndex
CREATE INDEX "TaxFiling_status_idx" ON "TaxFiling"("status");

-- CreateIndex
CREATE INDEX "TaxFiling_dueDate_idx" ON "TaxFiling"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaxFiling_companyId_filingType_quarter_year_key" ON "TaxFiling"("companyId", "filingType", "quarter", "year");

-- AddForeignKey
ALTER TABLE "TaxAnalysis" ADD CONSTRAINT "TaxAnalysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAnalysis" ADD CONSTRAINT "TaxAnalysis_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxData" ADD CONSTRAINT "TaxData_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "TaxAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxComparison" ADD CONSTRAINT "TaxComparison_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "TaxAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxOpportunity" ADD CONSTRAINT "TaxOpportunity_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "TaxAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxFiling" ADD CONSTRAINT "TaxFiling_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
