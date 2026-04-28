import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { MiniAppReady } from "@/app/providers";
import { SnapComposer } from "@/components/SnapComposer";
import {
  SNAP_TOPICS,
  buildSnapUrl,
  parseSnapParams,
  snapEmoji,
  snapQuestion,
} from "@/lib/snap";
import { buildEmbed } from "@/lib/embed";
import { baseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    t?: string;
    q?: string;
    p?: string;
    by?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const parsed = parseSnapParams(sp);
  const url = baseUrl();

  const ogParams = new URLSearchParams();
  if (parsed.topic) ogParams.set("t", parsed.topic.id);
  else if (parsed.customQuestion) ogParams.set("q", parsed.customQuestion);
  if (parsed.probability !== null) ogParams.set("p", String(parsed.probability));
  if (parsed.byUsername) ogParams.set("by", parsed.byUsername);
  const ogUrl = ogParams.toString()
    ? `${url}/api/og/snap?${ogParams.toString()}`
    : `${url}/api/og/snap`;

  const snapUrl = `${url}${buildSnapUrl({
    topic: parsed.topic,
    customQuestion: parsed.customQuestion,
    probability: parsed.probability,
    byUsername: parsed.byUsername,
  })}`;

  const verb = parsed.probability !== null ? "Beat the snap" : "Take the snap";
  const embed = buildEmbed({
    imageUrl: ogUrl,
    title: verb,
    url: snapUrl,
  });

  const titleQ = snapQuestion({
    topic: parsed.topic,
    customQuestion: parsed.customQuestion,
  });
  const title =
    parsed.probability !== null && parsed.byUsername
      ? `@${parsed.byUsername} said ${parsed.probability}% — ${titleQ}`
      : parsed.probability !== null
      ? `${parsed.probability}% — ${titleQ}`
      : `Snap: ${titleQ}`;

  return {
    title: `${title} · Forecast`,
    description: "Forecast Snap — one-tap predictions on Farcaster.",
    openGraph: {
      title,
      description: "Tap your %. Cast it. Calibrated, not loud.",
      images: [ogUrl],
      url: snapUrl,
      type: "website",
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
      "fc:frame": JSON.stringify(embed),
    },
  };
}

export default async function SnapPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const parsed = parseSnapParams(sp);

  const hasContext =
    parsed.topic !== null || parsed.customQuestion !== null;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <MiniAppReady />

      <header className="mb-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-dim)] hover:text-white"
        >
          <ArrowLeft size={14} /> Forecast
        </Link>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-dim)] hover:text-white"
        >
          <Trophy size={14} /> Leaders
        </Link>
      </header>

      {hasContext ? (
        <SnapComposer
          topic={parsed.topic}
          customQuestion={parsed.customQuestion}
          initialProbability={parsed.probability}
          byUsername={parsed.byUsername}
        />
      ) : (
        <SnapTopicGallery />
      )}

      <footer className="mt-10 flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-text-dim)]">
        <Sparkles size={12} /> Snap mode — one-tap, remix-friendly. Built on
        Forecast.
      </footer>
    </main>
  );
}

function SnapTopicGallery() {
  return (
    <div>
      <div className="mb-6 rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[#15101f] via-[#1a0d2e] to-[#1f0d3d] p-6">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
          <Sparkles size={14} /> Snap
        </div>
        <h1 className="mb-2 text-3xl font-black leading-tight tracking-tight">
          One tap. <span className="text-[var(--color-accent)]">One %.</span>
          <br />
          One viral take.
        </h1>
        <p className="text-sm leading-relaxed text-[var(--color-text-dim)]">
          Pick a hot question. Drag your %. Cast your snap. Anyone who sees the
          embed can beat your forecast in one tap.
        </p>
      </div>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
        Trending snaps
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SNAP_TOPICS.map((t) => (
          <Link
            key={t.id}
            href={buildSnapUrl({ topic: t.id })}
            className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-4 transition hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
          >
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
              <span className="text-base leading-none">{snapEmoji(t)}</span>
              {t.category}
            </div>
            <div className="text-sm font-bold leading-snug">{t.question}</div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--color-text-dim)]">
              <span>tap to forecast</span>
              <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 font-mono text-[10px]">
                /{t.id}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-[var(--color-text-dim)]">
        Want depth, not a snap? Open{" "}
        <Link href="/" className="text-[var(--color-accent)] underline">
          full markets
        </Link>
        .
      </p>
    </div>
  );
}
