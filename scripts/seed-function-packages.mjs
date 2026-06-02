// Seed the three function package tiers into Sanity.
//
// Idempotent: uses deterministic _ids + createOrReplace, so re-running updates
// in place rather than duplicating. After seeding, the content is editable in
// the studio (studio → Function package).
//
// Run:  node --env-file=.env.local scripts/seed-function-packages.mjs
//
// Requires SANITY_API_WRITE_TOKEN (+ NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET)
// in .env.local. Bracketed [..] values are unconfirmed — edit in the studio
// before launch (deposits, min spend, capacity, food specifics).

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() ?? "2026-05-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN. " +
      "Run with: node --env-file=.env.local scripts/seed-function-packages.mjs"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const packages = [
  {
    _id: "functionPackage.long-pour",
    _type: "functionPackage",
    name: "The Long Pour",
    bestFor: "Post-work · small birthdays",
    tagline:
      "A reserved corner, a tab, and the machines warmed up. For when it's a handful of you and you can't be bothered organising more than that.",
    groupSize: "8–15",
    price: "$35 / head",
    priceNote: "minimum 8 people",
    inclusions: [
      "A reserved cluster of tables near the machines, held for your group all night.",
      "A 3-hour drinks tab to a limit you set up front; when it's reached, the bar reverts to normal service.",
      "Three machines of your choice on free play.",
      "One starter platter to share on arrival.",
    ],
    toHold: "1 week's notice. Deposit $[XX], applied to your final bill.",
    pitch:
      "The walk-in night, but the good table's already yours and the first round's sorted.",
    featured: false,
    order: 1,
  },
  {
    _id: "functionPackage.back-room",
    _type: "functionPackage",
    name: "The Back Room",
    bestFor: "Birthdays · team nights",
    tagline:
      "Four pinball tables and the Daytona twin-seater in one space, so nobody's queuing for one machine while everyone else drinks.",
    groupSize: "15–30",
    price: "$48 / head",
    priceNote: "a group of 18 lands at roughly $864 all in",
    inclusions: [
      "Exclusive use of the back room (four pinball tables and the Daytona twin-seater) from open.",
      "A 4-hour drinks tab to a limit you set.",
      "Every machine in the back room on free play all night.",
      "A starter platter on arrival, plus a second feed mid-session [confirm menu].",
      "A held window emailed to you in writing, with the full breakdown, before you commit.",
    ],
    toHold: "2–4 weeks' notice. Deposit $[XXX], applied to your final bill.",
    pitch:
      "Your own room, your own machines, four hours, one number; and it survives the forward to your boss.",
    featured: true,
    order: 2,
  },
  {
    _id: "functionPackage.lock-in",
    _type: "functionPackage",
    name: "The Lock-In",
    bestFor: "Company parties · milestones",
    tagline:
      "The whole place, or near enough. A host runs a pinball bracket, the HI SCORE board goes up, and the Godzilla LE gets held for the final.",
    groupSize: "30 to whole-venue",
    price: "From $[X,XXX] min spend",
    priceNote: "lower midweek than Friday or Saturday",
    inclusions: [
      "Whole-venue hire, or the back room plus the main floor [confirm by night].",
      "An extended drinks tab or a full beverage package, your call.",
      "Every machine in the building on free play.",
      "A full food spread [confirm the spread].",
      "A Pinball Night host running a knockout tournament, with a printed HI SCORE board and the Godzilla LE held for the final.",
    ],
    toHold: "3–4 weeks' notice. Deposit $[XXX].",
    pitch:
      "The night people text about the next morning. No costume, no velvet rope.",
    featured: false,
    order: 3,
  },
];

// Legacy scaffold sample docs replaced by the real tiers above.
const legacySampleIds = [
  "sample-package-quick",
  "sample-package-longpour",
  "sample-package-wholefloor",
];

let tx = client.transaction();
for (const id of legacySampleIds) tx = tx.delete(id);
for (const doc of packages) tx = tx.createOrReplace(doc);

tx.commit()
  .then(() => {
    console.log(
      `Seeded ${packages.length} function packages and removed ${legacySampleIds.length} legacy samples in "${dataset}".`
    );
  })
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
