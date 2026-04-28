import { NextResponse } from "next/server";
import { createMarket, ensureSeed, listMarkets } from "@/lib/store";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeed();
  const markets = await listMarkets();
  return NextResponse.json({ markets });
}

interface CreateBody {
  question: string;
  description?: string;
  category?: string;
  closesInHours?: number;
  creator: { fid: number; username?: string; displayName?: string; pfpUrl?: string };
  sourceCastHash?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(req: Request) {
  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.question || body.question.length < 10) {
    return NextResponse.json({ error: "question_too_short" }, { status: 400 });
  }
  if (!body.creator?.fid) {
    return NextResponse.json({ error: "missing_creator_fid" }, { status: 400 });
  }
  const closesInHours = Math.max(1, Math.min(24 * 365, body.closesInHours ?? 24 * 7));

  const id =
    slugify(body.question).slice(0, 40) +
    "-" +
    Math.random().toString(36).slice(2, 6);

  const market: Market = {
    id,
    question: body.question.trim(),
    description: body.description?.trim(),
    category: body.category?.trim() || "General",
    createdAt: Date.now(),
    closesAt: Date.now() + closesInHours * 3600_000,
    status: "open",
    creator: body.creator,
    sourceCastHash: body.sourceCastHash,
  };
  await createMarket(market);
  return NextResponse.json({ market }, { status: 201 });
}
