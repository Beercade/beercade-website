# Beercade Website Build Spec

For Claude Code (or another implementer) to build the Beercade website from scratch.
Document status: v1.1, authoritative. Updates land here, not in code comments.
Target launch: Day 21 of the 30-day sprint plan, public DNS cutover Thu 12 June 2026.
GitHub repo: `Beercade_website`.

v1.1 changes from v1.0: (1) function enquiry at launch is a form, not a chatbot — chatbot deferred to Sprint 2 with proper evals; (2) team inbox redesigned around `functions@beercade.com.au` as a Google Group Collaborative Inbox shared by three team members; (3) Bookings calendar separated from email; (4) required `alt` text added to all image fields; (5) Cloudflare Turnstile + Upstash rate limiting added to the form endpoint.

---

## 0. TL;DR for the implementer

Build a Next.js 14 (App Router) website for Beercade Australia, a Redfern arcade bar. Repo: `Beercade_website` on GitHub. Sanity is the headless CMS, with the studio embedded at `/studio` in the same repo. Resend handles transactional email. Kit (formerly ConvertKit) handles marketing email. A Google service account creates tentative events on the shared **Beercade Bookings** Google Calendar from function enquiries. The team coordinates via `functions@beercade.com.au` configured as a Google Group Collaborative Inbox (three members at launch). Cloudflare Turnstile gates the form. Upstash Redis rate-limits the submission endpoint. Sentry handles error monitoring (free tier). Plausible Cloud handles privacy-respecting analytics. Vercel Analytics handles Web Vitals. Vercel hosts.

There are six top-level pages, one machine detail route, one event detail route, plus thank-you, privacy, and 404. The site is content-driven from Sanity for everything except hard-coded copy in the layout shell. The visual system is locked by the Beercade Brand Guide at `OUTPUTS/Beercade/Beercade_Brand_Guide.md` — read it before writing CSS.

Acceptance criteria are at the bottom of this document. Build to those, not to assumed interpretation. Where the spec leaves a decision open, surface it back rather than guessing.

---

## 1. Stack and rationale

| Layer | Choice | Why this and not the alternatives |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components and server actions remove most of the API-route boilerplate; ISR handles Sanity content well. Pages Router is being retired. |
| Hosting | Vercel | Canonical Next.js hosting; image optimisation, edge cache, preview deploys, web vitals built in. |
| CMS | Sanity (embedded studio in `/studio`) | Studio is genuinely usable by hospo staff after one walkthrough. Asset CDN included. Better fit than Contentful or Payload for a single-venue site with one editor. |
| Transactional email | Resend + React Email | Clean DX, React-Email templates, free tier covers function enquiry volume comfortably. |
| Marketing email | Kit (V4 API for custom-form submission) | Welcome sequence and newsletter template already drafted in Kit; consultant-owned. |
| Calendar integration | Keyless service account via Workload Identity Federation (Vercel OIDC) | No downloaded keys (org policy blocks them) and no per-user token renewal. See §8.5. |
| Analytics | Plausible Community Edition | Privacy-respecting, no cookie banner needed. Vercel Analytics for Web Vitals. |
| Error monitoring | Sentry (free tier) | One broken form on a launch day would cost more than the year-one Sentry bill. |
| Styling | Tailwind v4 | Token-driven design system maps neatly to the brand guide. |
| Type checking | TypeScript strict mode | Non-negotiable. |
| Form validation | Zod | Pairs with React Hook Form on the client and validates the server action payload on the server. |
| Schema-typed Sanity client | `next-sanity` + `sanity-codegen` (or `sanity typegen`) | Generates TS types from GROQ queries so the editor doesn't drift from the studio. |

What is NOT in the stack and why: no Cloudinary (Sanity asset CDN handles images), no Mailchimp, no GA4 (organic-only phase, no attribution needed), no Stripe (no payments on the website in this sprint), no headless ecommerce, no separate CRM.

---

## 2. Setup commands

```bash
# 0. Clone the empty GitHub repo and cd in
git clone git@github.com:<owner>/Beercade_website.git
cd Beercade_website

# 1. Create the Next.js project in-place
pnpm create next-app@latest . \
  --typescript --eslint --tailwind --app --import-alias "@/*"

# 2. Sanity (embedded studio under /studio)
pnpm dlx sanity@latest init \
  --bare \
  --create-project "Beercade" \
  --dataset production \
  --output-path .

# Move studio into ./studio/ if init places it at root
# Confirm /studio route is reachable via next-sanity routing

# 3. Install runtime dependencies
pnpm add @sanity/client @sanity/image-url next-sanity \
  zod react-hook-form @hookform/resolvers \
  resend @react-email/components \
  googleapis \
  @sentry/nextjs \
  @upstash/ratelimit @upstash/redis \
  next-sitemap \
  lucide-react clsx tailwind-merge

# 4. Dev dependencies
pnpm add -D @types/node @types/react @types/react-dom \
  vitest @testing-library/react @testing-library/jest-dom \
  playwright @playwright/test \
  prettier prettier-plugin-tailwindcss \
  eslint-config-prettier

# 5. Sanity typegen (regenerates types from schemas + queries)
pnpm add -D sanity @sanity/cli

# 6. Initial typegen run after schemas exist:
pnpm exec sanity typegen generate
```

If `pnpm` is not available locally, substitute `npm` with `--legacy-peer-deps` as needed; the lockfile is generated either way.

---

## 3. Environment variables

`.env.local` (development) and Vercel project settings (production):

```ini
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-05-01
SANITY_API_READ_TOKEN=          # viewer token; safe in server contexts only
SANITY_REVALIDATE_SECRET=       # POST /api/revalidate webhook secret
SANITY_FUNCTION_WEBHOOK_SECRET= # POST /api/sanity/function-confirmed webhook secret (enquiry status -> Bookings calendar sync; see §8.6)

# Site
NEXT_PUBLIC_SITE_URL=https://beercade.com.au

# Resend
RESEND_API_KEY=
RESEND_FROM_FUNCTIONS=functions@beercade.com.au   # customer-facing sender
RESEND_FROM_HELLO=hello@beercade.com.au           # internal-notification sender
RESEND_REPLY_TO=functions@beercade.com.au         # replies thread back to the group inbox
TEAM_INBOX=functions@beercade.com.au              # Google Group: all team members

# Google Calendar — keyless Workload Identity Federation (Vercel OIDC); see §8.5
# org policy iam.disableServiceAccountKeyCreation blocks downloaded SA keys
GCP_PROJECT_ID=
GCP_PROJECT_NUMBER=
GCP_SERVICE_ACCOUNT_EMAIL=               # keyless SA, shared into the calendar
GCP_WORKLOAD_IDENTITY_POOL_ID=
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID=
GOOGLE_BOOKINGS_CALENDAR_ID=            # the dedicated "Beercade Bookings" calendar ID

# Cloudflare Turnstile (form bot mitigation)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Upstash Redis (form rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Kit (V4 API)
KIT_API_KEY=
KIT_FORM_ID_FOOTER=
KIT_FORM_ID_POPUP=
KIT_TAG_REGULAR=
KIT_TAG_FUNCTION_ENQUIRER=
KIT_TAG_DATE_NIGHT=
KIT_TAG_PINBALL=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Plausible (Community Edition)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=beercade.com.au
NEXT_PUBLIC_PLAUSIBLE_HOST=https://plausible.io   # or self-hosted endpoint
```

Vercel exposes `NEXT_PUBLIC_*` vars to the browser. Everything without that prefix is server-only — keep secrets out of client components.

---

## 4. Project structure

```
.
├── app/
│   ├── (site)/
│   │   ├── layout.tsx                # global shell, fonts, analytics, JSON-LD
│   │   ├── page.tsx                  # /
│   │   ├── machines/
│   │   │   ├── page.tsx              # /machines (grid)
│   │   │   └── [slug]/page.tsx       # /machines/[slug]
│   │   ├── whats-on/
│   │   │   ├── page.tsx              # /whats-on
│   │   │   └── [slug]/page.tsx       # /whats-on/[slug]
│   │   ├── functions/page.tsx        # /functions (pitch + form)
│   │   ├── find-us/page.tsx          # /find-us
│   │   ├── thanks/page.tsx           # /thanks (form success)
│   │   ├── privacy/page.tsx
│   │   └── not-found.tsx             # 404
│   ├── studio/[[...tool]]/page.tsx   # embedded Sanity studio
│   ├── api/
│   │   ├── revalidate/route.ts       # Sanity webhook → revalidatePath
│   │   └── kit-signup/route.ts       # server route used by client form
│   ├── actions/
│   │   ├── submit-function-enquiry.ts
│   │   └── submit-newsletter-signup.ts
│   ├── opengraph-image.tsx           # default OG
│   ├── icon.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── SkipLink.tsx
│   ├── hero/HeroLoop.tsx
│   ├── machine/MachineCard.tsx
│   ├── machine/MachineDetail.tsx
│   ├── event/EventCard.tsx
│   ├── event/EventDetail.tsx
│   ├── function/FunctionEnquiryForm.tsx
│   ├── function/FunctionPackageCard.tsx
│   ├── newsletter/NewsletterSignup.tsx
│   ├── ui/CTAButton.tsx
│   ├── ui/Container.tsx
│   ├── ui/SectionHeading.tsx
│   ├── ui/StatusPill.tsx
│   └── seo/LocalBusinessJsonLd.tsx
├── lib/
│   ├── sanity/client.ts
│   ├── sanity/image.ts
│   ├── sanity/queries.ts
│   ├── google/calendar.ts
│   ├── kit/client.ts
│   ├── resend/client.ts
│   ├── email-templates/
│   │   ├── FunctionEnquiryCustomer.tsx
│   │   └── FunctionEnquiryOwner.tsx
│   └── utils/cn.ts
├── studio/                            # Sanity studio (deployed via Next route)
│   ├── schemas/
│   │   ├── machine.ts
│   │   ├── event.ts
│   │   ├── functionPackage.ts
│   │   ├── openingHours.ts
│   │   ├── whatsOn.ts
│   │   ├── homepage.ts
│   │   ├── functionEnquiry.ts
│   │   └── testimonial.ts
│   └── sanity.config.ts
├── public/
│   ├── fonts/                         # only if any local fonts beyond next/font
│   └── icons/
├── styles/globals.css
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── package.json
```

---

## 5. Brand tokens, typography, and Tailwind config

The brand colours, typography, and combinations are locked in the Brand Guide. Mirror them precisely.

### 5.1 CSS variables — `styles/globals.css`

```css
@import "tailwindcss";

:root {
  /* Brand colours */
  --color-tilt-purple: #7A3CE2;
  --color-high-score-orange: #FF5E1F;
  --color-crema: #F7EFE3;
  --color-after-dark: #14101A;
  --color-last-train-purple: #2A1745;

  /* Functional tokens */
  --color-bg: var(--color-last-train-purple);
  --color-fg: var(--color-crema);
  --color-accent: var(--color-tilt-purple);
  --color-action: var(--color-high-score-orange);
  --color-text-muted: rgb(247 239 227 / 0.72);

  /* Type */
  --font-display: var(--font-space-grotesk);
  --font-body: var(--font-inter);
  --font-accent: var(--font-press-start);

  /* Spacing rhythm */
  --grid-gutter: 80px;
  --grid-gutter-mobile: 16px;

  /* Motion */
  --motion-fast: 120ms;
  --motion-base: 220ms;
  --motion-slow: 480ms;
}

html, body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-body), system-ui, sans-serif;
}

::selection {
  background: var(--color-tilt-purple);
  color: var(--color-crema);
}
```

### 5.2 Tailwind config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "tilt-purple": "var(--color-tilt-purple)",
        "high-score-orange": "var(--color-high-score-orange)",
        crema: "var(--color-crema)",
        "after-dark": "var(--color-after-dark)",
        "last-train-purple": "var(--color-last-train-purple)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "monospace"],
      },
      maxWidth: {
        prose: "65ch",
        layout: "1280px",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 5.3 Fonts — `app/(site)/layout.tsx`

Use `next/font/google` for Space Grotesk and Inter. Press Start 2P loaded only on routes that need it (event pages with HI SCORE callouts).

```tsx
import { Space_Grotesk, Inter, Press_Start_2P } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});
```

### 5.4 Combinations enforcement

The Brand Guide defines three working combinations. Encode them as utility classes for editors to use only — not invented per page.

| Combination | Background | Body text | CTA |
|---|---|---|---|
| A (default) | Tilt Purple | Crema | High Score Orange |
| B (high-energy) | High Score Orange | After Dark | Tilt Purple accent |
| C (long-form) | Last Train Purple | Crema | High Score Orange |

Default the global shell to **C** because most surfaces are long-form. Use **A** for hero sections and feature blocks. Reserve **B** for event posters and the tournament countdown — never for body copy backgrounds.

Accessibility footnote: Crema-on-Tilt-Purple passes AA at large sizes only. For small body text on Tilt Purple, swap to After Dark. This is enforced in the contrast audit on Day 15.

---

## 6. Sanity studio

Studio embeds in the same repo, routed at `/studio`. Editors authenticate with the Sanity-issued credentials; staff get Editor; owner gets Administrator.

### 6.1 Studio config — `studio/sanity.config.ts`

```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import schemaTypes from "./schemas";

export default defineConfig({
  name: "beercade",
  title: "Beercade",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
```

### 6.2 Schemas (TypeScript)

Each schema is one file under `studio/schemas/`. Exports are aggregated in `studio/schemas/index.ts`.

#### `machine.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "machine",
  title: "Machine",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Machine name", type: "string", validation: r => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name", maxLength: 64 }, validation: r => r.required() }),
    defineField({ name: "type", title: "Type", type: "string", options: { list: [
      { title: "Pinball", value: "pinball" },
      { title: "Arcade", value: "arcade" },
      { title: "Racing", value: "racing" },
      { title: "Other", value: "other" },
    ]}, validation: r => r.required() }),
    defineField({ name: "manufacturer", title: "Manufacturer", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "status", title: "Status", type: "string", initialValue: "working", options: { list: [
      { title: "Working", value: "working" },
      { title: "Under maintenance", value: "maintenance" },
      { title: "Down", value: "down" },
    ]}}),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt text (required)", type: "string", validation: r => r.required().min(4).max(120), description: "Describe what's in the image for screen readers — e.g. 'Godzilla LE playfield with multiball lit'" },
      ],
      validation: r => r.required(),
    }),
    defineField({ name: "description", title: "Short description (web)", type: "text", rows: 4, validation: r => r.max(280) }),
    defineField({ name: "conditionNote", title: "Condition note (internal)", type: "string" }),
    defineField({ name: "highScore", title: "Current high score (optional)", type: "object", fields: [
      { name: "value", title: "Score", type: "string" },
      { name: "holder", title: "Held by", type: "string" },
      { name: "setOn", title: "Set on", type: "date" },
    ]}),
    defineField({ name: "featured", title: "Feature on homepage", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  preview: {
    select: { title: "name", subtitle: "type", media: "photo", status: "status" },
    prepare: ({ title, subtitle, media, status }) => ({
      title,
      subtitle: `${subtitle} · ${status}`,
      media,
    }),
  },
});
```

#### `event.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: r => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: r => r.required() }),
    defineField({ name: "kicker", title: "Kicker (one short line above title)", type: "string" }),
    defineField({ name: "kind", title: "Kind", type: "string", options: { list: [
      { title: "Tournament", value: "tournament" },
      { title: "League", value: "league" },
      { title: "Date night package", value: "date-night" },
      { title: "Function takeover", value: "function" },
      { title: "Other", value: "other" },
    ]}, validation: r => r.required() }),
    defineField({ name: "startDate", title: "Start date", type: "datetime", validation: r => r.required() }),
    defineField({ name: "endDate", title: "End date", type: "datetime" }),
    defineField({ name: "recurring", title: "Recurring schedule", type: "string", description: "e.g. Tuesdays and Thursdays for 4 weeks" }),
    defineField({ name: "entry", title: "Entry detail", type: "string", description: "e.g. $40 covers all sessions" }),
    defineField({ name: "prize", title: "Prize detail", type: "string" }),
    defineField({ name: "body", title: "Body copy", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string", initialValue: "Reserve a spot" }),
    defineField({ name: "ctaTarget", title: "CTA target", type: "string", options: { list: [
      { title: "Function enquiry form", value: "function-form" },
      { title: "External URL", value: "external" },
      { title: "Email functions@", value: "email-functions" },
    ]}}),
    defineField({ name: "ctaUrl", title: "External URL (if applicable)", type: "url" }),
    defineField({
      name: "hero",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt text (required)", type: "string", validation: r => r.required().min(4).max(120) },
      ],
    }),
    defineField({ name: "machines", title: "Featured machines", type: "array", of: [{ type: "reference", to: [{ type: "machine" }] }] }),
    defineField({ name: "status", title: "Status", type: "string", initialValue: "upcoming", options: { list: [
      { title: "Upcoming", value: "upcoming" },
      { title: "On now", value: "live" },
      { title: "Wrapped", value: "wrapped" },
      { title: "Cancelled", value: "cancelled" },
    ]}}),
  ],
});
```

#### `functionPackage.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "functionPackage",
  title: "Function package",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Package name", type: "string", validation: r => r.required() }),
    defineField({ name: "minHeads", title: "Minimum heads", type: "number" }),
    defineField({ name: "maxHeads", title: "Maximum heads", type: "number" }),
    defineField({ name: "pricePerHead", title: "Price per head (AUD, indicative)", type: "number" }),
    defineField({ name: "duration", title: "Duration (hours)", type: "number" }),
    defineField({ name: "inclusions", title: "Inclusions", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "machinesIncluded", title: "Machines included", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
});
```

#### `openingHours.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "openingHours",
  title: "Opening hours",
  type: "document",
  fields: [
    defineField({ name: "weeklyHours", title: "Weekly hours", type: "array", of: [{
      type: "object",
      fields: [
        { name: "day", title: "Day", type: "string", options: { list: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }},
        { name: "open", title: "Open", type: "string", description: "24h e.g. 17:00; leave blank if closed" },
        { name: "close", title: "Close", type: "string", description: "24h e.g. 00:00 (next day)" },
        { name: "closed", title: "Closed all day", type: "boolean", initialValue: false },
      ],
    }]}),
    defineField({ name: "exceptions", title: "Exceptions (public holidays etc.)", type: "array", of: [{
      type: "object",
      fields: [
        { name: "date", title: "Date", type: "date" },
        { name: "open", title: "Open", type: "string" },
        { name: "close", title: "Close", type: "string" },
        { name: "closed", title: "Closed", type: "boolean", initialValue: false },
        { name: "reason", title: "Reason (internal note)", type: "string" },
      ],
    }]}),
  ],
});
```

#### `whatsOn.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "whatsOn",
  title: "What's on (standing nights)",
  type: "document",
  fields: [
    defineField({ name: "dayOfWeek", title: "Day", type: "string", options: { list: ["Wed","Thu","Fri","Sat","Sun"] }, validation: r => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: r => r.required() }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt text (required)", type: "string", validation: r => r.required().min(4).max(120) },
      ],
    }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
});
```

#### `homepage.ts` (singleton)

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({ name: "heroVideoUrl", title: "Hero video (muted loop, mp4/webm)", type: "url" }),
    defineField({
      name: "heroPoster",
      title: "Hero poster image",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt text (required)", type: "string", validation: r => r.required().min(4).max(120) },
      ],
    }),
    defineField({ name: "heroHeadline", title: "Hero headline", type: "string" }),
    defineField({ name: "heroSubline", title: "Hero subline", type: "string" }),
    defineField({ name: "primaryCtaLabel", title: "Primary CTA label", type: "string", initialValue: "BOOK A FUNCTION" }),
    defineField({ name: "primaryCtaTarget", title: "Primary CTA target", type: "string", initialValue: "/functions" }),
    defineField({ name: "featuredMachines", title: "Featured machines", type: "array", of: [{ type: "reference", to: [{ type: "machine" }] }] }),
    defineField({ name: "featuredEvents", title: "Featured events", type: "array", of: [{ type: "reference", to: [{ type: "event" }] }] }),
  ],
});
```

#### `functionEnquiry.ts`

The schema for the archive of enquiries. Submissions write to Sanity via a server action using a write token. The studio displays them read-only for the owner.

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "functionEnquiry",
  title: "Function enquiry",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "groupSize", title: "Group size", type: "number" }),
    defineField({ name: "preferredDate", title: "Preferred date", type: "date" }),
    defineField({ name: "preferredTime", title: "Preferred time window", type: "string" }),
    defineField({ name: "occasion", title: "Occasion", type: "string" }),
    defineField({ name: "machinePreference", title: "Machine preference", type: "string" }),
    defineField({ name: "drinksStyle", title: "Drinks style", type: "string", options: { list: ["bar-tab","cash-bar","mixed"] }}),
    defineField({ name: "food", title: "Food required", type: "boolean" }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 4 }),
    defineField({ name: "status", title: "Status", type: "string", initialValue: "new", options: { list: [
      { title: "New", value: "new" },
      { title: "Replied", value: "replied" },
      { title: "Quoted", value: "quoted" },
      { title: "Confirmed", value: "confirmed" },
      { title: "Lost", value: "lost" },
    ]}}),
    defineField({ name: "calendarEventId", title: "Calendar event ID", type: "string" }),
  ],
  preview: {
    select: { title: "name", subtitle: "submittedAt", status: "status" },
    prepare: ({ title, subtitle, status }) => ({
      title,
      subtitle: `${new Date(subtitle).toLocaleDateString("en-AU")} · ${status}`,
    }),
  },
});
```

#### `testimonial.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 3, validation: r => r.required() }),
    defineField({ name: "attribution", title: "Attribution", type: "string" }),
    defineField({ name: "context", title: "Context", type: "string", description: "e.g. 30th birthday function, June 2026" }),
    defineField({ name: "useOn", title: "Use on", type: "array", of: [{ type: "string" }], options: { list: [
      { title: "Homepage", value: "home" },
      { title: "Functions page", value: "functions" },
    ]}}),
  ],
});
```

#### Aggregator

```ts
// studio/schemas/index.ts
import machine from "./machine";
import event from "./event";
import functionPackage from "./functionPackage";
import openingHours from "./openingHours";
import whatsOn from "./whatsOn";
import homepage from "./homepage";
import functionEnquiry from "./functionEnquiry";
import testimonial from "./testimonial";

export default [machine, event, functionPackage, openingHours, whatsOn, homepage, functionEnquiry, testimonial];
```

### 6.3 GROQ queries — `lib/sanity/queries.ts`

```ts
export const homepageQuery = /* groq */ `*[_type == "homepage"][0]{
  heroHeadline, heroSubline, heroVideoUrl, heroPoster, primaryCtaLabel, primaryCtaTarget,
  "featuredMachines": featuredMachines[]->{ _id, name, slug, type, photo, status },
  "featuredEvents": featuredEvents[]->{ _id, title, slug, kicker, kind, startDate, status, hero }
}`;

export const allMachinesQuery = /* groq */ `*[_type == "machine"] | order(order asc, name asc){
  _id, name, slug, type, manufacturer, year, status, photo, description
}`;

export const machineBySlugQuery = /* groq */ `*[_type == "machine" && slug.current == $slug][0]{
  ..., highScore
}`;

export const upcomingEventsQuery = /* groq */ `*[_type == "event" && status in ["upcoming","live"]] | order(startDate asc){
  _id, title, slug, kicker, kind, startDate, endDate, recurring, entry, prize, status, hero
}`;

export const eventBySlugQuery = /* groq */ `*[_type == "event" && slug.current == $slug][0]{
  ..., "machines": machines[]->{ _id, name, slug, photo }
}`;

export const openingHoursQuery = /* groq */ `*[_type == "openingHours"][0]`;

export const whatsOnQuery = /* groq */ `*[_type == "whatsOn"] | order(order asc, dayOfWeek asc)`;

export const functionPackagesQuery = /* groq */ `*[_type == "functionPackage"] | order(order asc)`;

export const homepageTestimonialsQuery = /* groq */ `*[_type == "testimonial" && "home" in useOn][0..2]`;

export const functionTestimonialsQuery = /* groq */ `*[_type == "testimonial" && "functions" in useOn][0..5]`;
```

### 6.4 Studio roles

- Owner: Administrator. Can create/edit/delete anything, manage members.
- Manager-shift staff (2): Editor. Can edit machines, events, what's on, opening hours, function packages. Read-only on function enquiries.
- Consultant: Administrator.

---

## 7. Pages — route-by-route spec

Each page lists: route, copy direction (in voice), Sanity data, key components, success metric.

### 7.1 `/` — Home

**Copy direction.** Hero is a single Space Grotesk slogan over a muted video loop of the room at 9pm Thursday. No CTA other than `BOOK A FUNCTION`. Below the fold: machines teaser (six featured, each linking to its detail), what's on (three standing nights), function strip with one testimonial, find-us strip.

**Sanity data.** `homepageQuery`, `homepageTestimonialsQuery`, `openingHoursQuery`.

**Components.** `HeroLoop`, `MachineCard` × 6, `EventCard` × 3, `FunctionPackageCard` × 1, `CTAButton`.

**Success metric.** Function CTA above-the-fold click-through ≥ 6% in first 30 days.

### 7.2 `/machines` — Machines grid

**Copy direction.** One-paragraph intro in voice. No filter UI in v1. Grid of every machine. Each card shows photo, name, type, status pill.

**Sanity data.** `allMachinesQuery`.

**Components.** `MachineCard` × n in a 12-col grid; collapses to 2 columns on mobile, 4 on desktop.

### 7.3 `/machines/[slug]` — Machine detail

**Copy direction.** Machine name (Space Grotesk Bold), kicker (Press Start 2P if high score is set), description, photo as hero. Internal-link callouts: "See what's on next" linking to `/whats-on`, "Book the room around this machine" linking to `/functions`.

**Sanity data.** `machineBySlugQuery` with `params: { slug }`.

**Static params.** Pre-generate all machine slugs at build; ISR with 60s revalidate.

### 7.4 `/whats-on` — What's on

**Copy direction.** Upcoming events at top (date, kicker, title, entry detail, CTA). Standing nights below as a weekly strip ("Wed · Thu · Fri · Sat · Sun").

**Sanity data.** `upcomingEventsQuery`, `whatsOnQuery`, `openingHoursQuery`.

### 7.5 `/whats-on/[slug]` — Event detail

**Copy direction.** Hero image, kicker, title, body copy from Sanity. Sidebar (desktop) or stacked (mobile): start date, recurring schedule, entry detail, prize detail, CTA.

**CTA logic.** If `ctaTarget == "function-form"`, link to `/functions#enquire`. If `external`, link out. If `email-functions`, `mailto:functions@beercade.com.au?subject={Title}`.

### 7.6 `/functions` — Functions

**Copy direction.** Pitch (in voice, lifts from existing strategy docs). Three function packages from Sanity. Photo proof carousel (function testimonials with attribution). Function enquiry form anchored at `#enquire`.

**Sanity data.** `functionPackagesQuery`, `functionTestimonialsQuery`.

**Components.** `FunctionPackageCard` × 3, `FunctionEnquiryForm`.

**Success metric.** Form completion ≥ 8% of unique pageviews in first 30 days.

### 7.7 `/find-us` — Find us

**Copy direction.** Address, "two minutes from Redfern Station", embedded Google Maps iframe (consent-aware), opening hours from Sanity, transport detail, accessibility note, parking realism.

**Sanity data.** `openingHoursQuery`.

### 7.8 `/thanks` — Form success

**Copy direction.** "Enquiry received. We'll be in touch within 24 hours." In voice. Link back to `/machines` or `/whats-on`.

### 7.9 `/not-found`

In voice. "This page is out of order. The bar is not. Try Machines or What's On."

### 7.10 `/studio` — Sanity studio

Embedded studio. Authentication via Sanity; no extra layer needed.

---

## 8. Function enquiry form — end-to-end flow

The single highest-value form on the site. Build it carefully.

### 8.0 Architecture summary

One submission produces four state changes, in this order:

1. **Tentative event on the Beercade Bookings calendar** (via service account). Visible to all three team members in their calendar apps within seconds.
2. **Function enquiry document in Sanity** (status: `new`). The owner-facing pipeline view.
3. **Team notification email to the `functions@beercade.com.au` Google Group inbox** (sent FROM `hello@`). Google Workspace fans out to all three members. Replies are made from the group inbox so the conversation stays in one place.
4. **Customer autoresponder** (sent FROM `functions@`, reply-to `functions@`). Customer responses thread back into the group inbox automatically.

Before any of that, the request must pass two gates: a Cloudflare Turnstile challenge (anti-bot) and an Upstash Redis rate limit (anti-abuse).

Day-2 infra setup the consultant must complete in Google Workspace before this code is exercised against production:

- Create the `functions@beercade.com.au` Google Group. Add owner + two manager-shift staff as members. Configure as **Collaborative Inbox**. Group access set to *Anyone on the web can post* so customer replies reach the group.
- Create a calendar called **Beercade Bookings** owned by the workspace. Share **Make changes to events** with all three team members and with the keyless service account email (`GCP_SERVICE_ACCOUNT_EMAIL`). Note the calendar ID (looks like `xxx@group.calendar.google.com`) for the `GOOGLE_BOOKINGS_CALENDAR_ID` env var. _(Created 31 May 2026; ID `c_eca3a9296250d410b444fd51b6f76547422c24b2a4b792498ef37db5f343d888@group.calendar.google.com`.)_ Auth is keyless Workload Identity Federation — see §8.5.
- Configure each team member's Gmail with the *Send mail as* option for `functions@beercade.com.au`, so they can reply as the group rather than as themselves.

### 8.1 Client component

`components/function/FunctionEnquiryForm.tsx` uses React Hook Form with a Zod resolver. Submits via a server action. Renders the Turnstile widget below the consent checkbox; the widget's token is passed through with the form payload.

Fields:
- Name (required, 2–80 chars)
- Email (required, valid email)
- Phone (optional, AU-friendly regex)
- Group size (required, 6–100)
- Preferred date (required, future date)
- Preferred time window (required, select: 5–9pm / 6–10pm / 7–11pm / other)
- Occasion (required, select: birthday / EOFY / corporate / hens-bucks / other)
- Machine preference (optional, free text or select from machines)
- Drinks style (required, select: bar-tab / cash-bar / mixed)
- Food required (boolean)
- Notes (optional, max 600 chars)
- Honeypot field, hidden from real users
- Consent checkbox: "OK to be contacted by Beercade about this enquiry"

Inline validation, accessible error messages, focus management on error. Submit button text: `Send enquiry`. Disabled state while submitting. Success redirects to `/thanks`.

### 8.2 Zod schema

```ts
// lib/validation/function-enquiry.ts
import { z } from "zod";

export const functionEnquirySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().regex(/^[\d\s\+\(\)\-]{6,20}$/).optional().or(z.literal("")),
  groupSize: z.coerce.number().int().min(6).max(100),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.enum(["17-21","18-22","19-23","other"]),
  occasion: z.enum(["birthday","eofy","corporate","hens-bucks","other"]),
  machinePreference: z.string().max(120).optional().or(z.literal("")),
  drinksStyle: z.enum(["bar-tab","cash-bar","mixed"]),
  food: z.boolean(),
  notes: z.string().max(600).optional().or(z.literal("")),
  consent: z.literal(true),
  honeypot: z.string().max(0),  // must be empty
  turnstileToken: z.string().min(10),
});

export type FunctionEnquiryInput = z.infer<typeof functionEnquirySchema>;
```

### 8.3 Server action

`app/actions/submit-function-enquiry.ts`:

```ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { functionEnquirySchema } from "@/lib/validation/function-enquiry";
import { writeClient } from "@/lib/sanity/client";
import { sendTeamNotification, sendCustomerAutoresponder } from "@/lib/resend/client";
import { createTentativeCalendarEvent } from "@/lib/google/calendar";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit } from "@/lib/security/rate-limit";

export async function submitFunctionEnquiry(formData: FormData) {
  // 0) Rate limit by IP — 5 submissions per IP per hour
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const limit = await rateLimit(ip);
  if (!limit.success) {
    return { ok: false, errors: { _form: ["Too many submissions. Try again in an hour, or email functions@beercade.com.au."] } };
  }

  // 1) Validate
  const raw = Object.fromEntries(formData.entries());
  const parsed = functionEnquirySchema.safeParse({
    ...raw,
    food: raw.food === "on",
    consent: raw.consent === "on",
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  // 2) Turnstile verification
  const turnstileOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstileOk) {
    return { ok: false, errors: { _form: ["Verification failed. Refresh and try again."] } };
  }

  // 3) Calendar tentative event on Beercade Bookings
  const { id: calendarEventId, htmlLink: calendarEventUrl } = await createTentativeCalendarEvent(data);

  // 4) Sanity archive
  await writeClient.create({
    _type: "functionEnquiry",
    submittedAt: new Date().toISOString(),
    ...data,
    turnstileToken: undefined, // do not persist the token
    calendarEventId,
    status: "new",
  });

  // 5) Resend — team notification to the group inbox
  await sendTeamNotification(data, calendarEventId, calendarEventUrl);

  // 6) Resend — customer autoresponder
  await sendCustomerAutoresponder(data);

  revalidatePath("/studio");
  redirect("/thanks");
}
```

Supporting helpers:

```ts
// lib/security/turnstile.ts
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
      remoteip: ip,
    }),
  });
  const json = (await res.json()) as { success: boolean };
  return json.success === true;
}

// lib/security/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "rl:function-enquiry",
});

export async function rateLimit(identifier: string) {
  return limiter.limit(identifier);
}
```

### 8.4 Resend templates and client

Two React-Email components plus a thin Resend wrapper. The customer autoresponder sends FROM `functions@`; the team notification sends FROM `hello@` to avoid a same-address loop in the group inbox.

`lib/email-templates/FunctionEnquiryCustomer.tsx`:

```tsx
import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function FunctionEnquiryCustomer({ name, groupSize, preferredDate }: { name: string; groupSize: number; preferredDate: string }) {
  return (
    <Html>
      <Head />
      <Preview>We got your enquiry. We'll be back to you inside 24 hours.</Preview>
      <Body style={{ background: "#2A1745", color: "#F7EFE3", fontFamily: "Inter, sans-serif", padding: 24 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>
          <Heading style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F7EFE3" }}>Thanks {name} — got it.</Heading>
          <Text>We've got your enquiry for {groupSize} people on {preferredDate}. One of us will be back to you inside 24 hours with the room hold, the package detail, and a couple of options.</Text>
          <Text>If you want to grab us sooner, reply to this email — it goes straight to the team.</Text>
          <Text>— Beercade, Redfern. Two minutes from the station.</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

`lib/email-templates/FunctionEnquiryTeam.tsx`:

```tsx
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import type { FunctionEnquiryInput } from "@/lib/validation/function-enquiry";

export function FunctionEnquiryTeam({ data, calendarEventId, calendarEventUrl }: { data: FunctionEnquiryInput; calendarEventId: string; calendarEventUrl?: string }) {
  return (
    <Html>
      <Head />
      <Preview>New function enquiry — {data.name}, {data.groupSize} on {data.preferredDate}</Preview>
      <Body style={{ fontFamily: "Inter, sans-serif" }}>
        <Container>
          <Heading>New function enquiry</Heading>
          <Text><strong>{data.name}</strong> ({data.email}{data.phone ? `, ${data.phone}` : ""})</Text>
          <Text>{data.groupSize} people · {data.preferredDate} · {data.preferredTime}</Text>
          <Text>Occasion: {data.occasion} · Drinks: {data.drinksStyle} · Food: {data.food ? "yes" : "no"}</Text>
          {data.machinePreference && <Text>Machines: {data.machinePreference}</Text>}
          {data.notes && <Text>Notes: {data.notes}</Text>}
          <Hr />
          <Text>Tentative event on Bookings calendar: {calendarEventId}</Text>
          {calendarEventUrl && <Text><a href={calendarEventUrl}>Open in Google Calendar</a></Text>}
          <Text style={{ color: "#666" }}>Reply directly from the group inbox so the conversation stays threaded for the team. Update enquiry status in the Sanity studio as you progress.</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

`lib/resend/client.ts`:

```ts
import { Resend } from "resend";
import { FunctionEnquiryCustomer } from "@/lib/email-templates/FunctionEnquiryCustomer";
import { FunctionEnquiryTeam } from "@/lib/email-templates/FunctionEnquiryTeam";
import type { FunctionEnquiryInput } from "@/lib/validation/function-enquiry";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendTeamNotification(data: FunctionEnquiryInput, calendarEventId: string, calendarEventUrl?: string) {
  return resend.emails.send({
    from: `Beercade Bookings <${process.env.RESEND_FROM_HELLO!}>`,
    to: [process.env.TEAM_INBOX!],
    reply_to: data.email,
    subject: `New enquiry — ${data.name} (${data.groupSize} on ${data.preferredDate})`,
    react: FunctionEnquiryTeam({ data, calendarEventId, calendarEventUrl }),
  });
}

export async function sendCustomerAutoresponder(data: FunctionEnquiryInput) {
  return resend.emails.send({
    from: `Beercade <${process.env.RESEND_FROM_FUNCTIONS!}>`,
    to: data.email,
    reply_to: process.env.RESEND_REPLY_TO!,
    subject: `Got your enquiry — Beercade`,
    react: FunctionEnquiryCustomer({ name: data.name, groupSize: data.groupSize, preferredDate: data.preferredDate }),
  });
}
```

Two things to call out in this client. First, the team notification's `reply_to` is set to the customer's email, so anyone in the group inbox who clicks Reply goes straight to the customer — no manual address copy. Second, the customer autoresponder's `reply_to` is the `functions@` group, so the customer's reply lands in the team inbox rather than vanishing into Resend.

### 8.5 Google Calendar tentative event

`lib/google/calendar.ts`:

> **Auth note (v1.2):** the beercade.com.au org enforces `iam.disableServiceAccountKeyCreation`, so downloaded service-account keys are not available. We authenticate **keyless** via Workload Identity Federation: Vercel issues a per-invocation OIDC token, Google STS exchanges it, and we impersonate a keyless service account that is shared into the calendar. Setup + env vars: https://vercel.com/docs/oidc/gcp. Requires deps `@vercel/oidc` and `google-auth-library`.

```ts
import { google } from "googleapis";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";
import type { FunctionEnquiryInput } from "@/lib/validation/function-enquiry";

function getCalendarClient() {
  const authClient = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience: `//iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    subject_token_supplier: { getSubjectToken: getVercelOidcToken },
  });
  if (!authClient) throw new Error("Failed to init Google ExternalAccountClient — check GCP_* env vars.");
  authClient.scopes = ["https://www.googleapis.com/auth/calendar"];
  return google.calendar({ version: "v3", auth: authClient });
}

export async function createTentativeCalendarEvent(data: FunctionEnquiryInput): Promise<string> {
  const calendar = getCalendarClient();
  const [startHour, endHour] = ({
    "17-21": [17, 21], "18-22": [18, 22], "19-23": [19, 23], "other": [18, 22],
  } as const)[data.preferredTime];

  const dateBase = data.preferredDate; // YYYY-MM-DD

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_BOOKINGS_CALENDAR_ID!,
    requestBody: {
      summary: `[TENTATIVE] ${data.name} · ${data.groupSize} pax · ${data.occasion}`,
      description: [
        `Function enquiry from ${data.name} (${data.email}${data.phone ? ", " + data.phone : ""})`,
        `Group size: ${data.groupSize}`,
        `Drinks: ${data.drinksStyle}`,
        `Food: ${data.food ? "yes" : "no"}`,
        data.machinePreference ? `Machines: ${data.machinePreference}` : null,
        data.notes ? `Notes: ${data.notes}` : null,
        "",
        "Workflow: flip status to 'confirmed' when booked. Update the matching enquiry in Sanity studio.",
      ].filter(Boolean).join("\n"),
      start: { dateTime: `${dateBase}T${String(startHour).padStart(2,"0")}:00:00+10:00`, timeZone: "Australia/Sydney" },
      end:   { dateTime: `${dateBase}T${String(endHour).padStart(2,"0")}:00:00+10:00`,   timeZone: "Australia/Sydney" },
      status: "tentative",
      transparency: "opaque",
    },
  });

  return { id: event.data.id!, htmlLink: event.data.htmlLink ?? undefined };
}
```

The keyless service account (`GCP_SERVICE_ACCOUNT_EMAIL`) must be shared into the **Beercade Bookings** calendar with **Make changes to events**, or `events.insert` will 403. No IAM project roles are needed — calendar access comes from the share, not from IAM. The federated principal (the Vercel OIDC identity) must be granted **Service Account Token Creator** on that SA so it can impersonate it. The calendar ID is the long string ending in `@group.calendar.google.com`, not the email address.

Update the server action's call site to consume the returned object: `const { id: calendarEventId, htmlLink: calendarEventUrl } = await createTentativeCalendarEvent(data);` and pass `calendarEventUrl` to `sendTeamNotification`.

### 8.6 Team workflow (the human side)

The three surfaces are deliberately single-purpose:

| Surface | What it is for | Who touches it |
|---|---|---|
| Beercade Bookings (Google Calendar) | Source of truth for venue availability. Tentative on submission; confirmed when the booking lands. | All three team members. |
| `functions@beercade.com.au` (Google Group, Collaborative Inbox) | Where every enquiry conversation lives. Assignable, threaded, replies sent from the group address. | All three team members. |
| Sanity studio — Function enquiry | Pipeline view (New → Replied → Quoted → Confirmed / Lost). Owner uses it for a weekly read of where deals sit. | Owner primarily, team can update status. |

The day-to-day loop:

1. Customer submits the form. Tentative event lands on Bookings; team email lands in the group inbox; Sanity enquiry created with status `new`.
2. First available team member opens the conversation in the group inbox, clicks Reply, and replies as `functions@`. They update the Sanity enquiry status to `replied` and assign themselves on the group inbox.
3. When the conversation produces a quote, status moves to `quoted`. The Bookings calendar event is left tentative.
4. On confirmation, the team member moves the Sanity status to `confirmed`. A Sanity webhook (`/api/sanity/function-confirmed`) promotes the matching Bookings event automatically: it retags the summary `[TENTATIVE]` → `[CONFIRMED]` and sets the event status to `confirmed`. The package name is still added by hand on the calendar event if wanted (it isn't held in Sanity).
5. If the booking is lost or abandoned, the team member moves the Sanity status to `lost`; the same webhook deletes the Bookings event. The group inbox thread is resolved by hand.

**v1.3 — calendar sync automated.** Steps 4 and 5 were manual two-step actions in v1.2 (edit the calendar event *and* the Sanity status). The webhook now drives the calendar from the Sanity status, so staff only touch the studio. Auth is a URL `?secret=` matching `SANITY_FUNCTION_WEBHOOK_SECRET`, mirroring the `/api/revalidate` gate; the handler is idempotent under Sanity retries (re-confirming is a no-op, deleting an already-gone event returns 200). Calendar writes use the existing keyless service account (§8.5). The training doc at `08_Sanity_Training_Doc.md` documents the studio status field; the calendar toggle no longer needs a manual step.

---

## 9. Kit signup integration

Two embed points: footer (always visible) and exit-intent popup on `/` and `/machines`.

`app/actions/submit-newsletter-signup.ts`:

```ts
"use server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  source: z.enum(["footer","popup"]),
});

export async function submitNewsletterSignup(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Invalid email" };

  const formId = parsed.data.source === "footer"
    ? process.env.KIT_FORM_ID_FOOTER!
    : process.env.KIT_FORM_ID_POPUP!;

  const res = await fetch(`https://api.kit.com/v4/forms/${formId}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": process.env.KIT_API_KEY!,
    },
    body: JSON.stringify({ email_address: parsed.data.email }),
  });

  if (!res.ok) {
    return { ok: false, error: "Sign-up failed. Try again or email hello@beercade.com.au." };
  }
  return { ok: true };
}
```

The welcome sequence (already drafted in Kit) is triggered by form-subscriber automation inside Kit; the website does not orchestrate it.

---

## 10. SEO and structured data

### 10.1 Per-page metadata

Each route exports a `generateMetadata` that reads from Sanity where appropriate:

```ts
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const machine = await sanityClient.fetch(machineBySlugQuery, { slug: params.slug });
  return {
    title: `${machine.name} — Beercade Redfern`,
    description: machine.description,
    openGraph: { images: [urlFor(machine.photo).width(1200).height(630).url()] },
  };
}
```

### 10.2 LocalBusiness JSON-LD

`components/seo/LocalBusinessJsonLd.tsx` injects schema on `/` and `/find-us`:

```ts
{
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  "name": "Beercade",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "113 Regent Street",
    "addressLocality": "Redfern",
    "addressRegion": "NSW",
    "postalCode": "2016",
    "addressCountry": "AU"
  },
  "url": "https://beercade.com.au",
  "telephone": "",
  "image": "...",
  "priceRange": "$$",
  "openingHoursSpecification": [ /* from Sanity */ ],
  "geo": { "@type": "GeoCoordinates", "latitude": -33.8923, "longitude": 151.2046 }
}
```

Confirm exact coordinates against the venue address before launch.

### 10.3 Sitemap and robots

Use `next-sitemap` configured against the production URL. Include all machine slugs and event slugs. Submit to Search Console on Day 22.

### 10.4 OG images

A default OG image at `app/opengraph-image.tsx` rendering Space Grotesk on Tilt Purple with the wordmark. Per-machine and per-event pages override with the Sanity hero image.

---

## 11. Analytics, monitoring, performance

Note on the three tools below — they are complementary, not alternatives. **Vercel Analytics** ships Web Vitals (LCP, CLS, INP) sampled on the production site; turn it on in the Vercel project settings. **Plausible** does product-grade traffic and event analytics (where are users coming from, which CTAs are clicked) without cookies and without a banner. **Sentry** catches runtime errors and surfaces them with stack traces. Each handles one concern that the others do not.

### 11.1 Plausible (Cloud)

Hosted Plausible Cloud, not self-hosted Community Edition — for a single domain at this traffic level the cloud cost is trivial and self-hosting saves no real time. Lightweight script in `app/(site)/layout.tsx`:

```tsx
<script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
  src="https://plausible.io/js/script.outbound-links.js" />
```

Custom events: `function-enquiry-submitted`, `newsletter-signup`, `cta-click-functions`, `cta-click-event`.

### 11.2 Sentry (free tier)

`pnpm dlx @sentry/wizard@latest -i nextjs` generates the config. Confirm `sentry.client.config.ts` and `sentry.server.config.ts` are present. Set sampling at 10% in production. Free tier covers the venue's expected error volume comfortably; revisit only if quota is breached.

### 11.3 Vercel Analytics

Enable Web Vitals in project settings. Targets: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms.

### 11.4 Performance budget

- Total JS shipped on home: ≤ 180 KB gzipped.
- Lighthouse Performance ≥ 90 on the home page mobile.
- Lighthouse Accessibility ≥ 95 site-wide.
- Sanity images served via the Sanity CDN with `auto=format` and explicit width/height props on `<Image>`.

---

## 12. Accessibility checklist

Build to WCAG 2.1 AA from day one. Audit on Day 15.

- All interactive elements reachable by keyboard. Focus ring visible — use Crema outline at 2px for visibility on dark backgrounds.
- Skip link to `#main` on every page.
- Headings hierarchical: one `<h1>` per page; descending h2 / h3 without skipping.
- Form labels associated with inputs. Error messages programmatically linked via `aria-describedby`.
- Buttons that look like buttons; links that look like links. Do not style links as plain text.
- Colour contrast: Crema-on-Last-Train-Purple passes AA at body sizes; Crema-on-Tilt-Purple only passes at large sizes — swap to After Dark on Tilt-Purple-bodied surfaces.
- Motion: video loop respects `prefers-reduced-motion` (replace with poster image when reduced motion is preferred).
- Embedded map has a text fallback (address + transport detail) visible above it.
- Alt text on all Sanity images: editors must fill `alt`; schema enforcement added in studio.

Add an `alt` field to the machine schema if not present and require it. (Not in v1 schema above — add as a follow-up edit.)

---

## 13. Deployment

### 13.1 Vercel project

- Import from Git.
- Build command: `pnpm build`.
- Output: standard Next.js build.
- Set all environment variables in Vercel project settings (Production, Preview, Development).
- Preview deployments on every PR.
- Add a Sanity webhook to `https://beercade.com.au/api/revalidate` with the `SANITY_REVALIDATE_SECRET` so content updates revalidate the public site within seconds.
- Add a second Sanity webhook to `https://beercade.com.au/api/sanity/function-confirmed?secret=<SANITY_FUNCTION_WEBHOOK_SECRET>`, filtered to `_type == "functionEnquiry"` on create/update, with the GROQ projection `{_type, status, calendarEventId}`. It promotes (confirmed) or removes (lost) the matching Bookings calendar event automatically — see §8.6.

### 13.2 Domain and DNS

- Confirm registrar in Day 1 audit.
- Add Vercel's recommended DNS records on Day 11; do not point production until Day 21.
- Reduce existing record TTLs to 300s on Day 16.
- On Day 21: switch A / AAAA / CNAME records to Vercel. WWW canonical to the apex (`beercade.com.au`).
- SSL is automatic via Vercel; verify the cert is active before the public smoke test.

### 13.3 Redirects

Map the existing `beercadeaustralia.com.au` URLs to the new site in `next.config.mjs` redirects (or via a Vercel rewrite if cross-domain). Capture every URL with traffic from the old site before cutover.

---

## 14. Testing

### 14.1 Unit / component

Vitest + React Testing Library. Coverage focus: `FunctionEnquiryForm` validation paths, `MachineCard` status pill rendering, `NewsletterSignup` error states.

### 14.2 End-to-end

Playwright. Three flows must pass on every PR:

1. Home → click `BOOK A FUNCTION` → `/functions` → fill enquiry form → submit → `/thanks`.
2. Home → click machine card → machine detail → back.
3. Footer newsletter signup with valid email → success state.

### 14.3 Visual regression

Optional in v1. Add Chromatic in sprint 2 if desired.

---

## 15. Acceptance criteria

The site is accepted when all of the following are true.

1. All eight content types render on the studio with the schemas above.
2. The six top-level routes plus the two dynamic routes plus thanks / privacy / 404 all render in production.
3. Sanity content edits in studio reflect on the public site within 60 seconds (via the revalidate webhook).
4. Function enquiry submission writes one Sanity document, one tentative event on the **Beercade Bookings** calendar, one team notification to the `functions@beercade.com.au` group inbox (received by all three members), and one customer autoresponder, in that order, for every successful submission. Submissions that fail Turnstile or rate-limit checks return a friendly error and write nothing.
5. Newsletter signup from the footer subscribes the email to the Kit footer form and triggers the welcome sequence.
6. Lighthouse Performance ≥ 90 on `/` mobile; Accessibility ≥ 95 site-wide.
7. Sentry receives a test exception from a deliberate throw in a development deploy.
8. Plausible records pageviews and the custom events listed in section 11.1.
9. Production domain serves HTTPS, redirects WWW → apex, and redirects the old `beercadeaustralia.com.au` URLs.
10. Brand combination compliance: every page passes a visual audit against Combinations A / B / C from the Brand Guide.

---

## 16. Out of scope (this sprint)

- Online payments or booking confirmation flows.
- Multi-language support.
- Customer accounts / login.
- Reviews ingestion from Google.
- Loyalty / rewards.
- An admin panel beyond the Sanity studio.
- A blog. (If desired in sprint 2, add a `post` schema and `/journal` route.)

---

## 17. Open questions for the consultant — resolved

All five questions from v1.0 are now closed:

- **Machine alt text required.** Added as a sub-field on every image type in the schema (machine.photo, event.hero, whatsOn.photo, homepage.heroPoster). Required with 4–120 character validation.
- **High-contrast text on Tilt-Purple heroes.** Trust the utility classes — no editor-level enforcement in the studio. Document the rule in `08_Sanity_Training_Doc.md`.
- **Function enquiry archive.** Sanity is the archive of record. No Drive copy in the server action. The Bookings calendar event plus the group inbox thread are the operational records; Sanity is the pipeline view.
- **Plausible.** Plausible Cloud, not self-hosted Community Edition.
- **Sentry.** Free tier.

Any new open questions land here as they emerge.

---

## 18. Implementation order for Claude Code

A single sensible build order:

1. Repo scaffold + Tailwind + brand tokens + fonts.
2. Sanity studio + schemas + first-pass content.
3. Layout shell, Header, Footer, SkipLink, global typography.
4. Home page with hardcoded fixtures, then wired to Sanity.
5. Machines grid + machine detail.
6. What's On + event detail.
7. Functions page + FunctionEnquiryForm + server action + Resend templates + Calendar integration + Sanity write.
8. Find Us page.
9. Newsletter signup + Kit integration.
10. SEO foundation (metadata, JSON-LD, sitemap, robots, OG images).
11. Analytics + Sentry.
12. Accessibility pass.
13. Performance pass.
14. Soft launch to staging URL.
15. Domain cutover.

Ship in that order, opening a draft PR for each step so the consultant can review incrementally.
