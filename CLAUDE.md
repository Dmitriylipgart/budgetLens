# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BudgetLens is a personal finance analytics app for parsing Belarusian bank (Priorbank) CSV statements using the Claude API and displaying analytics via a React dashboard. It's a full-stack TypeScript monorepo: NestJS backend + React/Vite frontend in a single `package.json`.

## Commands

```bash
# Development (both server + client concurrently)
npm run start:dev        # http://localhost:5173 (frontend), http://localhost:3000/api (backend)

# Run separately
npm run server:dev       # NestJS watch mode only
npm run client:dev       # Vite dev server only

# Production
npm run build            # Build both server and client
npm run start:prod       # Run compiled backend (serves React from dist/client/)

# Lint (ESLint with auto-fix)
npm run lint             # Runs on server/**/*.ts and src/**/*.ts
```

There are no automated tests configured in this project.

## Architecture

### Data Flow (CSV Upload)
1. User uploads CSV → Multer saves to disk
2. File decoded from Windows-1251 → UTF-8
3. `ClaudeParseService` calls Claude API with `server/upload/skills/bank-csv-parser/SKILL.md` as system prompt
4. AI returns parsed JSON (transactions + merchant names)
5. `ImportService` wraps in DB transaction: creates `Statement` → upserts `Merchant` → creates `MerchantAlias` → inserts `Transaction`

### Backend (`server/`)
NestJS modules, each self-contained with controller/service/DTOs:
- **upload** — CSV ingestion + AI parsing orchestration; `ClaudeParseService` and `GeminiParseService` implement `AiParseInterface` (switchable via `AI_PROVIDER` env var)
- **transaction** — filterable/paginated transaction queries
- **analytics** — aggregations for dashboard (overview, trends, by merchant/category)
- **merchant** — CRUD + merge (reassigns transactions between merchants)
- **statement** — statement lifecycle
- **auth** — JWT scaffolding; in `single_user` mode `UserGuard` auto-injects `userId=1` without actual authentication
- **database** — TypeORM entities + initial seed; DB file at `./data/budgetlens.db`

TypeScript path aliases: `@server/*` → `server/*`, `@entities/*` → `server/database/entities/*`, `@common/*` → `server/common/*`

### Frontend (`src/`)
React 18 + React Router v6. Pages in `src/pages/`, shared components in `src/components/`. Data fetching via custom hooks in `src/hooks/` that call `src/api/client.ts`. Vite proxies `/api/*` to `localhost:3000` in dev.

### Key Environment Variables
See `.env.example`. The critical ones:
- `ANTHROPIC_API_KEY` — required for CSV parsing
- `AI_MODEL` — defaults to `claude-haiku-4-5-20251001`
- `APP_MODE` — `single_user` (default) or `multi_user`
- `DB_PATH` — SQLite file location (default `./data/budgetlens.db`)

### AI Skill System
The parsing prompt lives in `server/upload/skills/bank-csv-parser/SKILL.md` and is loaded as the Claude system prompt at runtime. It's bundled into `dist/` via `nest-cli.json` asset configuration. Edit this file to change parsing behavior without touching service code.

### Multi-User Scaffolding
The database schema has `user_id` foreign keys on all data tables. `APP_MODE=multi_user` activates real JWT auth. Currently dormant — all requests use `userId=1`.
