import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Mini App manifest. Spec: https://miniapps.farcaster.xyz/docs/specification#manifest
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
      subtitle: "Prediction markets, native to Farcaster",
      description:
        "Far·caster → Fore·cast. Make calibrated predictions on casts. Track your Brier score. Climb the leaderboard for being right, not loud.",
      primaryCategory: "finance",
      tags: ["predictions", "markets", "calibration", "social"],
      // webhookUrl: `${url}/api/webhook`, // enable if you implement notifications
    },
  });
}
