import type { Forecast, Market, UserStats } from "./types";

/**
 * Brier score for a single forecast.
 * outcome: 1 for YES, 0 for NO. Lower is better. Range: 0..1.
 */
export function brierScore(probability: number, outcome: 0 | 1): number {
  const diff = probability - outcome;
  return diff * diff;
}

/**
 * Convert avg Brier (0..1, lower=better) to a 0..100 calibration score (higher=better).
 * Score = 100 * (1 - 4 * brier) clamped to 0..100.
 * 4x scaling so brier=0 → 100, brier=0.25 (coinflip) → 0.
 */
export function calibrationScore(avgBrier: number | null): number {
  if (avgBrier === null) return 0;
  return Math.max(0, Math.min(100, Math.round(100 * (1 - 4 * avgBrier))));
}

/**
 * Compute streak: consecutive resolved forecasts with brier < 0.25 (better than coinflip).
 * Operates on chronologically ordered forecasts, newest first.
 */
export function computeStreak(forecasts: Forecast[]): number {
  let s = 0;
  for (const f of forecasts) {
    if (f.brierScore === undefined) continue;
    if (f.brierScore < 0.25) s++;
    else break;
  }
  return s;
}

export function aggregateUser(
  forecasts: Forecast[],
  user: { fid: number; username?: string; displayName?: string; pfpUrl?: string }
): UserStats {
  const resolved = forecasts.filter((f) => f.brierScore !== undefined);
  const avgBrier =
    resolved.length > 0
      ? resolved.reduce((acc, f) => acc + (f.brierScore ?? 0), 0) / resolved.length
      : null;
  const sorted = [...resolved].sort((a, b) => b.createdAt - a.createdAt);
  return {
    fid: user.fid,
    username: user.username,
    displayName: user.displayName,
    pfpUrl: user.pfpUrl,
    totalForecasts: forecasts.length,
    resolvedForecasts: resolved.length,
    avgBrier,
    streak: computeStreak(sorted),
    score: calibrationScore(avgBrier),
  };
}

/**
 * Compute consensus probability across all forecasts on a market.
 * Simple mean for v1; v2 could time-weight or skill-weight.
 */
export function consensus(forecasts: Forecast[]): number | null {
  if (forecasts.length === 0) return null;
  return forecasts.reduce((a, f) => a + f.probability, 0) / forecasts.length;
}

export function applyResolution(market: Market, forecasts: Forecast[]): Forecast[] {
  if (market.status !== "resolved" || !market.resolution) return forecasts;
  if (market.resolution === "void") return forecasts;
  const outcome: 0 | 1 = market.resolution === "yes" ? 1 : 0;
  return forecasts.map((f) => ({ ...f, brierScore: brierScore(f.probability, outcome) }));
}
