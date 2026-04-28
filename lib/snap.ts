import { baseUrl } from "./utils";

/**
 * Snap mode = lightweight viral prediction cards.
 * Each Snap is a single yes/no question with a probability slider.
 * Sharing a Snap creates a remixable URL that anyone can beat.
 */

export interface SnapTopic {
  id: string;
  question: string;
  emoji: string;
  category: string;
  criterion?: string;
}

export const SNAP_TOPICS: SnapTopic[] = [
  {
    id: "clanker-1b",
    question: "Will Clanker hit $1B in cumulative token volume by EOY?",
    emoji: "🤖",
    category: "Farcaster",
    criterion: "Sum of all $clanker-deployed token volumes on Base, snapshot Dec 31.",
  },
  {
    id: "higher-vs-degen",
    question: "Will $HIGHER flip $DEGEN in market cap?",
    emoji: "📈",
    category: "Memecoin",
    criterion: "Coingecko fully diluted mcap, anytime in next 90 days.",
  },
  {
    id: "fc-100k-mini-app",
    question: "Will any Farcaster mini app cross 100k DAUs?",
    emoji: "📲",
    category: "Mini Apps",
    criterion: "Self-reported or observed via @dwr.eth's official stats.",
  },
  {
    id: "fc-1m-daus",
    question: "Will Farcaster hit 1M DAUs before July?",
    emoji: "🌐",
    category: "Farcaster",
    criterion: "@dwr.eth's monthly stats post.",
  },
  {
    id: "vitalik-fc-cast",
    question: "Will Vitalik cast on Farcaster this month?",
    emoji: "🦄",
    category: "Crypto",
    criterion: "Any cast from @vitalik.eth in the next 30 days.",
  },
  {
    id: "btc-100k-eoy",
    question: "Will BTC close above \$100k on Dec 31?",
    emoji: "₿",
    category: "Crypto",
    criterion: "Coinbase BTC-USD spot at 23:59 UTC, Dec 31.",
  },
  {
    id: "agi-2026",
    question: "Will a major lab declare AGI by end of 2026?",
    emoji: "🧠",
    category: "AI",
    criterion: "Public announcement from OpenAI / Anthropic / DeepMind / Meta / xAI.",
  },
  {
    id: "fc-ipo-2027",
    question: "Will Farcaster IPO by end of 2027?",
    emoji: "🏛️",
    category: "Farcaster",
    criterion: "S-1 filing or direct listing on a US exchange.",
  },
];

export function getSnapTopic(id: string | null | undefined): SnapTopic | null {
  if (!id) return null;
  return SNAP_TOPICS.find((t) => t.id === id) ?? null;
}

export function parseSnapParams(params: {
  t?: string;
  q?: string;
  p?: string;
  by?: string;
}): {
  topic: SnapTopic | null;
  customQuestion: string | null;
  probability: number | null;
  byUsername: string | null;
} {
  const topic = getSnapTopic(params.t);
  const customQuestion = !topic && params.q ? params.q.slice(0, 200) : null;
  const pInt = params.p ? parseInt(params.p, 10) : NaN;
  const probability =
    Number.isFinite(pInt) && pInt >= 1 && pInt <= 99 ? pInt : null;
  const byUsername = params.by ? params.by.replace(/^@/, "").slice(0, 32) : null;
  return { topic, customQuestion, probability, byUsername };
}

export function buildSnapUrl(opts: {
  topic?: SnapTopic | string | null;
  customQuestion?: string | null;
  probability?: number | null;
  byUsername?: string | null;
  absolute?: boolean;
}): string {
  const params = new URLSearchParams();
  const topicId =
    typeof opts.topic === "string" ? opts.topic : opts.topic?.id ?? null;
  if (topicId) params.set("t", topicId);
  if (!topicId && opts.customQuestion) params.set("q", opts.customQuestion);
  if (opts.probability !== undefined && opts.probability !== null) {
    params.set("p", String(opts.probability));
  }
  if (opts.byUsername) params.set("by", opts.byUsername);
  const qs = params.toString();
  const path = qs ? `/snap?${qs}` : "/snap";
  return opts.absolute ? `${baseUrl()}${path}` : path;
}

export function snapQuestion(opts: {
  topic: SnapTopic | null;
  customQuestion: string | null;
}): string {
  return (
    opts.topic?.question ??
    opts.customQuestion ??
    "Put a number on something."
  );
}

export function snapEmoji(topic: SnapTopic | null): string {
  return topic?.emoji ?? "🎯";
}

export function stance(p: number): "YES" | "NO" | "coinflip" {
  if (p > 55) return "YES";
  if (p < 45) return "NO";
  return "coinflip";
}
