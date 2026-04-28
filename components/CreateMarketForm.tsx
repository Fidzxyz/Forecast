"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import { Wand2 } from "lucide-react";
import type { FarcasterUser } from "@/lib/types";

const PRESETS = [
  { label: "Will X happen by end of month?", category: "General", hours: 24 * 30 },
  { label: "Will [token] hit $X by [date]?", category: "Crypto", hours: 24 * 30 },
  { label: "Will [team] win [game]?", category: "Sports", hours: 24 * 7 },
];

export function CreateMarketForm() {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [hours, setHours] = useState(24 * 7);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

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
        /* not in client */
      }
    })();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Open in Warpcast / Farcaster to create a market.");
      return;
    }
    if (question.trim().length < 10) {
      setError("Question is too short. Be specific.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/markets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question,
          description: description || undefined,
          category,
          closesInHours: hours,
          creator: user,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "create_failed");
        return;
      }
      const { market } = await res.json();
      router.push(`/market/${market.id}`);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
          Question (must resolve YES or NO)
        </label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Will Farcaster ship Quick Auth v2 by April 30?"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          maxLength={140}
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
          Resolution criteria (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="How will this be judged? Cite a source."
          rows={2}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          >
            {["General", "Crypto", "AI", "Farcaster", "Sports", "Politics", "Tech"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
            Closes in
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          >
            <option value={24}>1 day</option>
            <option value={24 * 3}>3 days</option>
            <option value={24 * 7}>1 week</option>
            <option value={24 * 30}>1 month</option>
            <option value={24 * 90}>3 months</option>
            <option value={24 * 365}>1 year</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setQuestion(p.label);
              setCategory(p.category);
              setHours(p.hours);
            }}
            className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-1 text-[11px] text-[var(--color-text-dim)] hover:text-white"
          >
            <Wand2 size={10} /> {p.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--color-no)]/10 p-2 text-center text-xs text-[var(--color-no)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hot)] px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create market"}
      </button>
    </form>
  );
}
