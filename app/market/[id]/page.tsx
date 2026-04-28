import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { getMarket, listForecasts } from "@/lib/store";
import { consensus } from "@/lib/brier";
import { ForecastSubmit } from "@/components/ForecastSubmit";
import { ResolveButton } from "@/components/ResolveButton";
import { MiniAppReady } from "@/app/providers";
import { formatPercent, formatTimeLeft, baseUrl } from "@/lib/utils";
import { marketEmbed } from "@/lib/embed";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const market = await getMarket(id);
  if (!market) return { title: "Market not found" };
  const embed = marketEmbed(market);
  return {
    title: `${market.question} — Forecast`,
    description: market.description ?? "Make your prediction on Forecast.",
    openGraph: {
      title: market.question,
      description: market.description ?? "",
      images: [`${baseUrl()}/api/og/market/${market.id}`],
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
      "fc:frame": JSON.stringify(embed),
    },
  };
}

export default async function MarketPage({ params }: PageProps) {
  const { id } = await params;
  const market = await getMarket(id);
  if (!market) notFound();

  const forecasts = await listForecasts(market.id);
  const cons = consensus(forecasts);
  const closed = market.closesAt < Date.now() || market.status === "resolved";

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <MiniAppReady />

      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-dim)] hover:text-white"
      >
        <ArrowLeft size={14} /> All markets
      </Link>

      <article className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
          {market.category}
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="flex items-center gap-1 text-[var(--color-text-dim)]">
            <Clock size={12} /> {formatTimeLeft(market.closesAt - Date.now())}
          </span>
        </div>
        <h1 className="mb-3 text-2xl font-black leading-tight">{market.question}</h1>
        {market.description && (
          <p className="mb-4 text-sm text-[var(--color-text-dim)]">{market.description}</p>
        )}

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[var(--color-border)] bg-[#0d0d18] p-4">
          <Stat
            label="Consensus"
            value={cons === null ? "—" : formatPercent(cons)}
            tint={cons !== null && cons > 0.5 ? "yes" : "no"}
          />
          <Stat label="Forecasts" value={String(forecasts.length)} icon={<Users size={12} />} />
          <Stat
            label="Status"
            value={
              market.status === "resolved"
                ? `Resolved ${market.resolution?.toUpperCase()}`
                : closed
                ? "Closed"
                : "Open"
            }
          />
        </div>
      </article>

      {/* Forecast form / outcome */}
      <section className="mt-4">
        {market.status === "resolved" ? (
          <ResolvedBanner resolution={market.resolution!} />
        ) : closed ? (
          <ClosedBanner />
        ) : (
          <ForecastSubmit marketId={market.id} initial={cons ?? 0.5} />
        )}
      </section>

      {/* Resolve (creator only — best-effort UX) */}
      {market.status === "open" && closed && (
        <section className="mt-4">
          <ResolveButton marketId={market.id} creatorFid={market.creator.fid} />
        </section>
      )}

      {/* Recent forecasts */}
      {forecasts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
            Recent forecasts
          </h2>
          <div className="space-y-2">
            {forecasts.slice(0, 20).map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  {f.user.pfpUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.user.pfpUrl} alt="" className="h-6 w-6 rounded-full" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[var(--color-accent)]/30" />
                  )}
                  <span className="truncate font-medium">
                    {f.user.username ?? f.user.displayName ?? `fid:${f.user.fid}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {f.brierScore !== undefined && (
                    <span className="text-xs text-[var(--color-text-dim)]">
                      brier {f.brierScore.toFixed(3)}
                    </span>
                  )}
                  <span
                    className={
                      f.probability > 0.5
                        ? "font-bold text-[var(--color-yes)]"
                        : "font-bold text-[var(--color-no)]"
                    }
                  >
                    {formatPercent(f.probability)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  tint,
  icon,
}: {
  label: string;
  value: string;
  tint?: "yes" | "no";
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
        {icon}
        {label}
      </div>
      <div
        className={
          "text-lg font-black " +
          (tint === "yes" ? "text-[var(--color-yes)]" : tint === "no" ? "text-[var(--color-no)]" : "text-white")
        }
      >
        {value}
      </div>
    </div>
  );
}

function ClosedBanner() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 text-center text-sm text-[var(--color-text-dim)]">
      Forecasting window has closed. Awaiting resolution.
    </div>
  );
}

function ResolvedBanner({ resolution }: { resolution: "yes" | "no" | "void" }) {
  const map = {
    yes: { label: "Resolved YES", color: "text-[var(--color-yes)]" },
    no: { label: "Resolved NO", color: "text-[var(--color-no)]" },
    void: { label: "Voided", color: "text-[var(--color-text-dim)]" },
  } as const;
  const r = map[resolution];
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 text-center">
      <div className={"text-2xl font-black " + r.color}>{r.label}</div>
      <p className="mt-1 text-xs text-[var(--color-text-dim)]">
        Brier scores have been credited to all forecasters.
      </p>
    </div>
  );
}
