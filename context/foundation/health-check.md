---
project: DealHunter
checked_at: 2026-07-26T12:44:45Z
health_status: critical-issues
context_type: brownfield
language_family: multi
stack_assessment_available: true
checks_run:
  - lockfile
  - dependency_audit
  - outdated_deps
  - test_runner
  - ci_cd
  - configuration
audit_findings:
  critical: 1
  high: 34
  moderate: 8
  low: 3
test_runner_detected: true
ci_provider: GitHub Actions
recommended_fixes: 5
---

## Dependency Health

### Lockfile
Status: present (packages.lock.json for .NET, package-lock.json for JS/TS)
Package manager: dotnet, npm

### Security Audit
Tool: dotnet list package --vulnerable --include-transitive (in C# root) and npm audit --json (in DealHunter.Web)
Summary: 1 CRITICAL, 34 HIGH, 8 MODERATE, 3 LOW
Direct vs transitive: .NET projects have 0 vulnerabilities. In JS/TS (DealHunter.Web), all 46 findings are in devDependencies / transitive build tools (e.g., @angular/cli, @angular-devkit/build-angular, vite).

#### CRITICAL findings

- **tar** <=7.5.20 — GHSA-34x7-hfp2-rc4v: node-tar Vulnerable to Arbitrary File Creation/Overwrite via Hardlink Path Traversal (and 11 other advisories). Fix: run `npm audit fix --force` or update `@angular/cli` to a patched version.

#### HIGH findings

- **vite** <=6.4.2 — GHSA-fx2h-pf6j-xcff: `server.fs.deny` bypass on Windows alternate paths. Fix: update `@angular-devkit/build-angular` or run `npm audit fix --force`.
- **serialize-javascript** <=7.0.4 — GHSA-5c6j-r48x-rmvq: Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString(). Fix: update `@angular-devkit/build-angular`.
- **postcss** <=8.5.17 — GHSA-r28c-9q8g-f849: Path Traversal in Previous Source Map Auto-Loading. Fix: update `@angular-devkit/build-angular`.
- **piscina** <=4.9.2 — GHSA-x9g3-xrwr-cwfg: Prototype Pollution Gadget → RCE via inherited options.filename. Fix: update `@angular-devkit/build-angular`.
- **http-proxy-middleware** 3.0.0 - 3.0.6 — GHSA-gcq2-9pq2-cxqm: multipart/form-data field injection via unescaped CRLF in fixRequestBody. Fix: update `@angular-devkit/build-angular`.
- **brace-expansion** <=5.0.7 — GHSA-mh99-v99m-4gvg: DoS via unbounded expansion length causing an out-of-memory process crash. Fix: update `@angular/cli`.
- **ts-morph** 10.0.2 - 25.0.1 — GHSA-patch: vulnerable via `@ts-morph/common`. Fix: update `@analogjs/vite-plugin-angular`.
- **tuf-js** <=4.0.0 — GHSA-patch: vulnerable via make-fetch-happen. Fix: update `@angular/cli`.

MODERATE and LOW findings: 8 moderate findings across `uuid`, `tar`, `webpack-dev-server`, and `launch-editor`; 3 low findings in transitive build dependencies.

### Outdated Dependencies
Packages with major version gaps: 22
- **@angular/cli**: 19.2.27 → 22.0.8 (3 major versions behind in DealHunter.Web)
- **@angular/core** (and related Angular packages): 19.2.25 → 22.0.8 (3 major versions behind in DealHunter.Web)
- **vite**: 6.4.3 → 8.1.5 (2 major versions behind in DealHunter.Web)
- **typescript**: 5.7.3 → 7.0.2 (2 major versions behind in DealHunter.Web)
- **@types/jsdom**: 21.1.7 → 28.0.3 (7 major versions behind in DealHunter.Web)
- **jsdom**: 26.1.0 → 29.1.1 (3 major versions behind in DealHunter.Web)
- **Swashbuckle.AspNetCore**: 7.2.0 → 10.2.3 (3 major versions behind in DealHunter.Api)

## Test Suite

Test runner: dotnet test (xUnit) and vitest
Tests found: 64 tests across 4 test files (.NET: 55 tests in 1 project; JS/TS: 9 tests in 3 files)
Test execution: passing

Configuration: DealHunter.Tests/DealHunter.Tests.csproj (for .NET) and DealHunter.Web/vitest.config.ts (for JS/TS)
Framework: xUnit (net10.0) and Vitest v3.2.7

## CI/CD

Provider: GitHub Actions
Configuration: .github/workflows/ci.yml

| Stage      | Status | Notes                                      |
|------------|--------|--------------------------------------------|
| Lint       | ✗      | not configured                             |
| Test       | ~      | dotnet test configured; vitest not configured |
| Build      | ~      | dotnet build configured; ng/vite build not configured |
| Type check | ~      | implicit in dotnet build; tsc not configured |
| Security   | ✗      | not configured                             |

## Configuration

### Medium severity

- **DealHunter.Web (linter/formatter)** — No ESLint, Biome, or Prettier configuration found in the frontend project. Inconsistent formatting and code quality rules can lead to noisy AI agent diffs. Fix: configure ESLint and Prettier (or Biome) in DealHunter.Web.

All other expected configuration files (.editorconfig, .gitignore, tsconfig.json with strict: true, lockfiles) are present.

## Stack Assessment Cross-Reference

Stack assessment: context/foundation/stack-assessment.md
Agent readiness (from stack-assess): ready

| Quality Gate Gap | Health-Check Finding | Status |
|------------------|----------------------|--------|
| None identified for backend | 1 CRITICAL and 34 HIGH vulnerabilities in new frontend build tools (DealHunter.Web) | New risk in extended stack |
| None identified for backend | CI pipeline (.github/workflows/ci.yml) does not execute tests or build for DealHunter.Web | New gap in extended stack |

## Recommended Fixes

### Fix before agent work (Category A)

### 1. Critical security vulnerability in frontend devDependencies

**Impact**: Transitive dependency `tar` (<=7.5.20) in `DealHunter.Web` has arbitrary file creation/overwrite vulnerabilities. While isolated to build/CLI tools, critical vulnerabilities should be resolved before AI agents interact with package installations or build pipelines.
**Severity**: critical
**Effort**: moderate (15–30 min)
**Fix**:

```bash
cd DealHunter.Web
npm audit fix --force
```

### 2. High security vulnerabilities in frontend build tools

**Impact**: 34 high severity findings across Vite, PostCSS, Serialize-JavaScript, and related Angular build dependencies in `DealHunter.Web`. Unpatched dev tools can pose risks during automated execution and local dev server runs.
**Severity**: high
**Effort**: moderate (15–30 min)
**Fix**:

```bash
cd DealHunter.Web
npm update @angular/cli @angular-devkit/build-angular @analogjs/vite-plugin-angular --save-dev
```

### 3. Missing frontend linter and formatter configuration

**Impact**: `DealHunter.Web` lacks an ESLint or Prettier setup. Without automated code styling rules, AI-generated code will introduce formatting drift and inconsistent style patterns across Angular components.
**Severity**: medium
**Effort**: quick (< 5 min)
**Fix**:

```bash
cd DealHunter.Web
npm install --save-dev prettier eslint @angular-eslint/builder @angular-eslint/eslint-plugin @angular-eslint/template-parser
```

### Addressed in upcoming lessons (Category B)

### 4. Missing frontend CI/CD integration, linting, and security scan stages

**Lesson**: [Sprint Zero z Agentem: infrastruktura, walking skeleton i pierwszy deploy (M1L5)](https://platforma.przeprogramowani.pl/external/10xdevs-3/m1-l5)
**What you'll do there**: You will expand your GitHub Actions pipeline (`ci.yml` / `cd.yml`) to include automated building and Vitest test execution for `DealHunter.Web`, along with dedicated security scanning and linting stages.

### 5. Frontend-specific AI rules and feedback loops

**Lesson**: [Agent Onboarding: Agents.md, AI Rules i feedback loops (M1L4)](https://platforma.przeprogramowani.pl/external/10xdevs-3/m1-l4)
**What you'll do there**: You will extend `AGENTS.md` with frontend-specific architectural rules, Angular component conventions, and UI testing guidelines so AI coding assistants can work seamlessly across the full-stack codebase.

## Summary

Health status: critical-issues

DealHunter's .NET 10.0 backend remains in excellent health: all 5 projects have NuGet lockfiles, 0 security vulnerabilities, and 55 unit tests passing cleanly. However, the newly introduced Angular frontend (`DealHunter.Web`) introduces 1 CRITICAL and 34 HIGH security vulnerabilities in its npm build toolchain, lacks a configured linter/formatter, and is currently omitted from the GitHub Actions CI pipeline. While all 9 frontend unit tests pass locally, the dependency vulnerabilities and missing CI coverage present operational risks that need attention.

Next step: Address the critical and high-priority npm package fixes in Category A to secure the frontend build toolchain, then proceed to agent onboarding where you will extend the AI rules to cover the full-stack architecture.
