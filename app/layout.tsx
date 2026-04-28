import type { Metadata } from "next";
import "./globals.css";
import { homeEmbed } from "@/lib/embed";
import { baseUrl } from "@/lib/utils";

const url = baseUrl();
const embed = homeEmbed();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: "Forecast — prediction markets, native to Farcaster",
  description:
    "Far·caster → Fore·cast. Make calibrated predictions on casts. Track your Brier score. Climb the leaderboard.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Forecast",
    description: "Prediction markets, native to Farcaster.",
    images: [`${url}/api/og`],
    url,
    siteName: "Forecast",
    type: "website",
  },
  other: {
    "fc:miniapp": JSON.stringify(embed),
    "fc:frame": JSON.stringify(embed),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
