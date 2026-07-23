<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Autoryzacja PIN i Wyświetlanie Listy Reguł

- **Plan**: context/changes/s-05/plan.md
- **Scope**: All Phases
- **Date**: 2026-07-23
- **Verdict**: REJECTED
- **Findings**: 1 critical 6 warnings 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | WARNING |
| Safety & Quality | FAIL |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

## Findings

### F1 — Local rule state wiped out by background polling

- **Severity**: ❌ CRITICAL
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: DealHunter.Web/src/App.tsx:59
- **Detail**: `handleAddRule` and `handleDeleteRule` only mutate local state since backend mutations are out of scope (saved for S-06). However, the 30-second polling unconditionally overwrites the rules list from the backend, causing locally added/deleted rules to abruptly vanish. This breaks the UI state.
- **Fix A ⭐ Recommended**: Disable local mutations until S-06.
  - Strength: Prevents data loss UI bugs while keeping backend mutation out of scope as planned.
  - Tradeoff: The form will temporarily do nothing or need to be hidden until S-06.
  - Confidence: HIGH — respects the plan's strict scope discipline.
  - Blind spot: None significant.
- **Fix B**: Implement backend mutations now.
  - Strength: Fully functional UI with actual data persistence.
  - Tradeoff: Violates scope discipline ("What We're NOT Doing").
  - Confidence: MEDIUM — pulls future work into the current change.
  - Blind spot: Might require backend changes that aren't fully ready yet.
- **Decision**: FIXED (Fix A)

### F2 — Plain text PIN in localStorage

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Safety & Quality
- **Location**: DealHunter.Web/src/shared/context/AuthContext.tsx:16
- **Detail**: The authentication PIN is stored in plain text inside `localStorage`, exposing it to XSS attacks. The plan explicitly specified `localStorage`, but this introduces a security risk for credentials.
- **Fix**: Document as architectural debt in a follow-up ticket.
- **Decision**: FIXED

### F3 — Vite proxy port drift and environment variable loading

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: DealHunter.Web/vite.config.ts:15
- **Detail**: Proxy target drifts from the planned `http://localhost:5000` to `https://localhost:7161`. Additionally, it uses `process.env.VITE_API_URL` without calling Vite's `loadEnv`, causing it to silently ignore `.env` files.
- **Fix**: Call `loadEnv` in `vite.config.ts` and set the default proxy port back to 5000 as planned.
- **Decision**: FIXED

### F4 — Unbounded background polling

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: DealHunter.Web/src/App.tsx:52
- **Detail**: The 30-second `setInterval` polls unconditionally even when the browser tab is hidden, wasting client and server resources.
- **Fix**: Utilize the Page Visibility API to pause the interval when the document is hidden.
- **Decision**: FIXED

### F5 — Inline route-level component

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: DealHunter.Web/src/App.tsx:15
- **Detail**: The `Dashboard` component functions as a primary page but is declared completely inline within `App.tsx`.
- **Fix**: Extract the `Dashboard` component into its own file at `src/pages/Dashboard.tsx` to comply with repository conventions.
- **Decision**: FIXED

### F6 — Incorrect LoginPage location

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: DealHunter.Web/src/features/auth/pages/LoginPage.tsx
- **Detail**: Route-level components that compose features should be placed directly inside the `src/pages/` directory according to global repo guidelines.
- **Fix**: Move the file to `src/pages/LoginPage.tsx`.
- **Decision**: FIXED

### F7 — Domain model imported from theme types

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: DealHunter.Web/src/features/rules/api/rulesApi.ts:2
- **Detail**: The domain model `RuleItem` is imported from `shared/types/theme`. Domain logic should not be mixed with theme or purely UI-related type files.
- **Fix**: Move the `RuleItem` interface to a domain-specific folder like `src/shared/types/models.ts`.
- **Decision**: FIXED
