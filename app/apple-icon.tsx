import { ImageResponse } from "next/og";

// Apple touch icon — mascot on Tilt Purple, slightly larger margins than the favicon.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const mascot = await fetch(
    new URL("./icon-mascot.png", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7A3CE2",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mascot as unknown as string}
          width={104}
          height={139}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
