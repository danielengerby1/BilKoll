# BilKoll – CLAUDE.md

"Skyscanner for car repair" + AI Pocket Mechanic for Swedish car owners. Launch market: **Stockholms län**.
Workshops are **real businesses**; prices are **BilKoll's estimates** (never presented as the workshop's own price). The user gets a quote from a workshop and compares it with our estimate → **Billigt / Bra värde / Dyrt**.
The core promise is that the user does not get overcharged ("bli lurad på verkstaden"). Every feature should make prices and advice **transparent, explainable and conservative**.

## Stack
- Next.js 15 (App Router, Server Components, Server Actions), TypeScript `strict`
- Tailwind CSS v4 + shadcn/ui (new-york, files in `src/components/ui`) + lucide-react
- Prisma 6 with the Rust-free query compiler + `@prisma/adapter-pg` (`engineType = "client"`). PostgreSQL everywhere: Supabase in prod, any Postgres locally. `DATABASE_URL` = pooled (runtime), `DIRECT_URL` = direct (migrations).
- Hosted on Vercel. The `vercel-build` script runs `prisma migrate deploy` + the idempotent seed before `next build`.
- Zod 4 for every boundary (form input, Server Action args, AI output, external APIs)
- Anthropic SDK behind the provider-agnostic `AIService` (`src/server/ai`)
- Vitest for unit tests

## Commands
| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Typecheck / lint / test (run all before finishing a task) | `npm run check` |
| Unit tests | `npm test` (watch: `npm run test:watch`) |
| Regenerate Prisma client | `npm run db:generate` |
| Sync schema to dev DB (prototyping) | `npm run db:push` |
| Create migration | `npm run db:migrate -- --name <name>` |
| Seed | `npm run db:seed` |
| Reset DB + reseed | `npm run db:reset` |
| Browse data | `npm run db:studio` |

First run: `cp .env.example .env` (point it at a Postgres/Supabase DB) `&& npm i && npx prisma migrate deploy && npm run db:seed && npm run dev`
Seed is idempotent (upserts by slug) and never deletes user data.

## Project layout
```
prisma/              schema.prisma, seed.ts, migrations/, data/workshops.ts (real workshops + source URLs)
src/app/             Routes only. Thin: fetch data, compose feature components.
src/components/ui/   shadcn primitives. No business logic. Do not edit except to theme.
src/components/      App-wide chrome (header, demo banner).
src/features/<name>/ Vertical slices: vehicle-lookup, comparison, ai-mechanic, quote-audit
  components/        Feature UI (client components named *.client.tsx when "use client")
  server/            Queries + Server Actions for this feature ("use server" files: actions.ts)
  *.ts               Pure feature logic (ranking.ts, audit.ts, safety.ts) – unit-tested
src/server/          Cross-cutting server code: db.ts, ai/, vehicle-data/
src/lib/             Pure, framework-free helpers (money, regnr, geo, dates, domain enums, car-models, estimate). Unit-tested.
tests/               Vitest tests for src/lib and pure feature logic
```
Import rules: `app → features → server/lib`. Features never import from each other's `server/`. Pure logic goes in `src/lib` or a `*.ts` file in the feature with no React/Prisma imports, so it can be tested.

## Routes
| Route | What |
|---|---|
| `/` | Hero, regnr lookup, search form, standard price per service |
| `/jamfor?tjanst=&postnr=&regnr=&sortera=` | Real workshops with estimated price ranges (GET params → shareable URLs) |
| `/bil/[regnr]` | Car summary, besiktning deadline, model guide, estimates for the car |
| `/verkstad/[id]` | Workshop contact details, source, estimates per service |
| `/granska?verkstad=&tjanst=&regnr=` | Compare a received quote with our estimate |
| `/fraga` | AI mechanic chat |

## Domain rules (do not break)
- **Money:** whole SEK as `Int`, **always incl. 25 % moms**, field/var suffix `Sek` (`hourlyRateSek`). No floats for money. Format only through `formatSek()` (`src/lib/money.ts`). Show "inkl. moms" next to prices in the UI.
- **Estimates, not prices:** `src/lib/estimate.ts` computes ranges = book time × `TIER_ESTIMATE[tier].rateSek` + `typicalPartsSek` × parts multiplier (× `PRICE_CLASS_FACTOR` for premium cars). Never store or label an estimate as a workshop's price. UI copy says "Uppskattat pris" / "BilKolls uppskattning". Breakdown: *Arbetskostnad* (labour) + *Materialkostnad* (parts). `QuoteAudit.benchmark*Sek` are deliberate snapshots.
- **Offer signal:** `classifyOffer()` – below the workshop-tier range = `BILLIGT`, inside = `BRA_VARDE`, above = `DYRT`. Compare against the tier of the workshop that gave the quote (a dealer isn't "dyrt" for dealer prices); without a workshop, against `marketEstimate()`. Upsell is a separate flag (`suspectedUpsell`).
- **Real workshop data:** public business details only, each with `sourceUrl` and `verifiedAt`. Don't copy third-party ratings/reviews. Don't invent phone numbers or addresses; leave a field empty if no source has it. Coordinates are postal-area centres (show distances as "ca").
- **Regnr:** always `normalizeRegnr()` before storing or looking up (`ABC123`). Display with `formatRegnr()` (`ABC 123`). Accept both `ABC 123` and `ABC 12D`.
- **Enums:** stored as `String` in Prisma. Allowed values live **only** in `src/lib/domain.ts` (Zod enums). Validate with Zod before writing.
- **Stockholm hourly-rate band:** 1 200–2 200 SEK/h inkl. moms (`STOCKHOLM_HOURLY_RATE_SEK`). Keep it as a constant, not a magic number.
- **Distance:** `distanceKm()` (haversine) from the user's postal code, falling back to `STOCKHOLM_CENTRAL`.
- **Trust badges:** Godkänd Bilverkstad, MRF-ansluten, Auktoriserad märkesverkstad. Only show a badge when the DB flag is true. Never infer badges. Godkänd/MRF stay false until checked against the official registers; authorised makes come from the dealer's own name/site.
- **Ranking:** "Bäst värde" is the open formula in `features/comparison/ranking.ts` (`VALUE_WEIGHTS`). The UI explains it (`ValueExplainer`). No paid placement.
- **Banner:** keep the banner saying prices are estimates until workshops publish real prices.

## AI rules
- Features call `getAIService()` (`src/server/ai`). Never import `@anthropic-ai/sdk` outside `src/server/ai/providers/` (enforced by ESLint).
- Model comes from `AI_MODEL` (default `claude-sonnet-5-5`). Don't hardcode model IDs elsewhere.
- **Numbers come from our code, not the model.** The verdict and estimate come from `lib/estimate.ts` + `features/quote-audit/audit.ts`. The model only explains, and may only *add* an upsell warning (OR-ed with ours). Parse model output with Zod and fall back to deterministic text when parsing fails.
- User-facing AI text is Swedish, plain-language, short. Safety-critical symptoms (brakes, steering, red warning lights, smell of fuel) must tell the user to stop driving or contact a workshop – `features/ai-mechanic/safety.ts` does this deterministically, independent of the model. The AI never claims a definitive diagnosis.
- Store `aiModel` on `QuoteAudit` rows for traceability.
- Tests use the `mock` provider (`AI_PROVIDER=mock`). No network calls in tests.

## External data
- Vehicle lookup goes through `VehicleDataProvider` (`src/server/vehicle-data`). The `mock` adapter is the default. Real adapters (Biluppgifter, Transportstyrelsen) must return the same `VehicleRecord` shape and cache into `Vehicle`.
- Secrets only via env vars (`.env`, never committed; document new ones in `.env.example`).

## Coding style
- TypeScript strict, no `any` (use `unknown` + Zod). Prefer `type` over `interface` except for service contracts (`AIService`, `VehicleDataProvider`).
- Server Components by default; add `"use client"` only for interactivity. Mutations via Server Actions that validate with Zod and return `{ ok: true, data } | { ok: false, error }` (`src/lib/action-result.ts`).
- Client forms submit with `onSubmit` + `startTransition(() => action(formData))` so input isn't wiped on validation errors.
- Keep files small and focused (aim for under ~200 lines). One component per file. Named exports, except Next.js route files.
- Code, identifiers and comments in **English**; **all user-facing copy in Swedish**. Swedish domain nouns are fine as identifiers when they *are* the concept (`regnr`, `besiktning`, `isGodkandBilverkstad`).
- Tailwind utility classes. Use `cn()` for conditional classes. No inline styles (except data-driven positions, e.g. `RangeMeter`), no CSS modules.
- Accessibility: every input has a label, interactive elements are keyboard-reachable, colour is never the only signal (verdicts get icon + text).
- Dates: `Intl.DateTimeFormat("sv-SE")`, timezone `Europe/Stockholm`.

## Definition of done
1. `npm run check` passes.
2. New pure logic has a Vitest test.
3. Schema changes have a migration (once we leave `db:push` prototyping) and an updated seed.
4. UI copy is Swedish and prices show "inkl. moms".
