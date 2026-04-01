/**
 * Monthly amount the user saves toward the down payment.
 * Heals legacy DB rows where ContributionGoal was mistakenly set to the full down-payment dollar total.
 */
export function effectiveMonthlyDownPaymentContribution(
  contributionGoal: number | null | undefined,
  downPaymentDollarGoal: number,
  monthlyIncome: number | null | undefined,
  monthlyExpenses: number | null | undefined,
): number | null {
  const inferred =
    monthlyIncome != null && monthlyExpenses != null ? monthlyIncome - monthlyExpenses : null;
  if (contributionGoal == null || contributionGoal <= 0) return inferred;
  if (
    downPaymentDollarGoal > 0 &&
    contributionGoal >= downPaymentDollarGoal - 1e-6
  ) {
    return inferred;
  }
  return contributionGoal;
}

export function calculateDownPayment(price: number | null, downPaymentPercentage: number | null): number {
  if (!price || !downPaymentPercentage || downPaymentPercentage <= 0) return 0;
  return (price * downPaymentPercentage) / 100;
}

export function calculateRemainingSavings(
  downPaymentNeeded: number,
  amountSaved: number | null | undefined,
): number {
  const saved = amountSaved ?? 0;
  return Math.max(0, downPaymentNeeded - saved);
}

export function calculateAffordabilityTimeline(
  remainingSavings: number,
  monthlySavings: number | null | undefined,
): {
  months: number;
  years: number;
  remainingMonths: number;
  label: string;
} | null {
  const monthly = monthlySavings ?? 0;
  if (remainingSavings <= 0 || monthly <= 0) {
    return null;
  }

  const months = Math.ceil(remainingSavings / monthly);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let label: string;
  if (years === 0) {
    label = `${months} month${months === 1 ? "" : "s"}`;
  } else if (remainingMonths === 0) {
    label = `${years} year${years === 1 ? "" : "s"}`;
  } else {
    label = `${years} year${years === 1 ? "" : "s"} ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`;
  }

  return { months, years, remainingMonths, label };
}

function timeHorizonToTargetMonths(timeHorizon: string | null | undefined): number | null {
  if (!timeHorizon) return null;
  switch (timeHorizon) {
    case "3-months":
      return 3;
    case "6-months":
      return 6;
    case "1-year":
      return 12;
    case "2-years":
      return 24;
    case "3-years":
      return 36;
    case "5-years":
      return 60;
    case "exploring":
      return null;
    default:
      return null;
  }
}

export function calculateSavingsNeededForTimeline(
  remainingSavings: number,
  timeHorizon: string | null | undefined,
): {
  targetMonths: number;
  monthlyNeeded: number;
  targetLabel: string;
} | null {
  const targetMonths = timeHorizonToTargetMonths(timeHorizon);
  if (targetMonths == null) return null;

  // If they already have enough cash for the down payment, they're already on track.
  if (remainingSavings <= 0) {
    return { targetMonths, monthlyNeeded: 0, targetLabel: `within ${targetMonths} month${targetMonths === 1 ? "" : "s"}` };
  }

  // Round up so the estimate is achievable.
  const monthlyNeeded = Math.ceil(remainingSavings / targetMonths);
  return {
    targetMonths,
    monthlyNeeded,
    targetLabel: `within ${targetMonths} month${targetMonths === 1 ? "" : "s"}`,
  };
}

export function calculateMonthlyPayment(
  loanAmount: number,
  annualRatePercent: number,
  years = 30,
): number {
  if (loanAmount <= 0 || annualRatePercent <= 0 || years <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  const n = years * 12;
  const factor = Math.pow(1 + monthlyRate, n);
  return (loanAmount * monthlyRate * factor) / (factor - 1);
}

