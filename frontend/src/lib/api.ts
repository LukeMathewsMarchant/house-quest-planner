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
  homeState: string | null;
  timeHorizon: string | null;
  desiredZipCodes: string | null;
};

export type MortgageRateEstimate = {
  state: string;
  lowRate: number;
  highRate: number;
  sampleCount: number;
  asOf: string | null;
  source: string;
  isFallback?: boolean;
};

function progressHeaders(userId: number) {
  return {
    "Content-Type": "application/json",
    "X-User-Id": String(userId),
  };
}

export type Home = {
  HomeID: number;
  StreetAddress: string;
  City: string;
  State: string;
  Zip: number | null;
  Price: number | null;
  Bedrooms: number | null;
  Bathrooms: number | null;
  SquareFeet: number | null;
  ZillowURL: string | null;
};

export type WishlistItem = Home;

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
    homeState: string | null;
    timeHorizon: string | null;
    desiredZipCodes: string | null;
    contributionGoal: number | null;
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

export async function createHome(
  userId: number,
  body: {
    zillowUrl: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
  }
): Promise<Home> {
  const res = await fetch(`${API_BASE}/api/homes`, {
    method: "POST",
    headers: progressHeaders(userId),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to save home");
  return data;
}

export async function updateHome(
  userId: number,
  homeId: number,
  body: {
    zillowUrl: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
  }
): Promise<Home> {
  const res = await fetch(`${API_BASE}/api/homes/${homeId}`, {
    method: "PUT",
    headers: progressHeaders(userId),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to update home");
  return data;
}

export async function deleteHome(userId: number, homeId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/homes/${homeId}`, {
    method: "DELETE",
    headers: progressHeaders(userId),
  });
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to delete home");
}

export async function getWishlist(userId: number): Promise<WishlistItem[]> {
  const res = await fetch(`${API_BASE}/api/wishlist/${userId}`, {
    headers: { "X-User-Id": String(userId) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load saved homes");
  return data;
}

export async function getHome(homeId: number): Promise<Home> {
  const res = await fetch(`${API_BASE}/api/homes/${homeId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load home");
  return data;
}

export async function getMortgageRates(userId: number): Promise<MortgageRateEstimate> {
  const res = await fetch(`${API_BASE}/api/mortgage/rates`, {
    headers: { "X-User-Id": String(userId) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load mortgage rate estimate");
  return data;
}
