---
title: 'Savings Contributions & Members'
type: 'feature'
created: '2026-05-02'
status: 'done'
baseline_commit: 'ce99b1d11259fa70076e294bfec528df0e9b3ea5'
context:
  - '_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The SavingsPage is a placeholder — there's no way to record group contributions or manage who's in the savings group. The auth/role layer is live but the core data model doesn't exist yet.

**Approach:** Add two DB tables (`savings_members`, `savings_contributions`), a FastAPI CRUD layer with admin-only mutations, and replace the SavingsPage placeholder with a functional contributions view: month selector, per-member contribution list, and admin dialogs to add contributions and members.

## Boundaries & Constraints

**Always:**
- Create/update/delete contributions and members: admin only (`require_admin` dependency)
- List contributions: admin sees all; savings user sees only their own member row
- `month` stored as first day of month (`2026-05-01`), never a freeform string
- `savings_contributions` has a unique constraint on `(member_id, month)` — one entry per person per month
- RLS enabled on both tables; service layer always queries with ownership logic regardless

**Ask First:**
- If the one-contribution-per-member-per-month constraint needs relaxing

**Never:**
- No `enters_fund` flag — deferred to B2
- No TNA, returns calculation, or fund management — deferred to B2
- No savings dashboard totals or group returns — deferred to B2

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Admin adds contribution | valid member_id, amount > 0, month | 201 + contribution object | 400 on duplicate (member+month) |
| Admin adds contribution | amount ≤ 0 | — | 422 Pydantic validation error |
| Savings user lists | GET /contributions?month=2026-05 | Only their own contribution row | Empty list if no member row found |
| Admin lists | GET /contributions?month=2026-05 | All members' contributions for month | |
| Savings user calls POST /contributions | — | 403 Forbidden | `require_admin` rejects |
| Admin adds duplicate | same member_id + month again | — | 400 with clear message |

</frozen-after-approval>

## Code Map

- `backend/app/auth.py` — existing `require_admin` dependency; existing `get_user_role(user_id)`
- `backend/app/models/savings.py` — new: Pydantic models for members and contributions
- `backend/app/services/savings_service.py` — new: CRUD; list_contributions filters by role
- `backend/app/routes/savings.py` — new: thin HTTP handlers
- `backend/app/main.py` — register savings router at `/api/savings`
- `frontend/src/lib/types.ts` — add SavingsMember, SavingsContribution types
- `frontend/src/lib/api.ts` — add savingsApi (members + contributions endpoints)
- `frontend/src/hooks/useSavings.ts` — new: React Query hooks wrapping savingsApi
- `frontend/src/components/savings/ContributionForm.tsx` — new: admin add/edit dialog form
- `frontend/src/components/savings/AddMemberForm.tsx` — new: admin add member dialog form
- `frontend/src/pages/SavingsPage.tsx` — replace placeholder: month selector, list, admin actions

## Tasks & Acceptance

**Execution:**
- [x] Supabase MCP — apply migration: create `savings_members` (id, user_id UNIQUE, display_name, joined_at date, created_at) and `savings_contributions` (id, member_id FK, amount numeric CHECK >0, month date, notes nullable, created_at; UNIQUE member_id+month); enable RLS; policy: service key bypasses, anon read own rows only
- [x] `backend/app/models/savings.py` — SavingsMemberCreate (user_id, display_name, joined_at), SavingsMemberOut; SavingsContributionCreate (member_id, amount, month, notes?), SavingsContributionUpdate (amount?, notes?), SavingsContributionOut (includes member display_name via join)
- [x] `backend/app/services/savings_service.py` — list_members, create_member; list_contributions(user_id, role, month?): if role==admin return all, else filter by member row for user_id; create/update/delete_contribution
- [x] `backend/app/routes/savings.py` — GET /members, POST /members (require_admin); GET /contributions(?month=YYYY-MM), POST /contributions (require_admin), PATCH /contributions/{id} (require_admin), DELETE /contributions/{id} (require_admin); route calls get_user_role(user_id) and passes role to service for list
- [x] `backend/app/main.py` — include_router(savings_router, prefix="/api/savings")
- [x] `frontend/src/lib/types.ts` — SavingsMember, SavingsContribution types
- [x] `frontend/src/lib/api.ts` — savingsApi: getMembers, createMember, getContributions(month?), createContribution, updateContribution(id, data), deleteContribution(id)
- [x] `frontend/src/hooks/useSavings.ts` — useMembers(), useContributions(month), useCreateContribution, useUpdateContribution, useDeleteContribution; invalidate ["savings-contributions"] + ["savings-members"] on mutations
- [x] `frontend/src/components/savings/ContributionForm.tsx` — form: member selector (admin picks from members list), amount (number > 0), month (input type="month", default current), notes optional; used for both add and edit
- [x] `frontend/src/components/savings/AddMemberForm.tsx` — form: user_id (text, the auth UUID), display_name, joined_at (input type="month")
- [x] `frontend/src/pages/SavingsPage.tsx` — month selector defaulting to current month (YYYY-MM); contribution list filtered by month; admin: all rows + Edit/Delete per row + "Agregar aporte" button (ContributionForm dialog) + "Agregar miembro" button (AddMemberForm dialog); savings user: own rows only, no action buttons; empty state if no contributions

**Acceptance Criteria:**
- Given admin, when adding a valid contribution, then it appears immediately in the list for that month
- Given savings user, when viewing the page, then only their own contributions are visible and no add/edit/delete controls are rendered
- Given duplicate (member+month) submission, when admin submits, then a 400 error toast is shown
- Given savings user auth token, when calling POST /api/savings/contributions, then 403 is returned
- Given no contributions exist for selected month, when admin views it, then empty state with "Agregar aporte" CTA is shown

## Design Notes

**Role-based list in service:** Route resolves `role = get_user_role(user_id)` (one extra DB call, acceptable for small group) and passes it to `list_contributions`. Service: if `role == "admin"` return all; else query `savings_members` for the user's member row, then filter contributions by that `member_id`. Returns `[]` if no member row (savings user not yet added to group).

**month param convention:** Frontend sends `?month=2026-05`; backend parses with `datetime.strptime(month, "%Y-%m").date()` to get `date(2026, 5, 1)` for DB queries.

**SavingsContributionOut join:** Use Supabase `.select("*, savings_members(display_name)")` to include `member_display_name` in one query without a separate lookup.

## Verification

**Commands:**
- `cd frontend && npm run build` -- expected: zero TypeScript errors
- `cd backend && python -c "from app.routes.savings import router"` -- expected: imports cleanly

**Manual checks:**
- Admin: add a member, add a contribution for that member, verify it appears in list; edit amount, verify update reflected; delete, verify removed
- Savings user: sign in, open /savings, verify only own data visible, verify no add/edit/delete buttons rendered

## Spec Change Log

## Suggested Review Order

**Design entry point**

- Role-based list: admin sees all, savings user sees only their member row
  [`savings_service.py:23`](../../backend/app/services/savings_service.py#L23)

**DB / authorization boundary**

- Route prefix, `require_admin` on mutations, `get_current_user` on list
  [`routes/savings.py:1`](../../backend/app/routes/savings.py#L1)

- List route resolves role and passes it to service — the only place role is fetched
  [`routes/savings.py:20`](../../backend/app/routes/savings.py#L20)

**Contribution CRUD**

- create_contribution: month→str conversion, exception narrowing by pg error code
  [`savings_service.py:46`](../../backend/app/services/savings_service.py#L46)

- update_contribution: partial patch; `notes: notes` (not `|| undefined`) enables clearing
  [`savings_service.py:59`](../../backend/app/services/savings_service.py#L59)

- delete_contribution: 404 via empty res.data check
  [`savings_service.py:74`](../../backend/app/services/savings_service.py#L74)

**Member management**

- create_member: unique constraint handling split from generic DB errors
  [`savings_service.py:14`](../../backend/app/services/savings_service.py#L14)

- Pydantic v2 models; `joined_at` and `month` use Python `date`, str-converted before insert
  [`models/savings.py:1`](../../backend/app/models/savings.py#L1)

**Frontend data layer**

- useCreateMember invalidates both savings-members AND savings-contributions caches
  [`useSavings.ts:16`](../../frontend/src/hooks/useSavings.ts#L16)

- useContributions: month in query key → re-fetches on month change
  [`useSavings.ts:9`](../../frontend/src/hooks/useSavings.ts#L9)

- savingsApi: contributions endpoint passes month as optional query param
  [`api.ts:82`](../../frontend/src/lib/api.ts#L82)

**UI**

- Page: role gate, month state, editing state machine for ContributionForm
  [`SavingsPage.tsx:12`](../../frontend/src/pages/SavingsPage.tsx#L12)

- handleSubmit: memberId guard, create vs edit paths, notes sent as string (not undefined)
  [`ContributionForm.tsx:44`](../../frontend/src/components/savings/ContributionForm.tsx#L44)

- AddMemberForm: YYYY-MM input → YYYY-MM-01 conversion before API call
  [`AddMemberForm.tsx:29`](../../frontend/src/components/savings/AddMemberForm.tsx#L29)

- Loading/empty/list conditional render; admin edit+delete buttons per row
  [`SavingsPage.tsx:45`](../../frontend/src/pages/SavingsPage.tsx#L45)

**Peripherals**

- Router registration (no extra prefix — prefix lives on the APIRouter itself)
  [`main.py:3`](../../backend/app/main.py#L3)

- SavingsMember, SavingsContribution TypeScript types
  [`types.ts:122`](../../frontend/src/lib/types.ts#L122)
