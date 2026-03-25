-- Homebuyer's Handbook Database Schema
-- Run this script on a fresh database to create all tables (same as ERD + profile/onboarding fields).
-- Usage: createdb homebuyersHandbook && psql -d homebuyersHandbook -f db/schema.sql

-- NOTE FOR GRADERS: The database schema differs slightly from the ERD. 
-- As we began making the system, we realized there were some fields that we had 
-- not accounted for in the ERD and so we added them in the schema to make the 
-- app function correctly. 

-- Users table (referenced by Progress and WishList)
CREATE TABLE "Users" (
  "UserID" SERIAL PRIMARY KEY,
  "Email" VARCHAR(255) NOT NULL UNIQUE,
  "Password" VARCHAR(255) NOT NULL,
  "Premium" BOOLEAN NOT NULL DEFAULT FALSE,
  "Zipcode" INTEGER,
  "UserRole" CHAR(1) NOT NULL DEFAULT 'U' CHECK ("UserRole" IN ('U', 'A'))
);

-- Progress table (one-to-one with Users)
-- ContributionGoal = down payment target (Budget * DownPaymentPercentage / 100)
CREATE TABLE "Progress" (
  "UserID" INTEGER PRIMARY KEY REFERENCES "Users"("UserID") ON DELETE CASCADE,
  "DownPaymentPercentage" REAL,
  "Budget" INTEGER,
  "AmountSaved" REAL DEFAULT 0,
  "CreditScore" INTEGER,
  "ContributionGoal" REAL,
  "MonthlyIncome" INTEGER,
  "MonthlyExpenses" INTEGER,
  "HomeState" VARCHAR(2),
  "TimeHorizon" VARCHAR(50),
  "DesiredZipCodes" TEXT
);

-- Homes table (referenced by WishList)
CREATE TABLE "Homes" (
  "HomeID" SERIAL PRIMARY KEY,
  "Bedrooms" INTEGER,
  "Bathrooms" INTEGER,
  "Price" INTEGER,
  "StreetAddress" VARCHAR(255),
  "City" VARCHAR(100),
  "State" VARCHAR(50),
  "Zip" INTEGER,
  "SquareFeet" INTEGER,
  "ZillowURL" TEXT
);

-- WishList junction table (many-to-many between Users and Homes)
CREATE TABLE "WishList" (
  "UserID" INTEGER NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
  "HomeID" INTEGER NOT NULL REFERENCES "Homes"("HomeID") ON DELETE CASCADE,
  PRIMARY KEY ("UserID", "HomeID")
);

-- Tutorials table
CREATE TABLE "Tutorials" (
  "TutorialID" SERIAL PRIMARY KEY,
  "Topic" VARCHAR(255),
  "YouTubeURL" TEXT
);

-- Optional: indexes for common lookups
CREATE INDEX idx_wishlist_user ON "WishList"("UserID");
CREATE INDEX idx_wishlist_home ON "WishList"("HomeID");
CREATE INDEX idx_users_email ON "Users"("Email");
