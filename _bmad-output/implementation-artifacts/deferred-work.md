# Deferred Work

## ~~Goal B — Savings Core Feature~~ (split into B1 and B2)

~~**Deferred from:** Quick Dev session — savings-auth split (2026-05-02)~~
~~**Prerequisite:** spec-savings-auth must be completed and merged first.~~

_Replaced by Goal B1 (completed via spec-savings-contributions) and Goal B2 below._

---

## ~~Goal B2 — Savings Fund & Returns~~

~~**Deferred from:** Quick Dev session — savings-contributions split (2026-05-02)~~

_Completed via spec-savings-fund-returns (2026-05-02). DB migration in `supabase/migrations/savings_fund.sql` must be applied manually via Supabase Dashboard._

---

## Deferred: Savings fund/returns polish (from review of spec-savings-fund-returns, 2026-05-02)

- **calculate_returns over-fetches contributions for non-admin** — `GET /returns` fetches all enters_fund contributions from DB regardless of role, then filters members in Python. Acceptable for small group; push a `member_id` filter into the DB query if group grows or privacy becomes a concern.
- **FundMonthForm TNA NaN on empty submit** — `parseFloat("")` produces NaN; HTML `required` attribute is the only client-side guard. Backend rejects with 422 so no data corruption, but the error is silent in the UI. Add a JS guard (`if (!tna || isNaN(parseFloat(tna))) return`) before mutate for better UX.

---

## Deferred: Mobile nav crowding (from review of spec-savings-auth)

~~**RESOLVED 2026-05-02:** Gastos items now hidden on mobile for savings users (spec-mobile-nav-savings-crowding).~~

Remaining deferred items from adversarial review of the fix:

- **No logout affordance on mobile** — the sign-out button only exists in the desktop sidebar footer. Savings users on mobile have no way to log out. Pre-existing.
- **Role flash on admin mobile** — `useAuth` initialises `role` as `"savings"`; during `onAuthStateChange` the 5 gastos items briefly disappear and reappear for admin users. Pre-existing architectural issue in `useAuth`.
- **`justify-around` layout with 6 items on small phones** — "Transacciones" label can overflow at 320px. Affects admin path (unchanged by fix). Pre-existing.

---

## Deferred: Savings contributions UX polish (from review of spec-savings-contributions, 2026-05-02)

- **Delete confirmation** — `SavingsPage` delete fires immediately on click with no undo path. A misclick permanently removes a contribution. Low priority for a small trusted-admin group but worth a confirm dialog or soft-delete eventually.
- **get_user_role extra DB call** — `GET /api/savings/contributions` always calls `get_user_role(user_id)` (one extra Supabase round-trip). Acceptable for small group now; cache in JWT claims or a request-scoped cache if it becomes a bottleneck.
