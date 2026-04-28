import { promises as fs } from "node:fs";
import path from "node:path";
import type { Forecast, Market } from "./types";
import { applyResolution } from "./brier";

const DATA_FILE = path.join(process.cwd(), "data", "store.json");

interface DB {
  markets: Record<string, Market>;
  // forecasts keyed by marketId, then by fid (one forecast per user per market — last write wins)
  forecasts: Record<string, Record<number, Forecast>>;
}

const empty: DB = { markets: {}, forecasts: {} };

// globalThis cache so HMR / serverless instance reuse share the same in-memory db.
declare global {
  // eslint-disable-next-line no-var
  var __forecastDB: DB | undefined;
  // eslint-disable-next-line no-var
  var __forecastLoaded: boolean | undefined;
}

async function ensureLoaded(): Promise<DB> {
  if (globalThis.__forecastDB && globalThis.__forecastLoaded) return globalThis.__forecastDB;
  globalThis.__forecastDB ||= structuredClone(empty);
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as DB;
    globalThis.__forecastDB = parsed;
  } catch {
    // first run, no file yet
  }
  globalThis.__forecastLoaded = true;
  return globalThis.__forecastDB!;
}

async function persist(db: DB): Promise<void> {
  // Best-effort persistence. On read-only filesystems (Vercel serverless),
  // writes silently fail and we keep operating from globalThis cache.
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
  } catch {
    // ignore
  }
}

export async function listMarkets(opts?: { status?: "open" | "resolved" }): Promise<Market[]> {
  const db = await ensureLoaded();
  const all = Object.values(db.markets);
  const filtered = opts?.status ? all.filter((m) => m.status === opts.status) : all;
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getMarket(id: string): Promise<Market | null> {
  const db = await ensureLoaded();
  return db.markets[id] ?? null;
}

export async function createMarket(market: Market): Promise<Market> {
  const db = await ensureLoaded();
  db.markets[market.id] = market;
  db.forecasts[market.id] ||= {};
  await persist(db);
  return market;
}

export async function updateMarket(id: string, patch: Partial<Market>): Promise<Market | null> {
  const db = await ensureLoaded();
  const existing = db.markets[id];
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  db.markets[id] = updated;
  // If resolving, compute Brier scores for all forecasts on this market
  if (patch.status === "resolved" && patch.resolution) {
    const list = Object.values(db.forecasts[id] ?? {});
    const scored = applyResolution(updated, list);
    const map: Record<number, Forecast> = {};
    for (const f of scored) map[f.user.fid] = f;
    db.forecasts[id] = map;
  }
  await persist(db);
  return updated;
}

export async function listForecasts(marketId: string): Promise<Forecast[]> {
  const db = await ensureLoaded();
  return Object.values(db.forecasts[marketId] ?? {}).sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAllForecastsByUser(fid: number): Promise<Forecast[]> {
  const db = await ensureLoaded();
  const out: Forecast[] = [];
  for (const m of Object.values(db.forecasts)) {
    const f = m[fid];
    if (f) out.push(f);
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAllForecasts(): Promise<Forecast[]> {
  const db = await ensureLoaded();
  const out: Forecast[] = [];
  for (const m of Object.values(db.forecasts)) out.push(...Object.values(m));
  return out;
}

export async function upsertForecast(forecast: Forecast): Promise<Forecast> {
  const db = await ensureLoaded();
  db.forecasts[forecast.marketId] ||= {};
  db.forecasts[forecast.marketId][forecast.user.fid] = forecast;
  await persist(db);
  return forecast;
}

/** Seed data shown on first launch so the app feels alive. */
export async function ensureSeed(): Promise<void> {
  const db = await ensureLoaded();
  if (Object.keys(db.markets).length > 0) return;
  const now = Date.now();
  const day = 86_400_000;
  const seedMarkets: Market[] = [
    {
      id: "btc-100k-eoy",
      question: "Will BTC close above $100k on Dec 31?",
      description: "Resolves YES if Coinbase BTC-USD spot >= $100,000 at 23:59 UTC, Dec 31.",
      category: "Crypto",
      createdAt: now - 2 * day,
      closesAt: now + 60 * day,
      status: "open",
      creator: { fid: 3, username: "dwr.eth", displayName: "Dan Romero" },
    },
    {
      id: "fc-1m-daus",
      question: "Will Farcaster hit 1M DAUs before July?",
      description: "Resolves based on @dwr.eth's official monthly stats post.",
      category: "Farcaster",
      createdAt: now - 1 * day,
      closesAt: now + 90 * day,
      status: "open",
      creator: { fid: 2, username: "v", displayName: "Varun" },
    },
    {
      id: "ai-agi-2026",
      question: "Will a major lab declare AGI by end of 2026?",
      description: "Public announcement from OpenAI / Anthropic / DeepMind / Meta / xAI.",
      category: "AI",
      createdAt: now - 3 * day,
      closesAt: now + 365 * day,
      status: "open",
      creator: { fid: 1, username: "balajis.eth", displayName: "Balaji" },
    },
  ];
  for (const m of seedMarkets) await createMarket(m);
}
