import { createClient } from "@sanity/client";

// Trim to guard against trailing newlines injected by some CI/CD env-var tools
const projectId = (
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder"
).trim();
const dataset = (
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"
).trim();
const apiVersion = (
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-05-01"
).trim();

// Public read client. The `production` dataset is private (it holds function
// enquiry + league registration PII), so anonymous reads return nothing. We read
// with a server-side read token instead. SANITY_API_READ_TOKEN is NOT a
// NEXT_PUBLIC_ var, so Next strips it from client bundles — it never reaches the
// browser. `perspective: "published"` guarantees drafts never leak to the site
// even though the request is authenticated. useCdn is off because authenticated
// reads of a private dataset bypass the public CDN.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "published",
});

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
