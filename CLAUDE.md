# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Type-check + bundle to dist/
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (`backend/`)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Environment Variables

**`frontend/.env`**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**`backend/.env`**
```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
SUPABASE_JWT_SECRET=...
```

## Architecture

Full-stack expense tracker: React + TypeScript frontend, FastAPI backend, Supabase (managed PostgreSQL) as database and auth provider.

### Auth Flow
1. Frontend authenticates via Supabase Auth; receives JWT access token
2. Axios interceptor in `frontend/src/lib/api.ts` attaches JWT to every request
3. Backend verifies JWT via `get_current_user()` dependency (in `backend/app/auth.py`) injected into all routes
4. Supabase RLS policies enforce user-level data isolation at the DB layer

### Data Flow
```
React page → useQuery hook → API fn (Axios + JWT)
  → FastAPI route → Service layer → Supabase client
    → PostgreSQL (RLS enforces user_id)
```

### Backend Structure (`backend/app/`)
- `main.py` — FastAPI app init, CORS middleware
- `config.py` — Supabase client initialization
- `auth.py` — JWT verification dependency
- `routes/` — HTTP handlers (thin: validate params, delegate to service, return response)
- `models/` — Pydantic v2 schemas for request/response
- `services/` — Business logic (balance adjustments, calculations)

### Frontend Structure (`frontend/src/`)
- `lib/api.ts` — Axios client + all API endpoint functions
- `lib/supabase.ts` — Supabase client initialization
- `lib/types.ts` — Shared TypeScript types
- `hooks/` — React Query hooks (`useTransactions`, `useAccounts`, `useCategories`, `useTransfers`, `useDashboard`, `useAuth`)
- `pages/` — Route-level page components
- `components/` — Reusable UI; `components/ui/` are shadcn/ui base primitives

### Database Tables
- `categories` — expense/income categories with monthly budgets
- `accounts` — bank accounts/wallets with current balance tracking
- `transactions` — income/expense records; creating/updating/deleting auto-adjusts `accounts.current_balance` in the service layer
- `transfers` — money movements between accounts

### Key Business Logic
Transaction mutations (create/update/delete) in `backend/app/services/transaction_service.py` always revert the old balance effect before applying the new one to keep `accounts.current_balance` consistent. The same pattern applies to transfers.

## Tech Stack
- **Frontend:** React 19, React Router 7, Vite, TypeScript, Tailwind CSS 4, shadcn/ui (Radix UI), TanStack React Query, React Hook Form + Zod, Recharts, Axios
- **Backend:** FastAPI, Uvicorn, Pydantic v2, python-jose, supabase-py
- **DB/Auth:** Supabase (PostgreSQL + Auth + RLS)
