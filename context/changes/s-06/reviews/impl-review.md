<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Pełne Zarządzanie (Dodawanie / Usuwanie)

- **Plan**: context/changes/s-06/plan.md
- **Scope**: Phase 1, 2, 3 of 3
- **Date**: 2026-07-23
- **Verdict**: REJECTED
- **Findings**: 2 critical 2 warnings 1 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | WARNING |
| Safety & Quality | FAIL |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

## Findings

### F1 — `loadEnv` ReferenceError in Vite config

- **Severity**: ❌ CRITICAL
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: DealHunter.Web/vite.config.ts:6
- **Detail**: `loadEnv` is invoked but not imported from `vite`. This will cause a `ReferenceError` at runtime, completely breaking the frontend build and dev server.
- **Fix**: Update the import statement to include `loadEnv`: `import { defineConfig, loadEnv } from 'vite';`.
- **Decision**: FIXED

### F2 — Excessively permissive CORS policy

- **Severity**: ❌ CRITICAL
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: DealHunter.Api/Program.cs:17-25
- **Detail**: The CORS policy uses `AllowAnyOrigin()`, `AllowAnyMethod()`, and `AllowAnyHeader()`. This excessively permissive configuration allows any website to make cross-origin requests to the API, unnecessarily expanding the attack surface.
- **Fix**: Restrict the CORS policy to specific frontend origins or remove if a proxy is exclusively used.
- **Decision**: FIXED

### F3 — Unplanned backend API modifications

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Scope Discipline
- **Location**: DealHunter.Api/Controllers/RulesController.cs
- **Detail**: The developer modified the backend to use `configuration.GetValue<long>("Telegram:ChatId")` instead of `PanelOptions.AdminChatId`, contrary to the plan stating "We are not redesigning the API".
- **Fix A ⭐ Recommended**: Document the changes in the plan as an addendum
  - Strength: Preserves the implemented unified Chat ID work which improves configuration.
  - Tradeoff: Plan becomes a slightly moving target.
  - Confidence: HIGH — addendum pattern used regularly here.
  - Blind spot: Original stakeholders weren't notified.
- **Fix B**: Revert backend changes
  - Strength: Keeps scope discipline strict.
  - Tradeoff: Loses potentially valuable refactoring.
  - Confidence: MEDIUM — depends on callers.
  - Blind spot: Haven't checked for callers.
- **Decision**: FIXED

### F4 — Missing `_chatId` validation

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: DealHunter.Api/Controllers/RulesController.cs:24
- **Detail**: `_chatId` is parsed using `configuration.GetValue<long>("Telegram:ChatId")`. If missing, it silently defaults to `0`, causing downstream failures without clear startup errors.
- **Fix**: Add validation in the constructor to check if `_chatId == 0` and throw an `InvalidOperationException`.
- **Decision**: FIXED

### F5 — Unnecessary tutorial-style comments

- **Severity**: 📝 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: DealHunter.Tests/Unit/Api/Controllers/RulesControllerTests.cs:76, DealHunter.Web/src/pages/Dashboard.tsx:170
- **Detail**: Contains obvious inline comments (`// Ensure NSubstitute setup if needed`, `/* Loading Skeletons */`) which violates the clean documentation rules in `lessons.md`.
- **Fix**: Remove the unnecessary comments to keep the codebase clean and self-documenting.
- **Decision**: FIXED
