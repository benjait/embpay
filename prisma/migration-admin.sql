-- EmbPay Admin + License Key Migration
-- Run this in Supabase SQL Editor
-- Date: 2026-02-11

-- ═══════════════════════════════════════════════
-- 1. UPDATE EXISTING TABLES
-- ═══════════════════════════════════════════════

-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'merchant';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspended" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT;

-- Add new columns to Product table
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "licensePrefix" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "maxActivations" INTEGER DEFAULT 1;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "licenseDurationDays" INTEGER;

-- ═══════════════════════════════════════════════
-- 2. LICENSE KEY SYSTEM
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "LicenseKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "maxActivations" INTEGER NOT NULL DEFAULT 1,
    "currentActivations" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    
    CONSTRAINT "LicenseKey_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LicenseKey_key_key" UNIQUE ("key"),
    CONSTRAINT "LicenseKey_orderId_key" UNIQUE ("orderId"),
    CONSTRAINT "LicenseKey_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT,
    CONSTRAINT "LicenseKey_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT,
    CONSTRAINT "LicenseKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "LicenseKey_key_idx" ON "LicenseKey"("key");
CREATE INDEX IF NOT EXISTS "LicenseKey_customerEmail_idx" ON "LicenseKey"("customerEmail");
CREATE INDEX IF NOT EXISTS "LicenseKey_userId_idx" ON "LicenseKey"("userId");

CREATE TABLE IF NOT EXISTS "LicenseActivation" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "licenseId" TEXT NOT NULL,
    
    CONSTRAINT "LicenseActivation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LicenseActivation_licenseId_machineId_key" UNIQUE ("licenseId", "machineId"),
    CONSTRAINT "LicenseActivation_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "LicenseKey"("id") ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════
-- 3. API KEYS
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'embp_live_sk',
    "lastUsed" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scopes" TEXT NOT NULL DEFAULT 'read,verify',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    
    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ApiKey_key_key" UNIQUE ("key"),
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ApiKey_key_idx" ON "ApiKey"("key");

-- ═══════════════════════════════════════════════
-- 4. ADMIN TABLES
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

CREATE TABLE IF NOT EXISTS "PlatformMetric" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalGmv" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "newOrders" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "totalLicenses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "PlatformMetric_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlatformMetric_date_key" UNIQUE ("date")
);

-- ═══════════════════════════════════════════════
-- 5. SET YOUR USER AS SUPERADMIN
-- Replace 'YOUR_USER_ID' with your actual Supabase auth user ID
-- ═══════════════════════════════════════════════

-- IMPORTANT: Run this after the migration!
-- Find your user ID first:
-- SELECT id, email FROM "User";
-- Then uncomment and run:
-- UPDATE "User" SET "role" = 'superadmin' WHERE email = 'YOUR_EMAIL_HERE';

-- ═══════════════════════════════════════════════
-- DONE! 🎉
-- ═══════════════════════════════════════════════
