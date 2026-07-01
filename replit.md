# AverNox TraderBot

A full-featured AI-powered crypto trading simulation platform with deposits, investments, withdrawals, portfolio tracking, live trade feeds, and complete user management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/avernox run dev` — run the frontend (port 18641)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Wouter + TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/index.ts` — Database schema (Drizzle)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/avernox/src/` — React frontend
- `lib/api-client-react/src/generated/` — Generated hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Architecture decisions

- Token-based auth stored in localStorage as `avernox_token`, sent as `Authorization: Bearer` header
- Transaction codes (TXN-*) are reusable but have a 44-hour cooldown enforced via `txn_code_usage` table
- Deposits auto-trigger a 7-day AI investment with 1.85x–2.15x target return
- Withdrawals always show "reversed" status; balance is restored after 5 hours server-side
- Trade feed is pre-generated at deposit time (7 days × 8-13 trades/day) with 35% loss trades for realism
- OTP for forgot password must contain a repeated digit pair (11, 22, etc.)

## Product

- User registration/login with email + password (8+ chars, special char required)
- Forgot password via 6-digit OTP (double digit validation)
- Deposit portal with BTC/ETH/SOL QR codes and transaction code validation
- 7-day AI investment tracker with live trade feed, refresh button
- Multi-step withdrawal flow with identity verification and "reversed" receipt
- Portfolio with holdings, performance metrics, win rate
- Market page: trending assets (gainers/losers) + trade alerts
- Notifications center (goal hit, trade alerts, market impact, system)
- Settings: username, password, account status, trade alerts toggle, logout
- Customer care with common issues and @AverAssistancebot link
- Full NYSE / AverNox branding throughout

## Branding

- App: AverNox TraderBot
- Company: NYSE (New York Stock Exchange)
- Telegram: https://t.me/AverNoxTraderbot
- Support: @AverAssistancebot
- Footer: © 2026 Aver. All rights reserved. Built, designed, and maintained by NYSE.
- Trademark: AverNox™ and AverNox TraderBot™ are trademarks of NYSE.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Transaction codes have a 44-hour cooldown — enforced server-side, never shown to user
- The `tokenStore` is in-memory (Map) — tokens reset on server restart. This is intentional for dev.
- `pnpm --filter @workspace/db run push` must be re-run after any schema change
- Always re-run codegen after OpenAPI spec changes: `pnpm --filter @workspace/api-spec run codegen`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
