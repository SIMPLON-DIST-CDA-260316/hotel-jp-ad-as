# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

No test runner is configured yet.

## Architecture

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Drizzle ORM + Better Auth + PostgreSQL

**Key conventions:**
- App Router under `src/app/` — all routes are directories with `page.tsx`
- Path alias `@/*` maps to `src/*`
- React Compiler is enabled (`reactCompiler: true` in next.config.ts) — avoid manual `useMemo`/`useCallback` unless needed for correctness
- Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`) — no `tailwind.config.js`; configure via CSS in `src/app/globals.css`

**Database:** Drizzle ORM with PostgreSQL (`postgres` driver). Migrations managed by Drizzle Kit.

**Auth:** Better Auth handles authentication. Likely needs a `DATABASE_URL` env var and Better Auth config (not yet scaffolded).

## Environment

A `.env.local` file is gitignored and not yet created. Expect at minimum:
- `DATABASE_URL` — PostgreSQL connection string for Drizzle/Better Auth
