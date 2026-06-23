import { ImageResponse } from "next/og";

// Favicon — the Beercade mascot on a Tilt Purple field.
export const runtime = "edge";
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default async function Icon() {
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
        { }
        <img
          src={mascot as unknown as string}
          width={150}
          height={201}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
