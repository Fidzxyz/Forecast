export type MarketStatus = "open" | "resolved";
export type Resolution = "yes" | "no" | "void";

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export interface Market {
  id: string;
  question: string;
  description?: string;
  category: string;
  createdAt: number;
  closesAt: number;
  resolvesAt?: number;
  resolution?: Resolution;
  status: MarketStatus;
  creator: FarcasterUser;
  sourceCastHash?: string;
}

export interface Forecast {
  id: string;
  marketId: string;
  user: FarcasterUser;
  // probability of YES, 0..1
  probability: number;
  createdAt: number;
  // Brier score, computed when market resolves
  brierScore?: number;
}

export interface UserStats {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  totalForecasts: number;
  resolvedForecasts: number;
  // mean Brier score across resolved forecasts (lower is better)
  avgBrier: number | null;
  // streak of consecutive better-than-coinflip forecasts
  streak: number;
  // calibration score 0..100 (100 = perfect)
  score: number;
}
