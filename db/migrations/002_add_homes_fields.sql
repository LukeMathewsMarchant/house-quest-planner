-- Add Saved Homes fields to Homes table for existing databases
-- Run: psql -d homebuyersHandbook -f db/migrations/002_add_homes_fields.sql

ALTER TABLE "Homes" ADD COLUMN IF NOT EXISTS "SquareFeet" INTEGER;
ALTER TABLE "Homes" ADD COLUMN IF NOT EXISTS "ZillowURL" TEXT;

