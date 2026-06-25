# Enterprise HRBP Platform

A workforce-intelligence platform for HR Business Partners and executives at HUMAIN. It centralizes headcount, Saudization, diversity, hiring, attrition, employee-relations, and probation data with role-based access and business-unit isolation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/hrbp-platform run dev` — run the web frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — wipe and reseed demo data (16 BUs, personas, ~400 employees + related records)
- Required env: `DATABASE_URL` — Postgres connection string; `SESSION_SECRET` — HMAC key for session cookies

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite, TanStack Query, react-hook-form, Recharts
- Build: esbuild (CJS bundle)

## Design system (HUMAIN brand)

- **Token-driven.** All theming lives in CSS custom properties in `artifacts/hrbp-platform/src/index.css`. The shadcn-style UI library (`src/components/ui/*`) and every page consume these tokens, so editing tokens rebrands the whole app at once. Do not hardcode hex colors in components — use token classes (`bg-primary`, `text-foreground`, etc.).
- **Palette.** Neutrals White/Black/Stone (#E5E5E5) + signature "Rise" gradient Aqua `#00879F` → Air `#00D49C` → Oasis `#D0F94A`. Primary = aqua. Sidebar is a premium near-black surface; active nav uses a deepened aqua tuned for WCAG AA against white text.
- **Typography.** Optician Sans (bundled webfont in `src/assets/fonts/`) for display/headlines/numbers via `--app-font-display` and the `.font-display` / `font-display` utility; Inter for body. `h1`/`h2` use the display face in **natural case** — apply the `uppercase` utility explicitly only on static marketing/section headings (e.g. login hero), never on dynamic titles like names.
- **Gradient utilities.** `.bg-rise`, `.text-rise`, `.border-rise` apply the Rise gradient (defined in `@layer components`).
- **Logo.** `src/components/brand/wordmark.tsx` renders the HUMAIN wordmark; PNGs (white/black) live in `src/assets/brand/`.

## Where things live

- API contract (source of truth): `lib/api-spec/openapi.yaml`. Generated Zod in `@workspace/api-zod`, React Query hooks in `@workspace/api-client-react`.
- DB schema (source of truth): `lib/db/src/schema/*.ts` (businessUnits, users, employees, requisitions, erCases, attrition, probation, auditLog).
- Seed: `lib/db/src/seed.ts`.
- API server: `artifacts/api-server/src/` — routes in `routes/`, auth/RBAC in `lib/auth/`, metrics in `lib/metrics.ts`, audit helper in `lib/audit.ts`.
- Frontend: `artifacts/hrbp-platform/src/`.

## Architecture decisions

- **Pluggable auth seam.** `lib/auth/provider.ts` defines an `AuthProvider` interface. The current `DevPersonaProvider` reads a signed cookie encoding a seeded user id (dev persona login). A future Microsoft Entra ID provider implements the same interface, resolving users via the `users.entra_object_id` column (already present). Personas live in `lib/auth/personas.ts`.
- **Centralized authorization.** `middlewares/auth.ts` exposes `populateAuth` (optional), `requireAuth`, and `requireRole(...)`. `lib/auth/scope.ts` resolves business-unit visibility: `GLOBAL_ROLES` (HR_DIRECTOR, CHRO, ADMIN) see all units; HRBP is restricted to their own BU.
- **App-layer row isolation.** Scoping is enforced in queries (list filters + per-record 404 on out-of-scope access), not Postgres RLS.
- **Audit logging.** Every mutation calls `writeAudit`; failures never break the primary operation. Audit log is ADMIN-only.
- **Rule-based alerts.** `routes/notifications.ts` computes alerts on the fly (low Saudization, high attrition, open high-severity ER cases, aging requisitions, probations ending soon) — no stored notifications table.
- **Date serialization.** Generated Zod treats `createdAt`/`updatedAt` as strings; timestamp columns return `Date`, so routes convert via `iso()`/`isoOrNull()` from `lib/serialize.ts`. `date`-mode columns already return strings.
- **AI Intelligence Layer (deterministic MVP).** `lib/intelligence/engine.ts` derives all intelligence from existing tables (no new DB tables): `loadFacts` does a single-pass per-BU aggregation, then `computeHealth`, attrition/recruitment/ER/workforce risk, `getBenchmarking`, and `buildWorkforceContext` (exposes every data point for future AI). Thresholds live in one `POLICY` object; all ratios are divide-by-zero / empty-scope guarded. Routes in `routes/intelligence.ts` (`/intelligence/health-scores`, `/risk`, `/benchmarking`, `/insights`, `/context`) reuse `getScope`/`resolveBusinessUnitFilter`; **benchmarking is global-only** (`requireRole`, 403 for HRBP).
- **Pluggable insight seam.** `lib/intelligence/insights/` defines an `InsightProvider` interface; `RuleBasedInsightProvider` is the deterministic default. `getInsightProvider` is an env-selected factory (`INSIGHT_PROVIDER`, default rule-based) — drop in an OpenAI/Azure provider later without touching routes, contract, or UI.

## Product

- Persona login (dev): HRBP for HUMAIN Intelligence / Technology / Human Resources, plus global CHRO and ADMIN.
- Six KPIs: Headcount, Saudization %, Female %, Open Roles, Attrition %, Open ER Cases — scoped to the viewer's business unit (global for CHRO/HR_DIRECTOR/ADMIN).
- CHRO per-business-unit comparison and 12-month headcount/exit trends.
- Scoped CRUD for employees, requisitions, ER cases, attrition (no update), and probation.
- ADMIN-only user management and audit log.
- Intelligence section: Overview (BU health + top risk + insights), Workforce Risk detail, Cross-BU Benchmarking (global roles only), Executive Insights — all scope-aware; benchmarking nav/CTA hidden for HRBP.
- Scaffold-only navigation for Talent / Succession / Performance.

## User preferences

- No emojis in the UI.

## Gotchas

- After editing any `lib/*` package, run `pnpm run typecheck:libs` before leaf typechecks — stale lib declarations show up as missing `@workspace/db` exports.
- `pnpm --filter @workspace/db run seed` is destructive: it truncates all tables (in FK order) before inserting.
- HRBP-scoped requests for out-of-scope records return 404 (not 403) to avoid leaking existence; cross-BU creates return 403.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
