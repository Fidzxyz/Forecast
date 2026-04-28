import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { listAllForecasts } from "@/lib/store";
import { aggregateUser } from "@/lib/brier";
import { MiniAppReady } from "@/app/providers";
import type { UserStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const all = await listAllForecasts();
  const byUser = new Map<number, UserStats>();
  // group by fid
  const grouped = new Map<number, typeof all>();
  for (const f of all) {
    const list = grouped.get(f.user.fid) ?? [];
    list.push(f);
    grouped.set(f.user.fid, list);
  }
  for (const [fid, list] of grouped) {
    byUser.set(fid, aggregateUser(list, list[0].user));
  }
  const ranked = [...byUser.values()]
    .filter((u) => u.resolvedForecasts > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <MiniAppReady />

      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-dim)] hover:text-white"
      >
        <ArrowLeft size={14} /> Markets
      </Link>

      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde047] to-[#f97316] text-lg shadow-lg">
          <Trophy size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">Leaderboard</h1>
          <p className="text-xs text-[var(--color-text-dim)]">Ranked by calibration, not volume</p>
        </div>
      </header>

      {ranked.length === 0 ? (
        <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-8 text-center text-sm text-[var(--color-text-dim)]">
          No resolved forecasts yet. Climb to the top — make calibrated calls and wait for markets to resolve.
        </p>
      ) : (
        <ol className="space-y-2">
          {ranked.map((u, i) => (
            <li
              key={u.fid}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-black " +
                    (i === 0
                      ? "bg-yellow-400 text-black"
                      : i === 1
                      ? "bg-zinc-300 text-black"
                      : i === 2
                      ? "bg-orange-400 text-black"
                      : "bg-[var(--color-bg)] text-[var(--color-text-dim)]")
                  }
                >
                  {i + 1}
                </span>
                {u.pfpUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.pfpUrl} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[var(--color-accent)]/30" />
                )}
                <div>
                  <div className="font-semibold">
                    {u.username ?? u.displayName ?? `fid:${u.fid}`}
                  </div>
                  <div className="text-xs text-[var(--color-text-dim)]">
                    {u.resolvedForecasts} resolved · streak {u.streak}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[var(--color-yes)]">{u.score}</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">
                  cal score
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 text-sm text-[var(--color-text-dim)]">
        <p className="mb-2 font-semibold text-white">How is this scored?</p>
        <p>
          Every prediction earns a{" "}
          <span className="font-mono text-[var(--color-text)]">Brier score</span> when its market
          resolves: <span className="font-mono">(probability − outcome)²</span>. Lower is better.
          Your <span className="font-semibold text-white">calibration score</span> is{" "}
          <span className="font-mono">100 × (1 − 4 × meanBrier)</span> — coinflip = 0, perfect = 100.
        </p>
      </section>
    </main>
  );
}
