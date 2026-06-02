import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";

// Fonts are self-hosted (next/font/local) rather than next/font/google so the
// production build has no build-time dependency on fonts.gstatic.com. The
// woff2 files in ./fonts are the exact latin subsets Google serves for these
// families; refresh them if the brand families change. (See brand guide §4.)

// Body + heading family (brand guide §4.2). Variable font ships the full
// weight range — Regular (400) for body, Medium (500) for emphasis, Bold (700)
// for H2/inline subheads.
const archivo = localFont({
  src: "./fonts/archivo-latin-variable.woff2",
  weight: "100 900",
  variable: "--font-archivo",
  display: "swap",
});

// Display family (brand guide §4.1). Single fixed heavy weight — headlines,
// hero, buttons.
const archivoBlack = localFont({
  src: "./fonts/archivo-black-latin-400.woff2",
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

// Tertiary arcade accent (brand guide §4.3).
const pressStart = localFont({
  src: "./fonts/press-start-2p-latin-400.woff2",
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Beercade — Redfern",
    template: "%s — Beercade Redfern",
  },
  description:
    "Arcade bar at 113 Regent Street, Redfern. Pinball, arcade, cold beer. Two minutes from the station.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://beercade.com.au"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-AU"
      className={`${archivo.variable} ${archivoBlack.variable} ${pressStart.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
