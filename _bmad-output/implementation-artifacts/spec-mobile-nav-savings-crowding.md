---
title: 'Mobile Nav Crowding Fix for Savings Role'
type: 'bugfix'
created: '2026-05-02'
status: 'done'
route: 'one-shot'
context:
  - '_bmad-output/project-context.md'
---

# Mobile Nav Crowding Fix for Savings Role

## Intent

**Problem:** On small viewports (375px), the mobile bottom nav rendered all 6 items (1 savings + 5 gastos) even for savings-role users, who cannot access the gastos routes. The 5 disabled ghost items crowded the bar and caused label overflow.

**Approach:** Hide gastos nav items entirely in the mobile nav when the user is not admin, since savings users have no access to those routes. The desktop sidebar retains the lock-icon affordance for discoverability.

## Suggested Review Order

- [`frontend/src/components/layout/Sidebar.tsx`](../../frontend/src/components/layout/Sidebar.tsx) — mobile branch: `isAdmin &&` guard added to `gastosNavItems.map(...)` (line ~60); className simplified (removed `isAdmin` ternary).
