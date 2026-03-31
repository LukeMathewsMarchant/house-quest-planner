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

const ratesCache = new Map();
const RATES_CACHE_TTL_MS = 10 * 60 * 1000;

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:8080" }));
app.use(express.json());

function getFicoTierIndex(score) {
  if (score == null || Number.isNaN(Number(score))) return 2; // middle bucket fallback
  const s = Number(score);
  if (s >= 780) return 1;
  if (s >= 760) return 2;
  if (s >= 740) return 3;
  if (s >= 700) return 4;
  return 5; // 680-699 / lower-bound fallback
}

function getLtvTierIndex(downPaymentPercentage) {
  if (downPaymentPercentage == null || Number.isNaN(Number(downPaymentPercentage))) return 2;
  // Lower down payment % => higher LTV (riskier)
  return Number(downPaymentPercentage) >= 25 ? 1 : 2; // map to 75% or 95% tier
}

function estimateFallbackRates({ creditScore, downPaymentPercentage, state }) {
  // Baseline 30-year fixed estimate anchor; intentionally conservative.
  const baseRate = 6.75;

  const score = Number(creditScore ?? 720);
  let ficoAdj = 0;
  if (score >= 780) ficoAdj = -0.45;
  else if (score >= 760) ficoAdj = -0.3;
  else if (score >= 740) ficoAdj = -0.15;
  else if (score >= 720) ficoAdj = 0;
  else if (score >= 700) ficoAdj = 0.2;
  else if (score >= 680) ficoAdj = 0.45;
  else ficoAdj = 0.9;

  const dp = Number(downPaymentPercentage ?? 10);
  let ltvAdj = 0;
  if (dp >= 25) ltvAdj = -0.15;
  else if (dp >= 20) ltvAdj = -0.05;
  else if (dp >= 15) ltvAdj = 0.05;
  else if (dp >= 10) ltvAdj = 0.2;
  else if (dp >= 5) ltvAdj = 0.4;
  else ltvAdj = 0.65;

  // Small regional spread adjustment.
  const stateAdjMap = {
    CA: -0.05,
    WA: -0.03,
    OR: -0.02,
    TX: 0.03,
    FL: 0.05,
    NY: 0.06,
  };
  const stateAdj = state ? stateAdjMap[state] ?? 0 : 0;

  const mid = baseRate + ficoAdj + ltvAdj + stateAdj;
  const spread = score >= 740 ? 0.25 : 0.35;
  const lowRate = Math.max(2.5, Number((mid - spread).toFixed(3)));
  const highRate = Number((mid + spread).toFixed(3));

  return {
    state: state ?? "US",
    lowRate,
    highRate,
    sampleCount: 0,
    asOf: new Date().toISOString().slice(0, 10),
    source: "fallback_estimator",
    isFallback: true,
  };
}

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
              "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "HomeState", "TimeHorizon", "DesiredZipCodes"
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
                "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "HomeState", "TimeHorizon", "DesiredZipCodes"
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
      homeState: row.HomeState ?? null,
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
      homeState,
      timeHorizon,
      desiredZipCodes,
      contributionGoal,
    } = req.body;
    await pool.query(
      `INSERT INTO "Progress" (
        "UserID", "Budget", "DownPaymentPercentage", "AmountSaved", "CreditScore",
        "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "HomeState", "TimeHorizon", "DesiredZipCodes"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT ("UserID") DO UPDATE SET
        "Budget" = COALESCE(EXCLUDED."Budget", "Progress"."Budget"),
        "DownPaymentPercentage" = COALESCE(EXCLUDED."DownPaymentPercentage", "Progress"."DownPaymentPercentage"),
        "AmountSaved" = COALESCE(EXCLUDED."AmountSaved", "Progress"."AmountSaved"),
        "CreditScore" = COALESCE(EXCLUDED."CreditScore", "Progress"."CreditScore"),
        "ContributionGoal" = COALESCE(EXCLUDED."ContributionGoal", "Progress"."ContributionGoal"),
        "MonthlyIncome" = COALESCE(EXCLUDED."MonthlyIncome", "Progress"."MonthlyIncome"),
        "MonthlyExpenses" = COALESCE(EXCLUDED."MonthlyExpenses", "Progress"."MonthlyExpenses"),
        "HomeState" = COALESCE(EXCLUDED."HomeState", "Progress"."HomeState"),
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
        homeState ? String(homeState).toUpperCase().slice(0, 2) : null,
        timeHorizon ?? null,
        desiredZipCodes ?? null,
      ]
    );
    const { rows } = await pool.query(
      `SELECT "UserID", "DownPaymentPercentage", "Budget", "AmountSaved", "CreditScore",
              "ContributionGoal", "MonthlyIncome", "MonthlyExpenses", "HomeState", "TimeHorizon", "DesiredZipCodes"
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
      homeState: row.HomeState ?? null,
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
      title,
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
        "Title", "StreetAddress", "City", "State", "Zip",
        "Price", "Bedrooms", "Bathrooms", "SquareFeet", "ZillowURL"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING "HomeID", "Title", "StreetAddress", "City", "State", "Zip",
                "Price", "Bedrooms", "Bathrooms", "SquareFeet", "ZillowURL"`,
      [
        title ? String(title).trim() : null,
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

// Update a saved home (only if it belongs to current user's wishlist)
app.put("/api/homes/:homeId", getUserId, async (req, res) => {
  try {
    const homeId = Number(req.params.homeId);
    if (Number.isNaN(homeId)) {
      return res.status(400).json({ error: "Invalid home id" });
    }

    const {
      title,
      zillowUrl,
      streetAddress,
      city,
      state,
      zip,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
    } = req.body ?? {};

    const ownership = await pool.query(
      `SELECT 1 FROM "WishList" WHERE "UserID" = $1 AND "HomeID" = $2`,
      [req.userId, homeId]
    );
    if (ownership.rows.length === 0) {
      return res.status(404).json({ error: "Home not found" });
    }

    const { rows } = await pool.query(
      `UPDATE "Homes" SET
        "Title" = $1,
        "StreetAddress" = $2,
        "City" = $3,
        "State" = $4,
        "Zip" = $5,
        "Price" = $6,
        "Bedrooms" = $7,
        "Bathrooms" = $8,
        "SquareFeet" = $9,
        "ZillowURL" = $10
      WHERE "HomeID" = $11
      RETURNING "HomeID", "Title", "StreetAddress", "City", "State", "Zip",
                "Price", "Bedrooms", "Bathrooms", "SquareFeet", "ZillowURL"`,
      [
        title ? String(title).trim() : null,
        streetAddress ?? null,
        city ?? null,
        state ?? null,
        zip ? Number(zip) : null,
        price != null && price !== "" ? Number(price) : null,
        bedrooms != null && bedrooms !== "" ? Number(bedrooms) : null,
        bathrooms != null && bathrooms !== "" ? Number(bathrooms) : null,
        squareFeet != null && squareFeet !== "" ? Number(squareFeet) : null,
        zillowUrl || null,
        homeId,
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update home" });
  }
});

// Delete a saved home for the current user.
// Removes the wishlist link; also deletes the home row if no other wishlist rows reference it.
app.delete("/api/homes/:homeId", getUserId, async (req, res) => {
  const client = await pool.connect();
  try {
    const homeId = Number(req.params.homeId);
    if (Number.isNaN(homeId)) {
      return res.status(400).json({ error: "Invalid home id" });
    }

    await client.query("BEGIN");
    const delLink = await client.query(
      `DELETE FROM "WishList" WHERE "UserID" = $1 AND "HomeID" = $2`,
      [req.userId, homeId]
    );
    if (delLink.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Home not found" });
    }

    const remaining = await client.query(
      `SELECT 1 FROM "WishList" WHERE "HomeID" = $1 LIMIT 1`,
      [homeId]
    );
    if (remaining.rows.length === 0) {
      await client.query(`DELETE FROM "Homes" WHERE "HomeID" = $1`, [homeId]);
    }

    await client.query("COMMIT");
    res.status(204).end();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to delete home" });
  } finally {
    client.release();
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
      `SELECT h."HomeID", h."Title", h."StreetAddress", h."City", h."State", h."Zip",
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
      `SELECT "HomeID", "Title", "StreetAddress", "City", "State", "Zip",
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

// Estimated mortgage rate range using Homebuyer.com rates API
app.get("/api/mortgage/rates", getUserId, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "CreditScore", "DownPaymentPercentage", "HomeState"
       FROM "Progress" WHERE "UserID" = $1`,
      [req.userId]
    );
    const row = rows[0];
    if (!row) {
      return res.status(404).json({ error: "Progress not found" });
    }

    const state = row.HomeState ? String(row.HomeState).toUpperCase() : null;

    const baseFico = getFicoTierIndex(row.CreditScore);
    const ficoMin = Math.max(1, baseFico - 1);
    const ficoMax = Math.min(5, baseFico + 1);
    const ltvBase = getLtvTierIndex(row.DownPaymentPercentage);
    const ltvOptions = ltvBase === 1 ? [1, 2] : [2, 1];

    const cacheKey = `${state ?? "US"}:${ficoMin}:${ficoMax}:${ltvOptions.join(",")}`;
    const cached = ratesCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < RATES_CACHE_TTL_MS) {
      return res.json(cached.payload);
    }

    const apiKey = process.env.HOMEBUYER_API_KEY;
    const requests = [];
    for (let fico = ficoMin; fico <= ficoMax; fico += 1) {
      for (const ltv of ltvOptions) {
        const url = new URL("https://homebuyer.com/api/v1/rates");
        url.searchParams.set("state", state);
        url.searchParams.set("fico", String(fico));
        url.searchParams.set("ltv", String(ltv));
        if (apiKey) {
          // Some API gateways honor api_key param more reliably than headers.
          url.searchParams.set("api_key", apiKey);
        }
        requests.push(
          fetch(url.toString(), {
            headers: apiKey
              ? {
                  "X-API-Key": apiKey,
                  Authorization: `Bearer ${apiKey}`,
                }
              : undefined,
          }).then(async (r) => {
            let data = null;
            try {
              data = await r.json();
            } catch {
              data = null;
            }
            if (!r.ok) {
              return { ok: false, status: r.status, data };
            }
            return { ok: true, status: r.status, data };
          })
        );
      }
    }

    const requestResults = await Promise.all(requests);
    const results = requestResults
      .filter((r) => r.ok && r.data && typeof r.data.rate === "number")
      .map((r) => r.data);

    if (results.length === 0) {
      const unauthorized = requestResults.find((r) => !r.ok && r.status === 401);
      if (unauthorized) {
        const fallbackPayload = estimateFallbackRates({
          creditScore: row.CreditScore,
          downPaymentPercentage: row.DownPaymentPercentage,
          state,
        });
        ratesCache.set(cacheKey, { cachedAt: Date.now(), payload: fallbackPayload });
        return res.json(fallbackPayload);
      }
      const fallbackPayload = estimateFallbackRates({
        creditScore: row.CreditScore,
        downPaymentPercentage: row.DownPaymentPercentage,
        state,
      });
      ratesCache.set(cacheKey, { cachedAt: Date.now(), payload: fallbackPayload });
      return res.json(fallbackPayload);
    }

    const rates = results.map((r) => Number(r.rate)).filter((n) => !Number.isNaN(n));
    const lowRate = Math.min(...rates);
    const highRate = Math.max(...rates);

    const payload = {
      state: state ?? "US",
      lowRate,
      highRate,
      sampleCount: rates.length,
      asOf: results[0]?.date ?? null,
      source: results[0]?.source ?? "homebuyer.com",
      isFallback: false,
    };
    ratesCache.set(cacheKey, { cachedAt: Date.now(), payload });
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load mortgage rate estimates" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
