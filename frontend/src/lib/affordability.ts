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

