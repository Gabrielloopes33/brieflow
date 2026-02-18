# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repo orientation
This repo is primarily a planning/deployment workspace. The runnable application code lives in `Content-Generator/` (React + Vite frontend, Express + TypeScript backend, Supabase integration). The top-level `README.md` and `STRUCTURE.md` describe a broader “BriefFlow monorepo” vision that may not match what is currently implemented in this folder.

## Common commands
Most day-to-day dev work happens inside `Content-Generator/`.

### Install
From repo root:
- `cd Content-Generator`
- `npm install`

### Run (development)
`Content-Generator/package.json` uses POSIX-style env var assignment (`NODE_ENV=development ...`), which may not work in PowerShell.

PowerShell-friendly dev run:
- `cd Content-Generator`
- `$env:NODE_ENV="development"; $env:PORT="5000"; npx tsx server/index.ts`

Notes:
- Dev mode serves the React app via Vite middleware, and the API from the same Express server.
- Default port is `5000` (see `server/index.ts`).

### Typecheck
- `cd Content-Generator`
- `npm run check`

### Build (production artifacts)
- `cd Content-Generator`
- `npm run build`

This runs `script/build.ts` (Vite build -> `dist/public/`, then esbuild bundle -> `dist/index.cjs`).

### Run (built output)
After `npm run build`:
- `cd Content-Generator`
- `node dist/index.cjs`

(Production mode serves static assets from `dist/public/` via `server/static.ts`.)

### Database migrations (Supabase/Postgres)
- `cd Content-Generator`
- `npm run migrate`
- `npm run migrate:rls`

These scripts expect `DATABASE_URL` to be set (they call `psql $DATABASE_URL ...`).

### Docker (full stack)
See `Content-Generator/docker-compose.yml` and `Content-Generator/DEPLOYMENT.md`.

Typical local Docker bring-up (from `Content-Generator/`):
- `docker compose up -d --build`

### Tests
No test runner is currently configured in `Content-Generator/package.json` (no `test` script).

## High-level architecture (Content-Generator)

### Runtime shape: single server serving API + SPA
Entry point: `Content-Generator/server/index.ts`
- Creates an Express app + Node `http` server.
- Parses JSON and captures `req.rawBody`.
- Installs `authMiddleware` globally (see below).
- Exposes Swagger UI:
  - `GET /api-docs`
  - `GET /api-docs.json`
- Registers API routes via `registerRoutes()` from `server/routes.ts`.
- In dev: mounts Vite as middleware (`server/vite.ts`) and serves the SPA `client/index.html` as a catch-all for non-`/api/*` routes.
- In prod: serves prebuilt static files from `dist/public/` via `server/static.ts`.

### Auth model (backend)
`Content-Generator/server/middleware/auth.ts`:
- Expects `Authorization: Bearer <token>` header.
- Uses a Supabase client (anon key) to validate the token (`supabase.auth.getUser(token)`).
- On success sets `req.user` and `req.userId`.

Important consequence:
- Because `authMiddleware` is mounted before all routes in `server/index.ts`, *every* request (including Swagger and health) requires the bearer token unless the middleware is changed.

### Data access model (current state)
There are two co-existing approaches:

1) Frontend talks to Supabase directly (most of the implemented UI)
- Hooks like `client/src/hooks/use-clients.ts`, `use-sources.ts`, `use-briefs.ts`, `use-contents.ts` call `supabase.from(...).select/insert/...` directly.
- Auth in the UI is handled by Supabase (`client/src/hooks/use-auth.ts`, `client/src/lib/auth.ts`).

2) Backend exposes REST routes that also talk to Supabase
- `server/routes.ts` implements `/api/*` endpoints using `supabaseAdmin` (service role client from `shared/supabase.ts`).
- These routes rely on `req.userId` coming from `authMiddleware`.

When making changes, confirm whether the UI should use:
- direct Supabase calls (current UI behavior), or
- the Express API layer (exists, documented via Swagger, may be intended for future use).

### Shared contracts and schemas
- `Content-Generator/shared/schema.ts`: Drizzle + Zod schemas (SQLite table definitions are the primary exports; PG imports exist but aren’t the main path in the current code).
- `Content-Generator/shared/routes.ts`: Zod-described API surface (paths/methods/responses) and a small `buildUrl()` helper.

### Build system
- `Content-Generator/vite.config.ts`: Vite root is `client/`; build output goes to `dist/public/`.
- `Content-Generator/script/build.ts`: builds client with Vite, then bundles `server/index.ts` into `dist/index.cjs` with esbuild.

## Deployment docs and scripts
- `Content-Generator/DEPLOYMENT.md`: Docker Compose-based production setup (Postgres/Redis/Nginx/Prometheus/Grafana) and GitHub Actions notes.
- Repo root contains multiple `.sh` scripts and `docker-compose.*.yml` files aimed at VPS/stack deployment (many assume Linux paths like `/opt/briefflow`). If you are debugging deploy behavior, start by identifying which compose file/script is being used for the target environment.