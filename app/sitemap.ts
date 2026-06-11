import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { allMachinesQuery, upcomingEventsQuery } from "@/lib/sanity/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beercade.com.au";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE, changeFrequency: "daily", priority: 1 },
  { url: `${BASE}/machines`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${BASE}/whats-on`, changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/menu`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE}/functions`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE}/find-us`, changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [machines, events] = await Promise.all([
    sanityClient
      .fetch<{ slug: { current: string } }[]>(allMachinesQuery)
      .catch(() => []),
    sanityClient
      .fetch<{ slug: { current: string } }[]>(upcomingEventsQuery)
      .catch(() => []),
  ]);

  const machineRoutes: MetadataRoute.Sitemap = machines.map((m) => ({
    url: `${BASE}/machines/${m.slug.current}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE}/whats-on/${e.slug.current}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...STATIC_ROUTES, ...machineRoutes, ...eventRoutes];
}
