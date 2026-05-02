# Deferred Work

## Goal B — Savings Core Feature

**Deferred from:** Quick Dev session — savings-auth split (2026-05-02)
**Prerequisite:** spec-savings-auth must be completed and merged first.

### Scope
Full savings tracking feature for the friend group saving for a trip to Brazil:

- **Database tables**: savings_contributions, savings_fund_months, savings_members (or group_memberships)
- **Backend**: routes + services for contributions CRUD, monthly fund management (TNA entry by admin), returns calculation
- **Frontend**:
  - Contributions page: form to load a contribution (with fund flag), list of contributions per month
  - Dashboard: group view (total fund, total returns, all members) and personal view (individual contributions, individual returns)
  - Admin-only: form to enter monthly TNA, mark which contributions enter the fund, view returns for the cycle

### Business logic to implement
- Admin (Mati) manually marks each contribution as entering the fund or not
- Returns per person = (person's accumulated contribution / total fund) × monthly TNA-derived return
- Monthly fund cycle = 28 days; returns re-invested with new contributions next month
- Both individual and total fund returns must be visible
- Members can be added over time; they contribute from the month they join

### Run with
`/bmad-quick-dev` in a fresh context window, after savings-auth feature is live.

---

## Deferred: Mobile nav crowding (from review of spec-savings-auth)

~~**RESOLVED 2026-05-02:** Gastos items now hidden on mobile for savings users (spec-mobile-nav-savings-crowding).~~

Remaining deferred items from adversarial review of the fix:

- **No logout affordance on mobile** — the sign-out button only exists in the desktop sidebar footer. Savings users on mobile have no way to log out. Pre-existing.
- **Role flash on admin mobile** — `useAuth` initialises `role` as `"savings"`; during `onAuthStateChange` the 5 gastos items briefly disappear and reappear for admin users. Pre-existing architectural issue in `useAuth`.
- **`justify-around` layout with 6 items on small phones** — "Transacciones" label can overflow at 320px. Affects admin path (unchanged by fix). Pre-existing.
