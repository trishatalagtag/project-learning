## Purpose
Help AI coding assistants be productive in this repository by summarizing architecture, common workflows, conventions, and where to look for examples.

## Quick picture (what this repo is)
- Fullstack TypeScript app with a React + Vite frontend and a Convex backend (folder: `convex/`).
- Frontend: `src/` (entry: `src/main.tsx`), uses TanStack Router (routes generated from `src/pages` -> `src/routes.ts`), Tailwind, TipTap editor, and many Radix UI / accessibility libs.
- Backend: Convex functions, schema and generated types live in `convex/`. `convex/schema.ts` defines the data model. Generated APIs are in `convex/_generated/` (do NOT edit generated files).

## How to run (developer workflow)
- Use pnpm (project has `pnpm-lock.yaml`). Typical local dev: `pnpm install` then `pnpm dev`.
- `pnpm dev` runs `npm run dev` which executes both frontend and Convex dev in parallel: front-end via Vite and backend via `convex dev --typecheck-components --live-component-sources`.
- To regenerate Convex types after changing `convex/schema.ts` or component definitions: run `pnpm run generate` (invokes `convex dev --once`).
- See `package.json` scripts: `dev`, `dev:frontend`, `dev:backend`, `generate`, `logs`, `lint`.

## Key environment variables
- VITE_CONVEX_URL — used by the frontend (see `src/main.tsx` where ConvexReactClient is constructed).
- SITE_URL — used by backend auth plugin (defaulted to `http://localhost:5173` in `convex/auth.ts`).

## Important files & patterns (where to look)
- Frontend entry: `src/main.tsx` — shows Convex client creation, BetterAuth provider, and Router wiring.
- Routes: `src/pages/` are the source files; the TanStack Vite plugin generates `src/routes.ts` (see `vite.config.ts` for plugin config). Modify `src/pages` to change routes.
- Convex schema & tables: `convex/schema.ts` — canonical data model (courses, modules, lessons, quizzes, etc.).
- Convex generated API: `convex/_generated/api.*` and `convex/_generated/dataModel.*` — auto-generated; import from `api` alias (configured in `vite.config.ts`).
- Backend auth: `convex/auth.ts` + `convex/auth/schema` and `convex/convex.config.ts` — Better Auth integration and route registration (see `convex/http.ts`).
- Migrations: `convex/migrations/` and `src/components/migrations-trigger.tsx` (frontend UI triggers migration tracking).

## Conventions and gotchas
- Don't edit files under `convex/_generated/`. Instead change schema or components and run `pnpm run generate`.
- Backend TypeScript is type-checked independently (lint script runs `tsc -p convex && eslint convex`). If you change server APIs, ensure `generate` runs so frontend types stay in sync.
- Vite aliases: `@/` -> `src/`, `@/convex/` -> `convex/`, and `api` -> `convex/_generated/api` (see `vite.config.ts`). Use these aliases when adding imports.
- Auth: the project uses `@convex-dev/better-auth` and a custom `createAuth` wrapper in `convex/auth.ts`. User records include extra fields like `role`, `institution`, `bio` — use adapter methods in `convex/_generated/api` or `convex/auth` utilities.
- Storage references use Convex `_storage` ids (e.g., `coverImageId` in `courses`).

## Common tasks — concrete steps
- Add a new table/field: edit `convex/schema.ts` -> run `pnpm run generate` -> update server functions -> run `pnpm dev`.
- Add a new frontend page/route: create file under `src/pages/` following the current page pattern -> Vite plugin will regenerate `src/routes.ts` during dev.
- Debugging backend: run `pnpm run dev` and use `pnpm run logs` to tail Convex logs.

## Examples (copy/paste snippets you will find useful)
- Create Convex client in frontend (see `src/main.tsx`):
  const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

- Import generated api (alias `api` configured in `vite.config.ts`):
  import { someComponent } from 'api'

## What not to change here
- Do not modify generated files in `convex/_generated` or the `src/routes.ts` generated route tree. Regenerate instead.

## Where AI agents should look first
1. `package.json` — scripts and dev entry points.
2. `src/main.tsx` — wiring for auth, Convex client, and router.
3. `vite.config.ts` — important aliases and route-generation plugin.
4. `convex/schema.ts` and `convex/` folder — data model and server logic.

## If something is unclear
- Ask for the intended change (frontend vs backend), whether you may modify generated files, and whether to run `pnpm run generate` / `pnpm dev` as part of the change. Prefer creating a small PR that updates one logical area.

---
If you want, I can merge this into an existing instructions file (if you have one elsewhere) or add short examples for a specific task (e.g., add a new Convex table + frontend page). What should I clarify or expand? 