import Link from "next/link";
import { ensureSeed, listMarkets } from "@/lib/store";
import { MarketCard } from "@/components/MarketCard";
import { CreateMarketForm } from "@/components/CreateMarketForm";
import { MiniAppReady } from "./providers";
import { TrendingUp, Trophy, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeed();
  const markets = await listMarkets();
  const open = markets.filter((m) => m.status === "open");
  const resolved = markets.filter((m) => m.status === "resolved").slice(0, 3);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <MiniAppReady />

      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Forecast"
            className="h-11 w-11 rounded-2xl shadow-lg shadow-[var(--color-accent)]/30"
          />
          <div>
            <h1 className="text-xl font-black tracking-tight">Forecast</h1>
            <p className="text-xs text-[var(--color-text-dim)]">
              Far·caster &rarr; Fore·cast
            </p>
          </div>
        </div>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-dim)] hover:text-white"
        >
          <Trophy size={14} /> Leaderboard
        </Link>
      </header>

      <section className="mb-6 rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-elev)] to-[#0d0d18] p-5">
        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
          <TrendingUp size={14} /> Calibrated, not loud
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-text)]">
          Anyone can have hot takes. Forecasters put a number on it. Make a prediction,
          earn a <span className="font-semibold text-[var(--color-yes)]">Brier score</span> when
          it resolves, climb the leaderboard for being right — not for being loudest.
        </p>
      </section>

      <section className="mb-6">
        <details className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)]">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold">
            <span className="flex items-center gap-2">
              <Plus size={16} className="text-[var(--color-accent)]" />
              Create a market
            </span>
            <span className="text-xs text-[var(--color-text-dim)] group-open:hidden">
              tap to open
            </span>
          </summary>
          <div className="border-t border-[var(--color-border)] p-4">
            <CreateMarketForm />
          </div>
        </details>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
          Open markets
        </h2>
        {open.length === 0 ? (
          <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-6 text-center text-sm text-[var(--color-text-dim)]">
            No open markets. Be the first.
          </p>
        ) : (
          <div className="space-y-3">
            {open.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
            Recently resolved
          </h2>
          <div className="space-y-3">
            {resolved.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-12 text-center text-xs text-[var(--color-text-dim)]">
        Built for Farcaster · open source · v0.1
      </footer>
    </main>
  );
}
