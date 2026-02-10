-- CreateEnum
CREATE TYPE "CompanyAccountantRole" AS ENUM ('ADVISOR', 'MANAGER');

-- CreateEnum
CREATE TYPE "AccountantAuditAction" AS ENUM ('ASSIGNED', 'REMOVED', 'PROFILE_UPDATED', 'AVAILABILITY_CHANGED', 'REASSIGNED');

-- CreateTable
CREATE TABLE "AccountantProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "specializations" TEXT[],
    "bio" TEXT,
    "yearsOfExperience" INTEGER NOT NULL,
    "hourlyRate" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxClients" INTEGER NOT NULL DEFAULT 10,
    "currentClientCount" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "certifications" JSONB,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAccountant" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountantId" TEXT NOT NULL,
    "role" "CompanyAccountantRole" NOT NULL DEFAULT 'ADVISOR',
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAccountant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountantAuditLog" (
    "id" TEXT NOT NULL,
    "accountantId" TEXT NOT NULL,
    "action" "AccountantAuditAction" NOT NULL,
    "companyId" TEXT,
    "performedBy" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountantAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountantProfile_userId_key" ON "AccountantProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountantProfile_licenseNumber_key" ON "AccountantProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "AccountantProfile_userId_idx" ON "AccountantProfile"("userId");

-- CreateIndex
CREATE INDEX "AccountantProfile_licenseNumber_idx" ON "AccountantProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "AccountantProfile_isAvailable_idx" ON "AccountantProfile"("isAvailable");

-- CreateIndex
CREATE INDEX "CompanyAccountant_accountantId_idx" ON "CompanyAccountant"("accountantId");

-- CreateIndex
CREATE INDEX "CompanyAccountant_assignedBy_idx" ON "CompanyAccountant"("assignedBy");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAccountant_companyId_accountantId_key" ON "CompanyAccountant"("companyId", "accountantId");

-- CreateIndex
CREATE INDEX "AccountantAuditLog_accountantId_idx" ON "AccountantAuditLog"("accountantId");

-- CreateIndex
CREATE INDEX "AccountantAuditLog_performedBy_idx" ON "AccountantAuditLog"("performedBy");

-- CreateIndex
CREATE INDEX "AccountantAuditLog_createdAt_idx" ON "AccountantAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AccountantProfile" ADD CONSTRAINT "AccountantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAccountant" ADD CONSTRAINT "CompanyAccountant_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAccountant" ADD CONSTRAINT "CompanyAccountant_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAccountant" ADD CONSTRAINT "CompanyAccountant_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountantAuditLog" ADD CONSTRAINT "AccountantAuditLog_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "AccountantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountantAuditLog" ADD CONSTRAINT "AccountantAuditLog_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
