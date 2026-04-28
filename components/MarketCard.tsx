import Link from "next/link";
import type { Market } from "@/lib/types";
import { Clock, ArrowRight } from "lucide-react";
import { formatTimeLeft } from "@/lib/utils";

export function MarketCard({ market }: { market: Market }) {
  const left = market.closesAt - Date.now();
  const isResolved = market.status === "resolved";
  return (
    <Link
      href={`/market/${market.id}`}
      className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-4 transition hover:border-[var(--color-accent)]"
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        <span className="text-[var(--color-accent)]">{market.category}</span>
        <span className="text-[var(--color-text-dim)]">·</span>
        <span className="flex items-center gap-1 text-[var(--color-text-dim)]">
          <Clock size={10} /> {isResolved ? "resolved" : formatTimeLeft(left)}
        </span>
        {isResolved && market.resolution && (
          <span
            className={
              "ml-auto rounded-full px-2 py-0.5 text-[10px] font-black " +
              (market.resolution === "yes"
                ? "bg-[var(--color-yes)]/20 text-[var(--color-yes)]"
                : market.resolution === "no"
                ? "bg-[var(--color-no)]/20 text-[var(--color-no)]"
                : "bg-zinc-700 text-zinc-300")
            }
          >
            {market.resolution.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold leading-snug">{market.question}</h3>
        <ArrowRight
          size={16}
          className="mt-1 shrink-0 text-[var(--color-text-dim)]"
        />
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
        <span>by {market.creator.username ?? `fid:${market.creator.fid}`}</span>
      </div>
    </Link>
  );
}
