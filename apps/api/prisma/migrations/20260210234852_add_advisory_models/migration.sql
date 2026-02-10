-- CreateEnum
CREATE TYPE "AdvisoryType" AS ENUM ('TAX_REVIEW', 'GENERAL_ADVISORY');

-- CreateEnum
CREATE TYPE "AdvisoryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'REVIEWED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('APPROVED', 'NEEDS_REVISION', 'REJECTED');

-- CreateTable
CREATE TABLE "AdvisoryRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "analysisId" TEXT,
    "requestedById" TEXT NOT NULL,
    "requestType" "AdvisoryType" NOT NULL,
    "description" TEXT,
    "status" "AdvisoryStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAccountantId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "AdvisoryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisoryReview" (
    "id" TEXT NOT NULL,
    "advisoryId" TEXT NOT NULL,
    "reviewerAccountantId" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "recommendations" TEXT[],
    "reviewStatus" "ReviewStatus" NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvisoryReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdvisoryRequest_companyId_idx" ON "AdvisoryRequest"("companyId");

-- CreateIndex
CREATE INDEX "AdvisoryRequest_status_idx" ON "AdvisoryRequest"("status");

-- CreateIndex
CREATE INDEX "AdvisoryRequest_assignedAccountantId_idx" ON "AdvisoryRequest"("assignedAccountantId");

-- CreateIndex
CREATE INDEX "AdvisoryRequest_createdAt_idx" ON "AdvisoryRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdvisoryRequest_analysisId_key" ON "AdvisoryRequest"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvisoryReview_advisoryId_key" ON "AdvisoryReview"("advisoryId");

-- CreateIndex
CREATE INDEX "AdvisoryReview_advisoryId_idx" ON "AdvisoryReview"("advisoryId");

-- CreateIndex
CREATE INDEX "AdvisoryReview_reviewerAccountantId_idx" ON "AdvisoryReview"("reviewerAccountantId");

-- AddForeignKey
ALTER TABLE "AdvisoryRequest" ADD CONSTRAINT "AdvisoryRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisoryRequest" ADD CONSTRAINT "AdvisoryRequest_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "TaxAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisoryRequest" ADD CONSTRAINT "AdvisoryRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisoryRequest" ADD CONSTRAINT "AdvisoryRequest_assignedAccountantId_fkey" FOREIGN KEY ("assignedAccountantId") REFERENCES "AccountantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisoryReview" ADD CONSTRAINT "AdvisoryReview_advisoryId_fkey" FOREIGN KEY ("advisoryId") REFERENCES "AdvisoryRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisoryReview" ADD CONSTRAINT "AdvisoryReview_reviewerAccountantId_fkey" FOREIGN KEY ("reviewerAccountantId") REFERENCES "AccountantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
