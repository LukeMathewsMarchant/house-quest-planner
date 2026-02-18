const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function register(email: string, password: string, zipcode?: number) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, zipcode: zipcode ?? undefined }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Registration failed");
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  return data;
}

export type User = {
  UserID: number;
  Email: string;
  Premium: boolean;
  Zipcode: number | null;
  UserRole: string;
};

export type Progress = {
  userId: number;
  downPaymentPercentage: number | null;
  budget: number | null;
  amountSaved: number;
  creditScore: number | null;
  contributionGoal: number | null;
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  timeHorizon: string | null;
  desiredZipCodes: string | null;
};

function progressHeaders(userId: number) {
  return {
    "Content-Type": "application/json",
    "X-User-Id": String(userId),
  };
}

export async function getProgress(userId: number): Promise<Progress> {
  const res = await fetch(`${API_BASE}/api/progress`, {
    headers: { "X-User-Id": String(userId) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load progress");
  return data;
}

export async function updateProgress(
  userId: number,
  body: Partial<{
    budget: number | null;
    downPaymentPercentage: number | null;
    amountSaved: number;
    creditScore: number | null;
    monthlyIncome: number | null;
    monthlyExpenses: number | null;
    timeHorizon: string | null;
    desiredZipCodes: string | null;
  }>
): Promise<Progress> {
  const res = await fetch(`${API_BASE}/api/progress`, {
    method: "PUT",
    headers: progressHeaders(userId),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to save profile");
  return data;
}

export async function addContribution(
  userId: number,
  amount: number
): Promise<{ amountSaved: number; contributionGoal: number | null }> {
  const res = await fetch(`${API_BASE}/api/progress/contribution`, {
    method: "POST",
    headers: progressHeaders(userId),
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to add contribution");
  return data;
}
