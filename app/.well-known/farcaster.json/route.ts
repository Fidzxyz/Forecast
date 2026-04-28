import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Mini App manifest. Spec: https://miniapps.farcaster.xyz/docs/specification#manifest
 *
 * accountAssociation values are PUBLIC by design — they're cryptographic proof that
 * the FID 301313 custody address (0x39F3bb4Dc08E40D4d0039E137634ce223B70CC9b) approved
 * this domain. Knowing them lets anyone verify, but never impersonate, the owner.
 *
 * Generated via: https://farcaster.xyz/~/developers/mini-apps/manifest
 * Bound domain: forecast-puce-nine.vercel.app
 *
 * Env vars (FARCASTER_HEADER / FARCASTER_PAYLOAD / FARCASTER_SIGNATURE) take precedence
 * if set — useful when re-binding to a custom domain later.
 */

const SIGNED_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjMwMTMxMywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDM5RjNiYjREYzA4RTQwRDRkMDAzOUUxMzc2MzRjZTIyM0I3MENDOWIifQ",
  payload: "eyJkb21haW4iOiJmb3JlY2FzdC1wdWNlLW5pbmUudmVyY2VsLmFwcCJ9",
  signature:
    "t8EquMIDeiXE8hyQ/OC+/k+bXAx4vt9AcefZInDaw1MLbHJM4HStlZsrgW9oRoD3Y3sOJuZPFUo6yBEVm51w1hw=",
};

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
      : SIGNED_ACCOUNT_ASSOCIATION;

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
