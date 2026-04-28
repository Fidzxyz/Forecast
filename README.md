# Forecast

> Far·caster &rarr; Fore·cast.
> Prediction markets, native to Farcaster.

A Farcaster Mini App where anyone can spin up a yes/no market on a cast,
forecast the probability, and earn a **Brier score** when it resolves.
Climb the leaderboard for being calibrated — not loud.

## Why this exists

Farcaster is full of takes. Forecasters put a number on it.

- The name is a wordplay: **Far**·caster &rarr; **Fore**·cast
- Reply-as-prediction creates inherent engagement loops
- Brier scoring rewards calibration, not volume — the leaderboard is meritocratic
- Onchain settlement (v2) lives on Base — same default as the Farcaster team's stack

## Stack

- **Next.js 15** (App Router, RSC, Turbopack-ready)
- **React 19**
- **Tailwind CSS v4** (CSS-based theme)
- **`@farcaster/miniapp-sdk`** v0.3 — `sdk.actions.ready()`, `sdk.actions.composeCast()`, `sdk.context`
- **`fc:miniapp`** meta tag spec (v1) + `/.well-known/farcaster.json` manifest
- Edge runtime OG images via `next/og`
- File-backed in-memory store (swap to Vercel KV / Redis for prod)

## Quick start

```bash
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_URL once deployed
npm run dev                     # http://localhost:3000
```

Open in the **Farcaster Mini App preview tool**:

> https://farcaster.xyz/~/developers/mini-apps/preview?url=http://localhost:3000

(You need Developer Mode enabled on Farcaster.)

## Deploying

1. `git push` to GitHub.
2. Import the repo into **Vercel** (zero-config).
3. Set `NEXT_PUBLIC_URL=https://your-domain.vercel.app`.
4. Deploy.
5. **Sign your manifest:** go to https://farcaster.xyz/~/developers/mini-apps/manifest, paste your domain, sign with your custody address. Copy the resulting `header` / `payload` / `signature` into Vercel env as `FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, `FARCASTER_SIGNATURE`.
6. Redeploy. Hit `https://your-domain.vercel.app/.well-known/farcaster.json` and verify the JSON has `accountAssociation` populated.
7. Cast `https://your-domain.vercel.app` — it will render as a Mini App embed.

## Architecture

```
app/
  layout.tsx                          # injects fc:miniapp meta on every page
  page.tsx                            # market list + create
  market/[id]/page.tsx                # detail + forecast + resolve
  leaderboard/page.tsx                # ranked by calibration score
  providers.tsx                       # MiniAppReady — calls sdk.actions.ready()
  api/
    markets/route.ts                  # GET list, POST create
    markets/[id]/route.ts             # GET, PATCH (resolve)
    markets/[id]/forecasts/route.ts   # GET, POST forecast
    leaderboard/route.ts              # aggregated stats
    og/route.tsx                      # default 3:2 share image
    og/market/[id]/route.tsx          # per-market share image
  .well-known/farcaster.json/route.ts # signed manifest
lib/
  brier.ts                            # scoring math
  store.ts                            # globalThis-cached + file-persisted DB
  embed.ts                            # builds fc:miniapp embed JSON
  types.ts                            # shared TS types
components/
  MarketCard.tsx                      # server
  ForecastSubmit.tsx                  # client — slider, sdk.context, composeCast
  CreateMarketForm.tsx                # client — sdk.context, POST /api/markets
  ResolveButton.tsx                   # client — only renders if user.fid === creator.fid
```

## Scoring

- Each forecast is a probability $p \in [0.01, 0.99]$ on YES.
- When the market resolves with outcome $o \in \{0, 1\}$, the forecast earns:

  $$\text{Brier} = (p - o)^2$$

  Lower is better. Range: 0 (perfect) to 1 (max wrong).
- A user's **calibration score** is $100 \times (1 - 4 \times \overline{\text{Brier}})$, clamped to $[0, 100]$.
  - Coinflip-on-everything (Brier = 0.25) &rarr; 0
  - Perfect calibration (Brier = 0) &rarr; 100

## Roadmap

- **v1 (this build)** — social predictions, Brier leaderboard, off-chain settlement
- **v2** — USDC stake on Base via x402, Quick Auth (FID verification on every write), oracle resolution (UMA / Reality.eth), notifications via webhook
- **v3** — public API for embedding markets in any cast client, Frame composer, mini-tournaments

## Credits

Built for Farcaster. Inspired by Tetlock & Gardner's *Superforecasting*. Naming pun is free, take it.

## License

MIT.
