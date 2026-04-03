# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── riyadh-tanafas/     # الرياض تنافس — Arabic exam practice web app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Artifacts

### `artifacts/riyadh-tanafas` (`@workspace/riyadh-tanafas`)

Arabic educational web app "الرياض تنافس" (Riyadh Tanafas) — practice tests for the Saudi Nafes (نافس) exam.
Frontend-only React + Vite app served at `/`.

Features:
- **Home page**: Dark starfield landing page with animated trophy, two grade selector cards, and two quiz cards
- **Grade 3 page** (`/grade3`): 67-page practice test with text answer keys (show/hide toggle)
- **Grade 6 page** (`/grade6`): 200-page practice test with image answer keys (show/hide toggle)
- **Quiz Setup** (`/quiz`): Interactive quiz configuration — choose subject/grade, topic, difficulty, question count, and time limit
- **Quiz Session** (`/quiz/session`): Live quiz with countdown timer, question navigation dots, answer selection
- **Results** (`/results`): Score display with detailed question-by-question review
- **Stats** (`/stats`): Statistics for the question bank with category breakdown charts

Both grade pages include:
- Sticky header with grade badge and back button
- Page navigation (prev/next buttons + jump-to-page input + keyboard arrows)
- Scrollable thumbnail strip for all pages
- Full-size question image display
- Toggleable answer panel

Quiz feature uses the external nafes2.replit.app API (CORS: *) as its backend:
- `GET https://nafes2.replit.app/api/questions/categories` — 5 categories, 1194 total questions
- `GET https://nafes2.replit.app/api/questions/topics?category=...` — topics per category
- `POST https://nafes2.replit.app/api/quiz/sessions` — create session (returns id + questions)
- `POST https://nafes2.replit.app/api/quiz/sessions/:id/submit` — submit answers
- `GET https://nafes2.replit.app/api/stats/overview` — stats

Data files (large base64 JPEG arrays):
- `src/data/grade3.ts` — 67 question pages + text answers (GRADE3_PAGES, GRADE3_ANSWERS)
- `src/data/grade6.ts` — 200 question + 200 answer pages (GRADE6_Q_PAGES, GRADE6_A_PAGES)

Key components:
- `src/components/GradeViewer.tsx` — shared viewer component for both grades
- `src/lib/quizApi.ts` — API client for nafes2 quiz backend
- `src/pages/home.tsx` — landing page
- `src/pages/grade3.tsx` — Grade 3 entry point
- `src/pages/grade6.tsx` — Grade 6 entry point
- `src/pages/quiz-setup.tsx` — quiz configuration page
- `src/pages/quiz-session.tsx` — active quiz with timer
- `src/pages/results.tsx` — quiz results with detailed review
- `src/pages/stats.tsx` — question bank statistics

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
