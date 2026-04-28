import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Mini App manifest. Spec: https://miniapps.farcaster.xyz/docs/specification#manifest
 *
 * Field length limits enforced by Farcaster:
 *   - name:        max 32 chars
 *   - subtitle:    max 30 chars
 *   - description: max 170 chars
 *   - tags:        max 5 entries, each max 20 chars (lowercase, no spaces)
 *
 * To publish on Farcaster, you must sign this manifest with your custody address.
 * Generate the accountAssociation values at:
 *   https://farcaster.xyz/~/developers/mini-apps/manifest
 * Then set FARCASTER_HEADER / FARCASTER_PAYLOAD / FARCASTER_SIGNATURE in env.
 */
export async function GET() {
  const url = baseUrl();
  const accountAssociation =
    process.env.FARCASTER_HEADER &&
    process.env.FARCASTER_PAYLOAD &&
    process.env.FARCASTER_SIGNATURE
      ? {
          header: process.env.FARCASTER_HEADER,
          payload: process.env.FARCASTER_PAYLOAD,
          signature: process.env.FARCASTER_SIGNATURE,
        }
      : undefined;

  return NextResponse.json({
    accountAssociation,
    miniapp: {
      version: "1",
      name: "Forecast",
      iconUrl: `${url}/icon.png`,
      homeUrl: url,
      imageUrl: `${url}/api/og`,
      buttonTitle: "Open Forecast",
      splashImageUrl: `${url}/icon.png`,
      splashBackgroundColor: "#0b0b12",
      subtitle: "Put a number on it.",
      description:
        "Prediction markets, native to Farcaster. Forecast on casts, earn a Brier score, climb the leaderboard.",
      primaryCategory: "finance",
      tags: ["predictions", "markets", "brier", "social"],
    },
  });
}
