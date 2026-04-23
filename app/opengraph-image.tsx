import { ImageResponse } from "next/og";

export const alt = "Fluent Fast";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Fluent Fast
        </div>
        <div
          style={{
            fontSize: 40,
            marginTop: 24,
            color: "#cbd5e1",
            lineHeight: 1.25,
          }}
        >
          Audio language lessons with a moderated community.
        </div>
      </div>
    ),
    size,
  );
}
