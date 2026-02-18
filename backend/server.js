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

// Upsert progress (profile save). ContributionGoal = Budget * (DownPaymentPercentage/100)
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
    } = req.body;
    const contributionGoal =
      budget != null && downPaymentPercentage != null
        ? (Number(budget) * Number(downPaymentPercentage)) / 100
        : null;
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
        "ContributionGoal" = COALESCE($6, "Progress"."ContributionGoal",
          CASE WHEN "Progress"."Budget" IS NOT NULL AND "Progress"."DownPaymentPercentage" IS NOT NULL
            THEN "Progress"."Budget" * "Progress"."DownPaymentPercentage" / 100
            ELSE NULL END),
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
