---
title: 'Savings Fund & Returns'
type: 'feature'
created: '2026-05-02'
status: 'done'
baseline_commit: 'e0bb98bfd6e413a0d3c7f81c902994fb765ba772'
context:
  - '_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Contributions are being recorded but there's no way to mark which ones enter the fund, enter a monthly TNA, or calculate the returns each member has earned.

**Approach:** Add `enters_fund` flag to existing contributions + a `savings_fund_months` table (one TNA entry per month by admin). Build a returns calculation service and surface everything in a new "Retornos" tab on SavingsPage alongside the existing "Aportes" tab.

## Boundaries & Constraints

**Always:**
- Monthly return formula: `accumulated × (TNA / 12 / 100)` — TNA is an annual percentage, divide by 12 to get monthly rate
- Accumulated for a person at month N = accumulated(N-1) + return(N-1) + enters_fund contributions for month N
- Returns calculation is computed server-side; never store derived returns in DB
- `enters_fund` toggle and fund month entry: admin only
- Returns view: admin sees all members; savings user sees only their own row
- `savings_fund_months` has UNIQUE constraint on `month` — one TNA per month

**Ask First:**
- If historical months without a fund_month entry should exclude their contributions entirely or carry them forward once the month is closed

**Never:**
- No storing computed returns or accumulated totals in DB
- No B1 scope changes (amount/notes edit belongs to spec-savings-contributions)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Calculate returns | fund_months exist, some contributions enters_fund | Accumulated compounds month-over-month; returns per person | |
| Member has no enters_fund contributions | any | accumulated=0, return=0 for that member | |
| Fund month already exists | POST /fund-months same month | — | 400 "Fund month already exists for this period" |
| Admin toggles enters_fund | PATCH /contributions/{id}/fund | Returns updated contribution with new enters_fund value | 404 if not found |
| No fund months yet | GET /returns | `{members: [], total_fund: 0, total_return: 0}` | |

</frozen-after-approval>

## Code Map

- `backend/app/models/savings.py` — extend: SavingsFundMonthCreate/Out, SavingsPersonReturn, SavingsReturnsOut; add `enters_fund` to ContributionOut
- `backend/app/services/savings_service.py` — extend: toggle_fund_entry, create/list fund_months, calculate_returns
- `backend/app/routes/savings.py` — extend: PATCH /contributions/{id}/fund, GET+POST /fund-months, GET /returns
- `frontend/src/lib/types.ts` — extend: add enters_fund to SavingsContribution; add SavingsFundMonth, SavingsPersonReturn, SavingsReturns
- `frontend/src/lib/api.ts` — extend: toggleFundEntry, getFundMonths, createFundMonth, getReturns
- `frontend/src/hooks/useSavings.ts` — extend: useFundMonths, useCreateFundMonth, useToggleFundEntry, useReturns
- `frontend/src/components/savings/FundMonthForm.tsx` — new: dialog form (month + TNA input)
- `frontend/src/components/savings/ReturnsView.tsx` — new: group summary card + per-member table
- `frontend/src/pages/SavingsPage.tsx` — modify: wrap in Tabs (Aportes | Retornos); add enters_fund switch per row (admin); Retornos tab renders ReturnsView + admin FundMonthForm button

## Tasks & Acceptance

**Execution:**
- [x] Supabase MCP — migration `savings_fund`: `ALTER TABLE savings_contributions ADD COLUMN enters_fund BOOLEAN NOT NULL DEFAULT FALSE`; `CREATE TABLE savings_fund_months (id UUID PK DEFAULT gen_random_uuid(), month DATE NOT NULL UNIQUE, tna NUMERIC(6,2) NOT NULL CHECK (tna > 0), created_at TIMESTAMPTZ NOT NULL DEFAULT now()); ALTER TABLE savings_fund_months ENABLE ROW LEVEL SECURITY; CREATE POLICY "fund_months_select_authenticated" ON savings_fund_months FOR SELECT TO authenticated USING (true);`
- [x] `backend/app/models/savings.py` — add `enters_fund: bool` to `SavingsContributionOut`; add `SavingsFundMonthCreate(month: date, tna: float gt=0)`, `SavingsFundMonthOut(id, month, tna, created_at)`; add `SavingsMonthlyDetail(month, contribution_entered, accumulated, monthly_rate, return_amount, cumulative_return)`, `SavingsPersonReturn(member_id, display_name, monthly_details list, total_accumulated, total_return)`, `SavingsReturnsOut(members, total_fund, total_return)`
- [x] `backend/app/services/savings_service.py` — add `toggle_fund_entry(contribution_id, enters_fund)` updates savings_contributions; `create_fund_month(data)` with unique violation handling; `list_fund_months()` ordered by month desc; `calculate_returns(user_id, role)` — see Design Notes for algorithm
- [x] `backend/app/routes/savings.py` — add `PATCH /contributions/{id}/fund` (require_admin); `GET /fund-months` (authenticated); `POST /fund-months` (require_admin); `GET /returns` (authenticated, passes user_id+role to service)
- [x] `frontend/src/lib/types.ts` — add `enters_fund: boolean` to `SavingsContribution`; add `SavingsFundMonth`, `SavingsMonthlyDetail`, `SavingsPersonReturn`, `SavingsReturns` interfaces
- [x] `frontend/src/lib/api.ts` — extend `savingsApi`: `toggleFundEntry(id, enters_fund)`, `getFundMonths()`, `createFundMonth(body)`, `getReturns()`
- [x] `frontend/src/hooks/useSavings.ts` — add `useFundMonths()`, `useCreateFundMonth()`, `useToggleFundEntry()` (invalidates savings-contributions), `useReturns()`
- [x] `frontend/src/components/savings/FundMonthForm.tsx` — dialog form: month (`input type="month"` default current month), TNA (number input gt 0, step=0.01, label "TNA (%)"); calls `useCreateFundMonth`, closes on success
- [x] `frontend/src/components/savings/ReturnsView.tsx` — summary card (total fund + total returns); member table (Nombre | Acumulado | Rendimiento total); admin also sees fund months list with TNA history at bottom; savings user sees only own row; empty state if no fund months
- [x] `frontend/src/pages/SavingsPage.tsx` — wrap content in `<Tabs defaultValue="aportes">` with `<TabsList><TabsTrigger value="aportes">Aportes</TabsTrigger><TabsTrigger value="retornos">Retornos</TabsTrigger></TabsList>`; Aportes tab: existing content + Switch per contribution row for `enters_fund` (admin only, calls `useToggleFundEntry`); Retornos tab: `<ReturnsView />` + admin "Agregar mes" button opening FundMonthForm

**Acceptance Criteria:**
- Given multiple fund months with enters_fund contributions, when GET /returns is called, then accumulated for month N includes all prior contributions + all prior returns (full compound history — not just the previous month's return)
- Given admin, when toggling enters_fund on a contribution, then returns view updates (cache invalidated) and the switch reflects the new value immediately
- Given savings user, when viewing Retornos tab, then only their own row is visible and no admin controls are rendered
- Given admin creating duplicate fund month, when POST /fund-months with same month, then 400 error toast shown
- Given no fund months, when any user opens Retornos tab, then empty state "Sin meses registrados" is shown

## Design Notes

**calculate_returns algorithm:**
```python
fund_months = list of fund months ordered by month ASC
enters_fund_contribs = {(member_id, month_str): amount} dict for all enters_fund=True contributions

member_state = {member_id: {"accumulated": 0.0, "cumulative_return": 0.0}}

for fm in fund_months:
    monthly_rate = fm["tna"] / 12 / 100
    for member in members:
        mid = member["id"]
        contrib = enters_fund_contribs.get((mid, fm["month"]), 0.0)
        new_acc = member_state[mid]["accumulated"] + contrib   # accumulated = ALL prior contributions + ALL prior returns + this month's contribution
        ret = new_acc * monthly_rate                           # return applies to full running total
        member_state[mid]["accumulated"] = new_acc + ret      # carry forward: next month's base includes this return too
        member_state[mid]["cumulative_return"] += ret
```

**enters_fund toggle:** `PATCH /contributions/{id}/fund` body: `{"enters_fund": bool}`. Route returns updated `SavingsContributionOut` with all fields (re-fetches member display_name). Service updates by id — no ownership filter (admin-only route, group data).

**Tab import:** `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"`

## Verification

**Commands:**
- `cd frontend && npm run build` -- expected: zero TypeScript errors
- `cd backend && python -c "from app.routes.savings import router; print('ok')"` -- expected: ok

**Manual checks:**
- Admin: add a fund month (TNA 120%), toggle a contribution enters_fund=true, open Retornos tab → accumulated and return appear correctly
- Savings user: open Retornos → only own row, no admin controls visible

## Spec Change Log

- **2026-05-02** — Adversarial review (3 reviewers): 0 MUST_FIX. Deferred: non-admin DB query over-fetches contributions (all member data pulled, filtered in Python); `parseFloat("")` NaN reaches API (Pydantic rejects with 422, UX-only issue); contributions for months without a fund_month entry are excluded by design (spec "Ask First" scenario — accepted as intended behavior).
