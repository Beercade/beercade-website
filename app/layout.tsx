import type { Metadata } from "next";
import { Archivo, Archivo_Black, Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";

// Body + heading family (brand guide §4.2). Variable font ships the full
// weight range — Regular (400) for body, Medium (500) for emphasis, Bold (700)
// for H2/inline subheads.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

// Display family (brand guide §4.1). Single fixed heavy weight — headlines,
// hero, buttons.
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

// Tertiary arcade accent (brand guide §4.3).
const pressStart = Press_Start_2P({
  subsets: ["latin"],
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
