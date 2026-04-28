import { ImageResponse } from "next/og";
import { baseUrl } from "@/lib/utils";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 800 }; // 3:2 ratio per fc:miniapp spec

export async function GET() {
  const iconUrl = `${baseUrl()}/icon.png`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0b0b12 0%, #1a0d2e 50%, #2d1b4e 100%)",
          color: "white",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl}
            alt=""
            width={104}
            height={104}
            style={{ borderRadius: 28, boxShadow: "0 20px 60px rgba(124,92,255,0.4)" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>Forecast</div>
            <div style={{ fontSize: 24, color: "#9b9bb0", marginTop: -4 }}>
              Far·caster → Fore·cast
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -3,
            marginBottom: 32,
            display: "flex",
          }}
        >
          Put a number on it.
        </div>

        <div style={{ fontSize: 32, color: "#ececf0", lineHeight: 1.4, display: "flex", maxWidth: 900 }}>
          Prediction markets native to Farcaster. Earn a Brier score, climb the leaderboard, get
          credit for being calibrated — not loud.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <Pill bg="#2dd4bf">YES</Pill>
            <Pill bg="#f87171">NO</Pill>
            <Pill bg="#7c5cff">1–99%</Pill>
          </div>
          <div style={{ fontSize: 22, color: "#9b9bb0" }}>tap to forecast →</div>
        </div>
      </div>
    ),
    SIZE
  );
}

function Pill({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <div
      style={{
        background: bg,
        color: "#0b0b12",
        fontSize: 28,
        fontWeight: 900,
        padding: "14px 28px",
        borderRadius: 999,
        display: "flex",
      }}
    >
      {children}
    </div>
  );
}
