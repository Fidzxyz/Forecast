import type { Market } from "./types";
import { baseUrl } from "./utils";

/**
 * Build the Mini App Embed JSON for the fc:miniapp meta tag.
 * https://miniapps.farcaster.xyz/docs/specification#mini-app-embed
 */
export function buildEmbed(opts: {
  imageUrl: string;
  title: string;
  url: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
}) {
  return {
    version: "1",
    imageUrl: opts.imageUrl,
    button: {
      title: opts.title.slice(0, 32),
      action: {
        type: "launch_frame" as const,
        name: "Forecast",
        url: opts.url,
        splashImageUrl: opts.splashImageUrl ?? `${baseUrl()}/icon.png`,
        splashBackgroundColor: opts.splashBackgroundColor ?? "#0b0b12",
      },
    },
  };
}

export function homeEmbed() {
  const url = baseUrl();
  return buildEmbed({
    imageUrl: `${url}/api/og`,
    title: "Open Forecast",
    url,
  });
}

export function marketEmbed(market: Market) {
  const url = baseUrl();
  return buildEmbed({
    imageUrl: `${url}/api/og/market/${market.id}`,
    title: "Make your forecast",
    url: `${url}/market/${market.id}`,
  });
}
