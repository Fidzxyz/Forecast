import { NextResponse } from "next/server";
import { getMarket, listForecasts, upsertForecast } from "@/lib/store";
import type { Forecast } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const forecasts = await listForecasts(id);
  return NextResponse.json({ forecasts });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const market = await getMarket(id);
  if (!market) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (market.status === "resolved") {
    return NextResponse.json({ error: "market_resolved" }, { status: 409 });
  }
  if (market.closesAt < Date.now()) {
    return NextResponse.json({ error: "market_closed" }, { status: 409 });
  }

  const body = (await req.json()) as {
    probability: number;
    user: { fid: number; username?: string; displayName?: string; pfpUrl?: string };
  };

  if (!body.user?.fid) {
    return NextResponse.json({ error: "missing_user_fid" }, { status: 400 });
  }
  const p = Number(body.probability);
  if (!Number.isFinite(p) || p < 0.01 || p > 0.99) {
    return NextResponse.json(
      { error: "probability_out_of_range", message: "use 0.01..0.99" },
      { status: 400 }
    );
  }

  const forecast: Forecast = {
    id: `${id}:${body.user.fid}:${Date.now()}`,
    marketId: id,
    user: body.user,
    probability: p,
    createdAt: Date.now(),
  };
  await upsertForecast(forecast);
  return NextResponse.json({ forecast }, { status: 201 });
}
