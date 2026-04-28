import { NextResponse } from "next/server";
import { listAllForecasts } from "@/lib/store";
import { aggregateUser } from "@/lib/brier";
import type { UserStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await listAllForecasts();
  const grouped = new Map<number, typeof all>();
  for (const f of all) {
    const list = grouped.get(f.user.fid) ?? [];
    list.push(f);
    grouped.set(f.user.fid, list);
  }
  const stats: UserStats[] = [];
  for (const [, list] of grouped) {
    stats.push(aggregateUser(list, list[0].user));
  }
  stats.sort((a, b) => b.score - a.score);
  return NextResponse.json({ leaderboard: stats });
}
