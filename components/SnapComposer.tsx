"use client";
import { useEffect, useState, useTransition } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Send, Share2, Check, Zap, RefreshCw } from "lucide-react";
import type { FarcasterUser } from "@/lib/types";
import { buildSnapUrl, type SnapTopic, stance } from "@/lib/snap";
import { cn } from "@/lib/utils";

interface Props {
  topic: SnapTopic | null;
  customQuestion: string | null;
  initialProbability: number | null;
  byUsername: string | null;
}

export function SnapComposer({
  topic,
  customQuestion,
  initialProbability,
  byUsername,
}: Props) {
  const startingProb =
    initialProbability !== null
      ? Math.max(1, Math.min(99, initialProbability))
      : 50;

  const [prob, setProb] = useState(startingProb);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
        // outside Farcaster client
      }
    })();
  }, []);

  const question = topic?.question ?? customQuestion ?? "Put a number on it.";
  const emoji = topic?.emoji ?? "🎯";
  const tint =
    prob > 55 ? "var(--color-yes)" : prob < 45 ? "var(--color-no)" : "#9b9bb0";

  function lockIn() {
    startTransition(() => {
      setSubmitted(true);
    });
  }

  async function shareCast() {
    setShareError(null);
    const url = buildSnapUrl({
      topic,
      customQuestion,
      probability: prob,
      byUsername: user?.username ?? null,
      absolute: true,
    });
    const verdict = stance(prob);
    const lead =
      verdict === "YES"
        ? `My snap: ${prob}% YES.`
        : verdict === "NO"
        ? `My snap: ${prob}% NO.`
        : `My snap: ${prob}% — pure coinflip.`;
    const text = byUsername
      ? `${lead}\n\nbeat @${byUsername} on this one →`
      : `${lead}\n\nbeat my forecast →`;
    try {
      await sdk.actions.composeCast({ text, embeds: [url] });
    } catch {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareError("copied to clipboard");
      } catch {
        setShareError("open in Warpcast to share");
      }
    }
  }

  function reset() {
    setSubmitted(false);
    setShareError(null);
  }

  const showRemixHint =
    initialProbability !== null && (byUsername || initialProbability !== prob);

  return (
    <div
      className={cn(
        "relative rounded-3xl border border-[var(--color-border)] p-6 transition-all",
        "bg-gradient-to-br from-[var(--color-bg-elev)] via-[#15101f] to-[#1a0d2e]"
      )}
    >
      <div className="mb-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
          <Zap size={12} /> Snap
          {topic?.category && (
            <>
              <span className="text-[var(--color-text-dim)]">·</span>
              <span className="text-[var(--color-text-dim)]">{topic.category}</span>
            </>
          )}
        </span>
        {showRemixHint && (
          <span className="rounded-full bg-[var(--color-bg-elev)] px-2 py-0.5 text-[var(--color-text-dim)]">
            {byUsername ? `@${byUsername} said ` : "previous "}
            <span className="font-mono text-white">{initialProbability}%</span>
          </span>
        )}
      </div>

      <div className="mb-6 flex items-start gap-3">
        <div className="text-4xl leading-none">{emoji}</div>
        <h1 className="text-2xl font-black leading-tight tracking-tight">
          {question}
        </h1>
      </div>

      {!submitted ? (
        <>
          <div className="mb-4 flex items-end justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-dim)]">
              {prob > 50 ? "leaning YES" : prob < 50 ? "leaning NO" : "coinflip"}
            </div>
            <div
              className="text-7xl font-black tabular-nums leading-none transition-colors"
              style={{ color: tint }}
            >
              {prob}
              <span className="text-3xl">%</span>
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

          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[var(--color-no)]">NO</span>
            <span className="text-[var(--color-text-dim)]">50/50</span>
            <span className="font-bold text-[var(--color-yes)]">YES</span>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-2">
            {[10, 30, 50, 70, 90].map((v) => (
              <button
                key={v}
                onClick={() => setProb(v)}
                className={cn(
                  "rounded-full border border-[var(--color-border)] py-2 text-xs font-bold text-[var(--color-text-dim)] hover:text-white",
                  prob === v &&
                    "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
                )}
              >
                {v}%
              </button>
            ))}
          </div>

          <button
            onClick={lockIn}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hot)] px-5 py-3.5 text-base font-black text-white shadow-xl shadow-[var(--color-accent)]/30 hover:opacity-95"
          >
            <Send size={16} />
            Lock in {prob}%
          </button>

          <p className="mt-3 text-center text-[11px] text-[var(--color-text-dim)]">
            One tap. No wallet. Just a calibrated take.
          </p>
        </>
      ) : (
        <>
          <div className="mb-5 rounded-2xl border border-[var(--color-yes)]/30 bg-[var(--color-yes)]/10 p-5 text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-2xl font-black text-[var(--color-yes)]">
              <Check size={24} /> Locked in
            </div>
            <div
              className="mt-1 text-6xl font-black tabular-nums"
              style={{ color: tint }}
            >
              {prob}%
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[var(--color-text-dim)]">
              {stance(prob)}
              {user?.username ? ` · @${user.username}` : ""}
            </div>
          </div>

          <button
            onClick={shareCast}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hot)] px-5 py-3.5 text-base font-black text-white shadow-xl shadow-[var(--color-accent)]/30 hover:opacity-95"
          >
            <Share2 size={16} /> Cast my snap
          </button>

          {shareError && (
            <p className="mt-3 rounded-lg bg-[var(--color-bg-elev)] p-2 text-center text-xs text-[var(--color-text-dim)]">
              {shareError}
            </p>
          )}

          <button
            onClick={reset}
            className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-[var(--color-text-dim)] hover:text-white"
          >
            <RefreshCw size={12} /> change my number
          </button>
        </>
      )}

      {topic?.criterion && (
        <p className="mt-5 border-t border-[var(--color-border)] pt-3 text-[11px] leading-relaxed text-[var(--color-text-dim)]">
          <span className="font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
            Resolves:
          </span>{" "}
          {topic.criterion}
        </p>
      )}
    </div>
  );
}
