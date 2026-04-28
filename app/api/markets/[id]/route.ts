import { NextResponse } from "next/server";
import { getMarket, updateMarket } from "@/lib/store";
import type { Resolution } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const m = await getMarket(id);
  if (!m) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ market: m });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const market = await getMarket(id);
  if (!market) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = (await req.json()) as { resolution?: Resolution; actorFid?: number };
  if (!body.resolution || !["yes", "no", "void"].includes(body.resolution)) {
    return NextResponse.json({ error: "invalid_resolution" }, { status: 400 });
  }
  // v1: only creator can resolve. v2: oracle / multi-sig.
  if (body.actorFid !== market.creator.fid) {
    return NextResponse.json({ error: "not_authorized" }, { status: 403 });
  }
  if (market.status === "resolved") {
    return NextResponse.json({ error: "already_resolved" }, { status: 409 });
  }
  const updated = await updateMarket(id, {
    status: "resolved",
    resolution: body.resolution,
    resolvesAt: Date.now(),
  });
  return NextResponse.json({ market: updated });
}
