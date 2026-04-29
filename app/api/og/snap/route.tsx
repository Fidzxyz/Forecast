import { ImageResponse } from "next/og";
import { baseUrl } from "@/lib/utils";
import { parseSnapParams, snapEmoji, snapQuestion, stance } from "@/lib/snap";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 800 };

export async function GET(request: Request) {
  const u = new URL(request.url);
  const sp = {
    t: u.searchParams.get("t") ?? undefined,
    q: u.searchParams.get("q") ?? undefined,
    p: u.searchParams.get("p") ?? undefined,
    by: u.searchParams.get("by") ?? undefined,
  };
  const parsed = parseSnapParams(sp);
  const iconUrl = `${baseUrl()}/icon.png`;
  const question = snapQuestion({
    topic: parsed.topic,
    customQuestion: parsed.customQuestion,
  });
  const emoji = snapEmoji(parsed.topic);
  const hasProb = parsed.probability !== null;
  const p = parsed.probability ?? 50;
  const verdict = stance(p);
  const tint =
    verdict === "YES" ? "#2dd4bf" : verdict === "NO" ? "#f87171" : "#9b9bb0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0b0b12 0%, #1a0d2e 45%, #2d1b4e 100%)",
          color: "white",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 36,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconUrl}
              alt=""
              width={72}
              height={72}
              style={{
                borderRadius: 20,
                boxShadow: "0 14px 40px rgba(124,92,255,0.4)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1, display: "flex" }}>
                Forecast
              </div>
              <div style={{ fontSize: 18, color: "#9b9bb0", display: "flex" }}>
                snap mode
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "linear-gradient(135deg, #7c5cff 0%, #ff4d8d 100%)",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              boxShadow: "0 12px 36px rgba(124,92,255,0.45)",
            }}
          >
            ⚡ Snap
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 28,
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 96, lineHeight: 1, display: "flex" }}>{emoji}</div>
          <div
            style={{
              fontSize: question.length > 80 ? 48 : 60,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              display: "flex",
              flex: 1,
            }}
          >
            {question}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 64,
            right: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {hasProb ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 16,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: "#9b9bb0",
                  marginBottom: 4,
                  display: "flex",
                }}
              >
                {parsed.byUsername ? `@${parsed.byUsername} says` : "snap says"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 168,
                    fontWeight: 900,
                    color: tint,
                    lineHeight: 1,
                    letterSpacing: -6,
                    fontVariantNumeric: "tabular-nums",
                    display: "flex",
                  }}
                >
                  {`${p}%`}
                </div>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 900,
                    color: tint,
                    letterSpacing: -1,
                    display: "flex",
                  }}
                >
                  {verdict}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 16,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: "#9b9bb0",
                  marginBottom: 8,
                  display: "flex",
                }}
              >
                tap to lock your %
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <Pill bg="#2dd4bf">YES</Pill>
                <Pill bg="#f87171">NO</Pill>
                <Pill bg="#7c5cff">1–99%</Pill>
              </div>
            </div>
          )}

          <div
            style={{
              fontSize: 22,
              color: "#ececf0",
              fontWeight: 700,
              opacity: 0.9,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {hasProb ? "beat the snap →" : "calibrated, not loud"}
          </div>
        </div>
      </div>
    ),
    SIZE,
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
