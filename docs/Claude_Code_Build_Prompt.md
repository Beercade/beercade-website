# Claude Code — Build Prompt for `Beercade_website`

This file is the working brief for the Claude Code session that builds the Beercade website. Save it as `CLAUDE.md` at the root of the `Beercade_website` repo before starting the session — Claude Code reads `CLAUDE.md` automatically on every session start, so the brief stays loaded without re-prompting.

---

## What you're building

A marketing website for **Beercade Australia**, an arcade bar at 113 Regent Street, Redfern NSW. The audience is mid-30s inner-Sydney adults, function organisers, and pinball enthusiasts — not gamers. The website's jobs, in priority order:

1. Convert function enquiries (the highest-value form on the site).
2. Show the machine lineup so people know what's there.
3. Surface what's on this week and the upcoming tournament/league.
4. Look like the venue the brand guide describes — late-night, confident, deadpan, photographed close not wide.

This is a **single-venue marketing site**, not an app. No accounts, no payments, no admin panel beyond the Sanity studio. Launch date is **Thursday 12 June 2026** (Day 21 of a 30-day sprint).

---

## Sources of truth (read in this order before doing anything else)

1. **`docs/build-spec.md`** — the canonical technical spec. Schemas, routes, components, env vars, integrations, acceptance criteria. If the spec and this file conflict, the spec wins.
2. **`docs/brand-guide.md`** — voice, colours, typography, photography direction, banned vocabulary, sample copy across three surfaces. The brand voice is the highest-leverage element on the site. Get it wrong on one surface and the brand reads inconsistent.
3. **`docs/project-plan.md`** — the 30-day sprint plan. Useful for understanding launch dates and decision points; not normally needed for implementation.

If any of these files are not present in `/docs`, stop and ask for them before scaffolding. Do not proceed from memory.

---

## First action

Once `docs/` is populated:

1. Read the build spec end-to-end. Then re-read sections 5 (brand tokens), 6 (schemas), 7 (pages), and 8 (function enquiry flow).
2. Read the brand guide end-to-end. Pay attention to section 9 (brand voice), section 5 (colour combinations A/B/C), and section 3.3 (accessibility rules around Crema on Tilt Purple).
3. Confirm the local toolchain: Node ≥ 20, pnpm available, git configured. If anything is missing, stop and surface it.
4. Open an issue or a comment titled **"Pre-build audit"** that summarises:
   - What you understood about the brief.
   - Any contradictions or ambiguities you spotted between the spec, the brand guide, and this file.
   - Any open questions you cannot resolve from the docs.
5. Wait for the consultant (John) to acknowledge before scaffolding.

Do not start coding until that audit lands and is acknowledged.

---

## Implementation order

The build spec ends with a 15-step implementation order in section 18. Follow it. Do not reorder without raising the proposed change in a comment first.

For each step, the cadence is:

1. **Open a draft PR** named `step-NN-short-description` from a feature branch.
2. Push commits incrementally. Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
3. Reference the build-spec section being addressed in the PR description (e.g. *"Implements section 7.6 — Functions page"*).
4. Mark the PR ready for review when the step is feature-complete, type-clean, and tested.
5. Wait for a one-line approval from the consultant before merging.

PRs that touch more than one step at a time will be sent back. Small PRs, please.

---

## Working norms

**Stop and ask before deviating from the spec.** Examples that warrant a comment, not silent improvisation:

- A package version listed in the spec has a breaking change since it was written.
- The brand guide commits to a font that has a licensing gotcha for your hosting target.
- A schema field implies a UX decision the spec doesn't make.
- An accessibility rule in the brand guide conflicts with a layout choice elsewhere.

**Do not invent placeholder copy as if it's final.** If the spec or the consultant has not provided body copy for a surface, write the structural HTML and mark the missing content with a clearly visible token:

```tsx
<p className="text-crema">{/* FILLME: in-voice intro for the machines page */}</p>
```

The consultant will fill these in with brand-voice copy before launch. Never ship a `Lorem ipsum`-style filler or a generic LLM-default like *"Welcome to Beercade, where memories are made"* — the brand guide bans phrasing of that kind explicitly. If you must write something to make a layout legible during development, mark it clearly with `// PLACEHOLDER` and leave a TODO comment.

**Do not import packages not listed in the spec without raising it.** The dependency list is deliberate. Bundle-size and security review live downstream; new dependencies create work for both.

**Do not commit secrets.** All real API keys, service-account JSON, write tokens, etc. live in `.env.local` (not in git) and in Vercel's project settings. Add `.env.local` to `.gitignore` and verify that `git status` does not list it before every commit. Use `.env.example` for documented placeholders.

**Branching model.** `main` is protected and matches production. Feature branches off `main`. PRs require the consultant's approval before merge. Vercel preview deployments must succeed before merge.

---

## Quality gates (run before every PR)

Each of these must pass locally before the PR is marked ready:

```bash
pnpm typecheck       # tsc --noEmit, strict mode
pnpm lint            # eslint, prettier
pnpm test            # vitest unit + component
pnpm test:e2e        # playwright smoke flows (where applicable)
pnpm build           # next build, no errors or warnings beyond known noise
```

Additional gates as soon as the relevant surfaces exist:

- **Lighthouse on `/` mobile**: Performance ≥ 90, Accessibility ≥ 95.
- **Lighthouse on `/functions` and `/machines` mobile**: Accessibility ≥ 95.
- **Cypress / Playwright function-enquiry flow** passes end-to-end against a staging Sanity dataset (do not write production fixtures during testing).

If a gate fails for a reason that isn't your code (flaky upstream, transient network), say so in the PR and re-run; do not relax the gate.

---

## Brand voice quick rules

Most placeholder copy you need to write during scaffolding falls under "structural" rather than "marketing." Even so, the brand voice rules apply to anything visible to a customer. Quick reference; the brand guide section 9 is authoritative.

**Reach for these phrases when you need filler that sounds like Beercade:**
*Thursday night, the Godzilla LE, two minutes from the station, the high score, the long pour, midweek, sticky-floor, you'll lose, that's fine, real pinball, machines, regulars, table, function, Redfern, the train.*

**Banned on sight (will be flagged in review):**
*experience, ultimate, premier, level up, game on, epic, immerse, immersive, gamer, gaming destination, your friends will thank you, unleash, unforgettable, hidden gem, foodie, vibes only, where memories are made, we're excited to announce, we are thrilled, our community, family-friendly.*

**AI-writing tells to avoid even in transactional copy** (e.g. form helper text, error messages):
- No "delve," "tapestry," "landscape" (as abstract noun), "elevate," "showcase" (as verb), "underscore," "vibrant," "robust."
- No em-dashes purely for cadence — they used to be John's default but AI has poisoned them. Reach for a semicolon, a comma, or a full stop.
- No three-adjective-stack ("modern, vibrant, exciting"). The rule of three is fine in real prose; it's a tell when applied to filler.
- No "It's not just X — it's Y" negative-parallelism construction.
- No exclamation marks above the fold. They feel desperate. Below the fold, sparingly.

When in doubt: write a sentence that names a specific thing (a machine, a time, a place, a number) rather than a sentence that gestures at a vibe.

---

## What NOT to do

These belong in Sprint 2 or beyond; do not add scope from this list during the launch sprint.

- Payments or booking confirmation flows on the site.
- Multi-language support.
- Customer accounts or login.
- A blog or journal route. (If proposed in Sprint 2, add a `post` schema.)
- Reviews ingestion from Google.
- Loyalty or rewards systems.
- Any admin panel beyond the Sanity studio.
- A chatbot for function enquiries. (Deferred to Sprint 2 with proper eval scaffolding.)

If you find yourself wanting to add one of these because it would be elegant or "improve the site": don't. Surface it as a Sprint 2 backlog item in the repo issues instead.

---

## How to surface blockers

Three escalation paths, in order:

1. **Comment on the active PR** when the blocker relates to the current step. Tag `@john` (or whatever the consultant's GitHub handle is — confirm in the pre-build audit).
2. **Open a GitHub issue** with the label `blocker` when the blocker spans multiple steps or affects the launch date. Title format: `[Blocker] short description (spec §N)`.
3. **Pause the work** if the blocker prevents safe progress. Do not silently proceed past an ambiguous spec point with a guess.

A good blocker write-up names the spec section, the ambiguity or contradiction in concrete terms, the two or three plausible interpretations, and your recommendation. The consultant will reply with a decision within the working day.

---

## Acceptance — "the site is done" means

The site is accepted only when the ten acceptance criteria in build-spec section 15 are all true. The short version:

1. All eight Sanity schemas render in the studio.
2. All ten routes (home, machines, machine detail, what's on, event detail, functions, find us, thanks, privacy, 404) render in production.
3. Studio edits reflect on the public site within 60 seconds.
4. Function enquiry submission writes one Sanity doc, one tentative Bookings calendar event, one team notification to the `functions@` group inbox, and one customer autoresponder, in that order — and rate-limit / Turnstile failures return a friendly error and write nothing.
5. Newsletter signup subscribes to Kit and triggers the welcome sequence.
6. Lighthouse Performance ≥ 90 on `/` mobile; A11y ≥ 95 site-wide.
7. Sentry receives a test exception.
8. Plausible records pageviews and the named custom events.
9. Production domain serves HTTPS, redirects WWW → apex, and redirects the old `beercadeaustralia.com.au` URLs.
10. Visual audit passes against the brand guide's three colour combinations.

These criteria are the ship gate. The consultant signs off when all ten are green.

---

## Repo hygiene

- `README.md` at the root: one-paragraph description, setup commands (lifted from spec section 2), env-var list (lifted from spec section 3), deploy notes (spec section 13).
- `.env.example` at the root, mirroring spec section 3 with empty values and a comment per line explaining what each var is for.
- `docs/` contains the three source-of-truth markdown files.
- `CHANGELOG.md` is optional but useful for the launch sprint — one line per merged PR.
- Conventional Commits enforced via a commit-msg hook (`@commitlint/cli` + `@commitlint/config-conventional` in dev deps).
- Pre-commit hook (Husky or `simple-git-hooks`) runs `pnpm lint --fix` and `pnpm typecheck`.

---

## Questions you should expect to ask in the pre-build audit

Likely candidates based on the spec as it stands:

- The consultant's GitHub handle for review tagging.
- Whether the existing pinball-themed prototype is available in another repo or as static files, since the spec references it as a salvage source.
- Confirmation that the Sanity project ID and dataset have been created by the consultant on Day 2-3 (or whether to scaffold against a brand-new dev dataset first).
- Confirmation that Resend, Sentry, Plausible, Turnstile, and Upstash accounts exist with API keys ready to drop into Vercel.
- Whether the GitHub repo's `main` branch is empty (clean scaffold) or has prior commits (need to consider rebase strategy).

Ask these in the pre-build audit, before you start writing code.

---

## One closing rule

The brand guide's section 12 says "if a sentence, a colour swatch, or a typography choice can't be traced back to a rule in this document, it doesn't ship." That rule extends to code. If a component, a class name, a route, or a copy line cannot be traced back to either this file, the build spec, or the brand guide, it doesn't ship. Surface it as a question, not as a fait accompli in a PR.
