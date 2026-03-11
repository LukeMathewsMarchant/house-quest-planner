import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT ?? 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:8080" }));
app.use(express.json());

function getUserId(req, res, next) {
  const id = req.headers["x-user-id"];
  if (!id || isNaN(Number(id))) {
    return res.status(401).json({ error: "User ID required" });
  }
  req.userId = Number(id);
  next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/users", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT "UserID", "Email", "Premium", "Zipcode", "UserRole" FROM "Users"'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Register: create account (UserRole and Premium use DB defaults: U, false)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, zipcode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO "Users" ("Email", "Password", "Zipcode")
       VALUES ($1, $2, $3)
       RETURNING "UserID", "Email", "Premium", "Zipcode", "UserRole"`,
      [email.trim().toLowerCase(), hashed, zipcode ? Number(zipcode) : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Login: validate credentials, return user (no password)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const { rows } = await pool.query(
      'SELECT "UserID", "Email", "Password", "Premium", "Zipcode", "UserRole" FROM "Users" WHERE "Email" = $1',
      [email.trim().toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const { Password: _p, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

// Get current user's progress (creates row with defaults if missing)
app.get("/api/progress", getUserId, async (req, res) => {
  try {
    let { rows } = await pool.query(
      `SELECT "UserID", "DownPaymentPercentage", "Budget", "AmountSaved", "CreditScore",
              "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "TimeHorizon", "DesiredZipCodes"
       FROM "Progress" WHERE "UserID" = $1`,
      [req.userId]
    );
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO "Progress" ("UserID") VALUES ($1)
         ON CONFLICT ("UserID") DO NOTHING`,
        [req.userId]
      );
      const r = await pool.query(
        `SELECT "UserID", "DownPaymentPercentage", "Budget", "AmountSaved", "CreditScore",
                "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "TimeHorizon", "DesiredZipCodes"
         FROM "Progress" WHERE "UserID" = $1`,
        [req.userId]
      );
      rows = r.rows;
    }
    const row = rows[0] || {};
    res.json({
      userId: row.UserID,
      downPaymentPercentage: row.DownPaymentPercentage ?? null,
      budget: row.Budget ?? null,
      amountSaved: row.AmountSaved ?? 0,
      creditScore: row.CreditScore ?? null,
      contributionGoal: row.ContributionGoal ?? null,
      monthlyIncome: row.MonthlyIncome ?? null,
      monthlyExpenses: row.MonthlyExpenses ?? null,
      timeHorizon: row.TimeHorizon ?? null,
      desiredZipCodes: row.DesiredZipCodes ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Upsert progress (profile save).
// In this schema, ContributionGoal represents the user's monthly contribution
// toward their down payment (used for affordability timelines).
app.put("/api/progress", getUserId, async (req, res) => {
  try {
    const {
      budget,
      downPaymentPercentage,
      amountSaved,
      creditScore,
      monthlyIncome,
      monthlyExpenses,
      timeHorizon,
      desiredZipCodes,
      contributionGoal,
    } = req.body;
    await pool.query(
      `INSERT INTO "Progress" (
        "UserID", "Budget", "DownPaymentPercentage", "AmountSaved", "CreditScore",
        "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "TimeHorizon", "DesiredZipCodes"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT ("UserID") DO UPDATE SET
        "Budget" = COALESCE(EXCLUDED."Budget", "Progress"."Budget"),
        "DownPaymentPercentage" = COALESCE(EXCLUDED."DownPaymentPercentage", "Progress"."DownPaymentPercentage"),
        "AmountSaved" = COALESCE(EXCLUDED."AmountSaved", "Progress"."AmountSaved"),
        "CreditScore" = COALESCE(EXCLUDED."CreditScore", "Progress"."CreditScore"),
        "ContributionGoal" = COALESCE(EXCLUDED."ContributionGoal", "Progress"."ContributionGoal"),
        "MonthlyIncome" = COALESCE(EXCLUDED."MonthlyIncome", "Progress"."MonthlyIncome"),
        "MonthlyExpenses" = COALESCE(EXCLUDED."MonthlyExpenses", "Progress"."MonthlyExpenses"),
        "TimeHorizon" = COALESCE(EXCLUDED."TimeHorizon", "Progress"."TimeHorizon"),
        "DesiredZipCodes" = COALESCE(EXCLUDED."DesiredZipCodes", "Progress"."DesiredZipCodes")`,
      [
        req.userId,
        budget ?? null,
        downPaymentPercentage ?? null,
        amountSaved ?? null,
        creditScore ?? null,
        contributionGoal,
        monthlyIncome ?? null,
        monthlyExpenses ?? null,
        timeHorizon ?? null,
        desiredZipCodes ?? null,
      ]
    );
    const { rows } = await pool.query(
      `SELECT "UserID", "DownPaymentPercentage", "Budget", "AmountSaved", "CreditScore",
              "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "TimeHorizon", "DesiredZipCodes"
       FROM "Progress" WHERE "UserID" = $1`,
      [req.userId]
    );
    const row = rows[0];
    res.json({
      userId: row.UserID,
      downPaymentPercentage: row.DownPaymentPercentage ?? null,
      budget: row.Budget ?? null,
      amountSaved: row.AmountSaved ?? 0,
      creditScore: row.CreditScore ?? null,
      contributionGoal: row.ContributionGoal ?? null,
      monthlyIncome: row.MonthlyIncome ?? null,
      monthlyExpenses: row.MonthlyExpenses ?? null,
      timeHorizon: row.TimeHorizon ?? null,
      desiredZipCodes: row.DesiredZipCodes ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// Add a contribution (increments AmountSaved)
app.post("/api/progress/contribution", getUserId, async (req, res) => {
  try {
    const { amount } = req.body;
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    await pool.query(
      `INSERT INTO "Progress" ("UserID", "AmountSaved") VALUES ($1, $2)
       ON CONFLICT ("UserID") DO UPDATE SET "AmountSaved" = COALESCE("Progress"."AmountSaved", 0) + $2`,
      [req.userId, num]
    );
    const { rows } = await pool.query(
      'SELECT "AmountSaved", "ContributionGoal" FROM "Progress" WHERE "UserID" = $1',
      [req.userId]
    );
    const row = rows[0] || {};
    res.json({
      amountSaved: Number(row.AmountSaved ?? 0),
      contributionGoal: row.ContributionGoal ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contribution" });
  }
});

// Create a home and link to user's wishlist
app.post("/api/homes", getUserId, async (req, res) => {
  try {
    const {
      zillowUrl,
      streetAddress,
      city,
      state,
      zip,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
    } = req.body;

    const homeResult = await pool.query(
      `INSERT INTO "Homes" (
        "StreetAddress", "City", "State", "Zip",
        "Price", "Bedrooms", "Bathrooms", "SquareFeet", "ZillowURL"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING "HomeID", "StreetAddress", "City", "State", "Zip",
                "Price", "Bedrooms", "Bathrooms", "SquareFeet", "ZillowURL"`,
      [
        streetAddress,
        city,
        state,
        zip ? Number(zip) : null,
        price ? Number(price) : null,
        bedrooms ? Number(bedrooms) : null,
        bathrooms ? Number(bathrooms) : null,
        squareFeet ? Number(squareFeet) : null,
        zillowUrl || null,
      ]
    );

    const home = homeResult.rows[0];

    await pool.query(
      `INSERT INTO "WishList" ("UserID", "HomeID")
       VALUES ($1, $2)
       ON CONFLICT ("UserID", "HomeID") DO NOTHING`,
      [req.userId, home.HomeID]
    );

    res.status(201).json(home);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save home" });
  }
});

// Get all homes in the current user's wishlist
app.get("/api/wishlist/:userId", getUserId, async (req, res) => {
  try {
    const routeUserId = Number(req.params.userId);
    if (Number.isNaN(routeUserId) || routeUserId !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { rows } = await pool.query(
      `SELECT h."HomeID", h."StreetAddress", h."City", h."State", h."Zip",
              h."Price", h."Bedrooms", h."Bathrooms", h."SquareFeet", h."ZillowURL"
       FROM "WishList" w
       JOIN "Homes" h ON h."HomeID" = w."HomeID"
       WHERE w."UserID" = $1
       ORDER BY h."Price" DESC NULLS LAST, h."HomeID" DESC`,
      [req.userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load saved homes" });
  }
});

// Get detailed home data by id
app.get("/api/homes/:homeId", async (req, res) => {
  try {
    const homeId = Number(req.params.homeId);
    if (Number.isNaN(homeId)) {
      return res.status(400).json({ error: "Invalid home id" });
    }

    const { rows } = await pool.query(
      `SELECT "HomeID", "StreetAddress", "City", "State", "Zip",
              "Price", "Bedrooms", "Bathrooms", "SquareFeet", "ZillowURL"
       FROM "Homes"
       WHERE "HomeID" = $1`,
      [homeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Home not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load home" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
