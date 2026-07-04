// Migrate the functions page content into Sanity.
//
// 1. Deletes every legacy `functionPackage` document (the old tiered pricing
//    model the venue no longer runs — schema removed).
// 2. Seeds the single `functionsPage` document with the copy that was
//    previously hardcoded in app/(site)/functions/page.tsx.
//
// Idempotent: fixed _id + createOrReplace for the page, delete-by-query for the
// legacy docs, so re-running converges rather than duplicating.
//
// Run:  node --env-file=.env.local scripts/migrate-functions-page.mjs
//
// Requires SANITY_API_WRITE_TOKEN (+ NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET).

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() ?? "2026-05-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN. " +
      "Run with: node --env-file=.env.local scripts/migrate-functions-page.mjs"
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

const k = (s) => ({ _key: s });

const functionsPage = {
  _id: "functionsPage",
  _type: "functionsPage",
  kicker: "Private hire",
  title: "Book your function.",
  lede: "Beercade is the perfect place to host your next birthday party, hens night, corporate event, or random get-together with your mates. Fill out our function enquiry form below, and a team member will get in touch.",

  contactHeading: "Get in touch.",
  contactIntro:
    "Tell us your date, rough headcount, and the occasion. You'll get a real reply with a held window and the full breakdown, not a form letter; normally within 24 hours.",
  contactEmail: "functions@beercade.com.au",
  contactPhoneName: "Roger",
  contactPhoneDisplay: "0400 112 445",
  contactPhoneHref: "+61400112445",

  tokensHeading: "Tokens and drinks.",
  tokensIntro:
    "The machines run on tokens; most games are $2, or two tokens a play. Every guest gets a bag of tokens and drink tickets. Here are the per-head packages, most popular first.",
  tokenOptions: [
    {
      ...k("opt1"),
      _type: "tokenOption",
      heading: "Option 1 · $50pp",
      description: "25 tokens and 2 drink tickets.",
      mostPopular: true,
    },
    {
      ...k("opt2"),
      _type: "tokenOption",
      heading: "Option 2 · $50pp",
      description: "60 tokens, no drinks; guests buy their own at the bar.",
      mostPopular: false,
    },
    {
      ...k("opt3"),
      _type: "tokenOption",
      heading: "Option 3 · $60pp",
      description: "35 tokens and 3 drink tickets.",
      mostPopular: false,
    },
    {
      ...k("opt4"),
      _type: "tokenOption",
      heading: "Option 4 · bulk tokens",
      description: "Buy in one lump and let guests help themselves.",
      mostPopular: false,
    },
  ],
  bulkHeading: "Buy tokens in bulk",
  bulkRows: [
    { ...k("b100"), _type: "bulkRow", spend: "$100", tokens: "125" },
    { ...k("b200"), _type: "bulkRow", spend: "$200", tokens: "260" },
    { ...k("b300"), _type: "bulkRow", spend: "$300", tokens: "450" },
    { ...k("b500"), _type: "bulkRow", spend: "$500", tokens: "850" },
  ],
  bulkNote:
    "Buying in bulk on the day saves more again, and whatever's left over is yours to keep.",
  rules: [
    {
      ...k("rTokens"),
      _type: "rule",
      label: "Tokens never expire.",
      body: "Don't burn them all on the night; take the leftovers home and use them whenever. They can't be cashed out or swapped for drinks, but they keep forever.",
    },
    {
      ...k("rDrinks"),
      _type: "rule",
      label: "Drink tickets are spent on the night.",
      body: "One ticket gets any drink except cocktails, which are two. They can't be swapped for cash or tokens, and they expire the second your function ends. Tell your guests; they'll try.",
    },
  ],
  licensedNote:
    "We're fully licensed. Under-18s are welcome until 10pm with a responsible adult, family or guardian; after that it's adults only.",

  foodIntro:
    "The bar does small snacks; toasties and a range of chips. For anything more, bring your own or order in. Plenty of our neighbours deliver straight to us, and we'll pass on their details so you can place the order yourself for the day.",
  deliveryPlaces: [
    {
      ...k("lacoppola"),
      _type: "deliveryPlace",
      name: "La Coppola",
      url: "https://www.lacoppola.com.au",
      note: "great pizza",
    },
    {
      ...k("huxtaburger"),
      _type: "deliveryPlace",
      name: "Huxtaburger",
      url: "https://www.huxtaburger.com.au",
      note: "burgers and sliders",
    },
    {
      ...k("bigdaddies"),
      _type: "deliveryPlace",
      name: "Big Daddies Burger Bar",
      url: "https://www.bigdaddiesburgerbar.com.au",
      note: "American-style burgers",
    },
    {
      ...k("sushitopia"),
      _type: "deliveryPlace",
      name: "Sushi Topia, Redfern",
      note: "order through Uber Eats",
    },
    {
      ...k("rararamen"),
      _type: "deliveryPlace",
      name: "Rara Ramen",
      url: "https://www.rararamen.com.au",
      note: "vegetarian, and properly good",
    },
  ],
  hoursNormallyOpen: "Wed to Sat, 3pm to midnight. Sun, 3pm to 10pm.",
  hoursAvailableForFunctions: "Mon to Sat, 10am to midnight. Sun, 10am to 10pm.",
  freeHireNote:
    "The gap between those two is where the free hire lives. A weekday daytime, a Monday or Tuesday, costs nothing to hold.",
};

async function run() {
  // Count legacy docs first (published + drafts), for a clear report.
  const legacy = await client.fetch(
    '*[_type == "functionPackage"]{ _id }'
  );

  let tx = client.transaction();
  for (const doc of legacy) tx = tx.delete(doc._id);
  tx = tx.createOrReplace(functionsPage);
  await tx.commit();

  console.log(
    `Deleted ${legacy.length} legacy functionPackage doc(s) and seeded the ` +
      `functionsPage singleton in "${dataset}".`
  );
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
