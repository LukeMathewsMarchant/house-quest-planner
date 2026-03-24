-- Add home state to Progress table for rate lookups
-- Run: psql -d homebuyersHandbook -f db/migrations/003_add_progress_home_state.sql

ALTER TABLE "Progress" ADD COLUMN IF NOT EXISTS "HomeState" VARCHAR(2);

