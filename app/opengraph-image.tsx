import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Beercade — Arcade bar in Redfern";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const wordmark = await fetch(
    new URL("./og-wordmark.png", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          background: "#2A1745",
          backgroundImage:
            "radial-gradient(circle at 72% 26%, rgba(122,60,226,0.55), transparent 46%), radial-gradient(circle at 24% 80%, rgba(255,94,31,0.28), transparent 44%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wordmark as unknown as string}
          width={760}
          height={311}
          alt=""
        />
        <div
          style={{
            color: "#F7EFE3",
            opacity: 0.72,
            fontSize: 30,
            fontFamily: "sans-serif",
          }}
        >
          113-115 Regent Street, Redfern · Pinball, arcade, cold beer
        </div>
      </div>
    ),
    { ...size }
  );
}
