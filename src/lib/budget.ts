/**
 * Budget math for home affordability.
 * Uses the 28% rule: housing payment (PITI) should not exceed 28% of gross monthly income.
 * Optional 25% for a conservative (low) end of the range.
 */

const ANNUAL_RATE = 0.0625; // 6.25%
const TERM_YEARS = 30;
const DOWN_PAYMENT_PCT = 0.10; // 10% down, first-time-buyer friendly

/** Monthly payment factor: payment = loan * FACTOR (for 6.25%, 30yr) */
function getMonthlyFactor(): number {
  const r = ANNUAL_RATE / 12;
  const n = TERM_YEARS * 12;
  const factor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return factor;
}

export interface BudgetSummary {
  /** Max recommended monthly housing payment (PITI) at 28% of income */
  maxMonthlyPayment: number;
  /** Conservative max payment at 25% of income */
  maxMonthlyPaymentConservative: number;
  /** Estimated max home price (high end, 28% rule) */
  priceHigh: number;
  /** Estimated max home price (low end, 25% rule) */
  priceLow: number;
  /** Formatted range string e.g. "$340K – $400K" */
  priceRangeFormatted: string;
  /** Human-readable explanation of why this range fits */
  explanation: string;
  /** Whether we had enough info (income > 0) */
  hasValidIncome: boolean;
}

/**
 * Compute affordable home price range from monthly income.
 * Assumes 10% down, 6.25% rate, 30-year mortgage. Property tax/insurance approximated.
 */
export function getBudgetSummary(monthlyIncome: number): BudgetSummary {
  const factor = getMonthlyFactor();

  const defaultSummary: BudgetSummary = {
    maxMonthlyPayment: 0,
    maxMonthlyPaymentConservative: 0,
    priceHigh: 0,
    priceLow: 0,
    priceRangeFormatted: "—",
    explanation:
      "Add your monthly income in Profile so we can estimate a home price range that fits your budget. Lenders typically recommend keeping your housing payment under 28% of your gross income.",
    hasValidIncome: false,
  };

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) {
    return defaultSummary;
  }

  // 28% rule = max PITI; we'll use ~85% of that for principal+interest (rest = tax/insurance estimate)
  const maxPITI = monthlyIncome * 0.28;
  const maxPI = maxPITI * 0.85;
  const maxLoan = maxPI / factor;
  const priceHigh = Math.round(maxLoan / (1 - DOWN_PAYMENT_PCT) / 5000) * 5000;

  const maxPITIConservative = monthlyIncome * 0.25;
  const maxPIConservative = maxPITIConservative * 0.85;
  const maxLoanConservative = maxPIConservative / factor;
  const priceLow = Math.round(maxLoanConservative / (1 - DOWN_PAYMENT_PCT) / 5000) * 5000;

  const low = Math.min(priceLow, priceHigh);
  const high = Math.max(priceLow, priceHigh);

  const formatPrice = (p: number) =>
    p >= 1_000_000 ? `$${(p / 1_000_000).toFixed(1)}M` : `$${Math.round(p / 1000)}K`;

  const explanation =
    `Based on your $${monthlyIncome.toLocaleString()}/month income, lenders typically recommend keeping your housing payment (including tax and insurance) at or below 28% of your income — that's about $${Math.round(maxPITI).toLocaleString()}/month. ` +
    `At today's rates with a 10% down payment, that supports a home price in the ${formatPrice(low)} – ${formatPrice(high)} range. ` +
    `Staying in this range helps keep your payments manageable and improves your chance of approval.`;

  return {
    maxMonthlyPayment: maxPITI,
    maxMonthlyPaymentConservative: maxPITIConservative,
    priceHigh: high,
    priceLow: low,
    priceRangeFormatted: `${formatPrice(low)} – ${formatPrice(high)}`,
    explanation,
    hasValidIncome: true,
  };
}
