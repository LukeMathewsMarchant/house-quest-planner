-- Add profile and progress fields to Progress table
-- Run: psql -d homebuyersHandbook -f db/migrations/001_add_progress_profile_fields.sql

ALTER TABLE "Progress" ADD COLUMN IF NOT EXISTS "MonthlyIncome" INTEGER;
ALTER TABLE "Progress" ADD COLUMN IF NOT EXISTS "MonthlyExpenses" INTEGER;
ALTER TABLE "Progress" ADD COLUMN IF NOT EXISTS "TimeHorizon" VARCHAR(50);
ALTER TABLE "Progress" ADD COLUMN IF NOT EXISTS "DesiredZipCodes" TEXT;
