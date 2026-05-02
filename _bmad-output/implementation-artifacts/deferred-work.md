# Deferred Work

## ~~Goal B — Savings Core Feature~~ (split into B1 and B2)

~~**Deferred from:** Quick Dev session — savings-auth split (2026-05-02)~~
~~**Prerequisite:** spec-savings-auth must be completed and merged first.~~

_Replaced by Goal B1 (completed via spec-savings-contributions) and Goal B2 below._

---

## Goal B2 — Savings Fund & Returns

**Deferred from:** Quick Dev session — savings-contributions split (2026-05-02)
**Prerequisite:** spec-savings-contributions must be completed and merged first.

### Scope
Fund management and returns calculation layer on top of the contributions foundation:

- **Database tables**: savings_fund_months
- **Backend**: monthly TNA entry by admin, mark which contributions enter the fund, returns calculation (proportional share)
- **Frontend**:
  - Admin-only: form to enter monthly TNA, toggle which contributions enter the fund, view returns for the cycle
  - Dashboard: group view (total fund, total returns, all members) and personal view (individual contributions, individual returns)

### Business logic to implement
- Admin (Mati) manually marks each contribution as entering the fund or not
- Returns per person = (person's accumulated contribution / total fund) × monthly TNA-derived return
- Monthly fund cycle = 28 days; returns re-invested with new contributions next month
- Both individual and total fund returns must be visible

### Run with
`/bmad-quick-dev` in a fresh context window, after spec-savings-contributions is live.

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
