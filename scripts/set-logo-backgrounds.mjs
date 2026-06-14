// Set logoBackground: "dark" on the machines whose logos are too pale/light to
// read on the default cream tile (see MachineCard). Everything else keeps the
// cream default. Determined by eyeballing each logo on cream — the failures are
// the white / pale-blue / silver logos, not the dark ones.
//
// Idempotent: only patches docs that aren't already "dark".
//
// Run:  node --env-file=.env.local scripts/set-logo-backgrounds.mjs

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() ?? "2026-05-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN. " +
      "Run with: node --env-file=.env.local scripts/set-logo-backgrounds.mjs"
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// Pale/light logos that wash out on the cream tile and need the dark ground.
const DARK = [
  "AC/DC",
  "John Wick",
  "The Walking Dead",
  "Twilight Zone",
  "Donkey Kong",
  "Classic Arcade Multicade (Upright)",
  "Classic Arcade Multicade (Pedestal)",
];

const docs = await client.fetch(
  `*[_type == "machine" && name in $names]{ _id, name, logoBackground }`,
  { names: DARK }
);

const found = docs.map((d) => d.name);
const missing = DARK.filter((n) => !found.includes(n));
if (missing.length) {
  console.warn("Not found (check exact names in the studio):", missing);
}

let changed = 0;
for (const d of docs) {
  if (d.logoBackground === "dark") {
    console.log(`= ${d.name} already dark`);
    continue;
  }
  await client.patch(d._id).set({ logoBackground: "dark" }).commit();
  changed++;
  console.log(`✓ ${d.name} → dark`);
}

console.log(`\nDone. ${changed} updated, ${docs.length - changed} unchanged, ${missing.length} not found.`);
