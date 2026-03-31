-- Add custom title to saved homes for easier scanning/search
-- Run: psql -d homebuyersHandbook -f db/migrations/004_add_homes_title.sql

ALTER TABLE "Homes" ADD COLUMN IF NOT EXISTS "Title" VARCHAR(120);
