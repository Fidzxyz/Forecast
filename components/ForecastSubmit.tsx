"use client";
import { useEffect, useState, useTransition } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Send, Share2, Check } from "lucide-react";
import type { FarcasterUser } from "@/lib/types";
import { cn, baseUrl } from "@/lib/utils";

export function ForecastSubmit({
  marketId,
  initial,
}: {
  marketId: string;
  initial: number;
}) {
  const [prob, setProb] = useState(Math.round(initial * 100));
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      try {
        const ctx = await sdk.context;
        if (ctx?.user?.fid) {
          setUser({
            fid: ctx.user.fid,
            username: ctx.user.username,
            displayName: ctx.user.displayName,
            pfpUrl: ctx.user.pfpUrl,
          });
        }
      } catch {
        // not running inside a Farcaster client
      }
    })();
  }, []);

  function submit() {
    if (!user) {
      setError("Open this in Warpcast / Farcaster to forecast.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/markets/${marketId}/forecasts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          probability: prob / 100,
          user,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "submission_failed");
        return;
      }
      setSubmitted(true);
    });
  }

  async function shareCast() {
    const url = `${baseUrl()}/market/${marketId}`;
    const lean = prob > 50 ? "YES" : prob < 50 ? "NO" : "coinflip";
    const text = `My forecast: ${prob}% ${lean}.\n\nWhat's yours?`;
    try {
      await sdk.actions.composeCast({ text, embeds: [url] });
    } catch {
      // fallback: copy to clipboard
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  }

  const tint =
    prob > 55 ? "var(--color-yes)" : prob < 45 ? "var(--color-no)" : "#9b9bb0";

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--color-yes)]/30 bg-[var(--color-yes)]/10 p-5 text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-lg font-black text-[var(--color-yes)]">
          <Check size={20} /> Forecast locked in: {prob}%
        </div>
        <p className="mb-3 text-sm text-[var(--color-text-dim)]">
          You&apos;ll get a Brier score when the market resolves.
        </p>
        <button
          onClick={shareCast}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90"
        >
          <Share2 size={14} /> Share to feed
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5">
      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
        Your forecast
      </label>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-xs text-[var(--color-text-dim)]">
          {prob > 50 ? "leaning YES" : prob < 50 ? "leaning NO" : "coinflip"}
        </div>
        <div
          className="text-5xl font-black tabular-nums transition-colors"
          style={{ color: tint }}
        >
          {prob}
          <span className="text-2xl">%</span>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={99}
        step={1}
        value={prob}
        onChange={(e) => setProb(Number(e.target.value))}
        className="fc-slider w-full"
      />

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--color-no)]">NO 1%</span>
        <span className="text-[var(--color-text-dim)]">50/50</span>
        <span className="font-semibold text-[var(--color-yes)]">YES 99%</span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {[10, 30, 50, 70, 90].map((v) => (
          <button
            key={v}
            onClick={() => setProb(v)}
            className={cn(
              "rounded-full border border-[var(--color-border)] px-2 py-1.5 text-xs font-semibold text-[var(--color-text-dim)] hover:text-white",
              prob === v && "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
            )}
          >
            {v}%
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-[var(--color-no)]/10 p-2 text-center text-xs text-[var(--color-no)]">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={pending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hot)] px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
      >
        <Send size={14} />
        {pending ? "Submitting..." : `Lock in ${prob}%`}
      </button>
    </div>
  );
}
