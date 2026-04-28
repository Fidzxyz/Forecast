"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import { Check, X, Ban } from "lucide-react";
import type { Resolution } from "@/lib/types";

export function ResolveButton({
  marketId,
  creatorFid,
}: {
  marketId: string;
  creatorFid: number;
}) {
  const [actorFid, setActorFid] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const ctx = await sdk.context;
        if (ctx?.user?.fid) setActorFid(ctx.user.fid);
      } catch {
        /* */
      }
    })();
  }, []);

  if (actorFid !== creatorFid) {
    return (
      <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-3 text-center text-xs text-[var(--color-text-dim)]">
        Awaiting resolution from market creator.
      </p>
    );
  }

  function resolve(resolution: Resolution) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/markets/${marketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resolution, actorFid }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "resolve_failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
        You created this market — resolve it
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Btn
          onClick={() => resolve("yes")}
          disabled={pending}
          className="bg-[var(--color-yes)] text-black hover:opacity-90"
          icon={<Check size={14} />}
          label="YES"
        />
        <Btn
          onClick={() => resolve("no")}
          disabled={pending}
          className="bg-[var(--color-no)] text-black hover:opacity-90"
          icon={<X size={14} />}
          label="NO"
        />
        <Btn
          onClick={() => resolve("void")}
          disabled={pending}
          className="bg-[var(--color-bg)] text-[var(--color-text-dim)] hover:text-white"
          icon={<Ban size={14} />}
          label="Void"
        />
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-[var(--color-no)]">{error}</p>
      )}
    </div>
  );
}

function Btn({
  onClick,
  disabled,
  className,
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  className: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold disabled:opacity-50 " +
        className
      }
    >
      {icon} {label}
    </button>
  );
}
