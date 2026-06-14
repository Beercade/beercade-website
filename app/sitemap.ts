import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { allMachinesQuery } from "@/lib/sanity/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beercade.com.au";

// What's on (/whats-on + event detail) is hidden for now, so it's left out of
// the sitemap — revert this change to re-list it.
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE, changeFrequency: "daily", priority: 1 },
  { url: `${BASE}/machines`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${BASE}/menu`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE}/functions`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE}/find-us`, changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const machines = await sanityClient
    .fetch<{ slug: { current: string } }[]>(allMachinesQuery)
    .catch(() => []);

  const machineRoutes: MetadataRoute.Sitemap = machines.map((m) => ({
    url: `${BASE}/machines/${m.slug.current}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...STATIC_ROUTES, ...machineRoutes];
}
