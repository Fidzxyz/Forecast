"use client";
import { useEffect, useRef, useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import type { Forecast } from "@/lib/types";
import { relativeTime } from "@/lib/relative-time";
import { formatPercent } from "@/lib/utils";

const POLL_INTERVAL = 5000;

export function LiveActivity({
  marketId,
  initial,
}: {
  marketId: string;
  initial: Forecast[];
}) {
  const [forecasts, setForecasts] = useState<Forecast[]>(initial);
  const [, forceTick] = useState(0); // re-render so relative timestamps update
  const seenIds = useRef(new Set(initial.map((f) => f.id)));
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Poll for new forecasts
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/markets/${marketId}/forecasts`, { cache: "no-store" });
        if (!res.ok) return;
        const { forecasts: fresh } = (await res.json()) as { forecasts: Forecast[] };
        if (cancelled) return;

        const incoming = new Set<string>();
        for (const f of fresh) {
          if (!seenIds.current.has(f.id)) {
            seenIds.current.add(f.id);
            incoming.add(f.id);
          }
        }
        if (incoming.size > 0) {
          setNewIds(incoming);
          // clear "new" highlight after animation
          setTimeout(() => setNewIds(new Set()), 2500);
        }
        setForecasts(fresh);
      } catch {
        /* offline / network blip */
      }
    }
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [marketId]);

  // Tick every 15s so "30s ago" → "45s ago" updates
  useEffect(() => {
    const t = setInterval(() => forceTick((x) => x + 1), 15000);
    return () => clearInterval(t);
  }, []);

  if (forecasts.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-6 text-center">
        <Activity size={24} className="mx-auto mb-2 text-[var(--color-text-dim)]" />
        <p className="text-sm text-[var(--color-text-dim)]">
          No forecasts yet. Be the first to put a number on it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
          Live activity
        </h2>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-yes)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-yes)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-yes)]"></span>
          </span>
          live
        </span>
      </div>

      {forecasts.map((f) => {
        const isNew = newIds.has(f.id);
        const tint = f.probability > 0.5 ? "var(--color-yes)" : "var(--color-no)";
        return (
          <div
            key={f.id}
            className={
              "flex items-center justify-between rounded-2xl border p-3 transition-all duration-500 " +
              (isNew
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-lg shadow-[var(--color-accent)]/20"
                : "border-[var(--color-border)] bg-[var(--color-bg-elev)]")
            }
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {f.user.pfpUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.user.pfpUrl} alt="" className="h-7 w-7 shrink-0 rounded-full" />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hot)] text-[10px] font-black text-white">
                  {(f.user.username ?? `f${f.user.fid}`).slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 text-sm">
                  <span className="truncate font-semibold text-white">
                    {f.user.username ?? f.user.displayName ?? `fid:${f.user.fid}`}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--color-text-dim)]">
                    {f.probability > 0.5 ? "leaning YES" : f.probability < 0.5 ? "leaning NO" : "coinflip"}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--color-text-dim)]">
                  {relativeTime(f.createdAt)}
                  {isNew && (
                    <span className="ml-2 font-bold text-[var(--color-accent)]">· new</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {f.brierScore !== undefined && (
                <span className="text-[10px] font-mono text-[var(--color-text-dim)]">
                  brier {f.brierScore.toFixed(2)}
                </span>
              )}
              <div
                className="flex items-center gap-0.5 text-lg font-black tabular-nums"
                style={{ color: tint }}
              >
                {f.probability > 0.5 && <TrendingUp size={14} />}
                {formatPercent(f.probability)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
