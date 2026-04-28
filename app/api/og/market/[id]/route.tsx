import { ImageResponse } from "next/og";
import { getMarket, listForecasts } from "@/lib/store";
import { consensus } from "@/lib/brier";
import { baseUrl } from "@/lib/utils";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 800 };

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const market = await getMarket(id);
  if (!market) return new Response("not found", { status: 404 });
  const forecasts = await listForecasts(id);
  const cons = consensus(forecasts);
  const consPct = cons === null ? null : Math.round(cons * 100);

  const yesColor = "#2dd4bf";
  const noColor = "#f87171";
  const consColor = cons === null ? "#9b9bb0" : cons > 0.5 ? yesColor : noColor;
  const iconUrl = `${baseUrl()}/icon.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0b0b12 0%, #14141f 60%, #1a0d2e 100%)",
          color: "white",
          padding: 70,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconUrl} alt="" width={64} height={64} style={{ borderRadius: 18 }} />
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Forecast</div>
          <div style={{ fontSize: 22, color: "#7c5cff", fontWeight: 700, marginLeft: 8 }}>
            {`· ${market.category}`}
          </div>
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: -2,
            display: "flex",
            marginBottom: 60,
            maxWidth: 1060,
          }}
        >
          {market.question}
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: "auto", alignItems: "stretch" }}>
          <Stat
            label="Consensus"
            value={consPct === null ? "—" : `${consPct}%`}
            tint={consColor}
            big
          />
          <Stat label="Forecasts" value={String(forecasts.length)} tint="#fff" />
          <Stat
            label="Closes"
            value={
              market.closesAt < Date.now()
                ? "Closed"
                : `${Math.max(1, Math.round((market.closesAt - Date.now()) / 86400000))}d`
            }
            tint="#fff"
          />
        </div>

        <div
          style={{
            marginTop: 40,
            padding: "20px 32px",
            borderRadius: 24,
            background: "rgba(124, 92, 255, 0.15)",
            border: "2px solid rgba(124, 92, 255, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>What&apos;s your number?</div>
          <div style={{ fontSize: 24, color: "#9b9bb0" }}>open to forecast →</div>
        </div>
      </div>
    ),
    SIZE
  );
}

function Stat({
  label,
  value,
  tint,
  big,
}: {
  label: string;
  value: string;
  tint: string;
  big?: boolean;
}) {
  return (
    <div
      style={{
        flex: big ? 2 : 1,
        background: "rgba(255,255,255,0.03)",
        border: "2px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 18,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: "#9b9bb0",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: big ? 100 : 56,
          fontWeight: 900,
          letterSpacing: -2,
          color: tint,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
