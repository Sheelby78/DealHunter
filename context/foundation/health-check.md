# Project Health Check

**Project:** DealHunter
**Status:** needs-attention

## Overview

- **Pre-check**: No lockfile detected. Audit: 0 CRITICAL, 1 HIGH, 0 MODERATE, 0 LOW. Outdated: skipped.
- **In-check**: test runner detected (dotnet CLI, 42 tests found), CI GitHub detected. Stages: lint ✗, test ✓, build ✓, type-check ✓, security ✗. 2 configuration gaps (0 high, 0 medium, 2 low).

## Category A — Fix before AI assistant work

1. **Missing lockfile**
   - **Impact**: Dependency versions are not pinned. Non-reproducible builds undermine AI assistant reliability, as the assistant cannot reason about exact dependency state.
   - **Fix**: Run `dotnet restore --use-lock-file` to generate a `packages.lock.json` file.
   - **Effort**: quick (< 5 min)

2. **High audit finding**
   - **Impact**: Security vulnerability in transitive dependency `SQLitePCLRaw.lib.e_sqlite3` (v2.1.10). Vulnerabilities should be addressed before AI-assisted work touches affected code paths.
   - **Fix**: Review and update EF Core or SQLite packages (e.g., `Microsoft.Data.Sqlite` or `Microsoft.EntityFrameworkCore.Sqlite`) to a patched version, or explicitly accept the risk if acceptable for MVP.
   - **Effort**: moderate (15–30 min)

3. **Missing .editorconfig**
   - **Impact**: Lack of consistent formatting rules might lead to the AI assistant generating code with inconsistent styles (e.g., tabs vs spaces).
   - **Fix**: Create a standard `.editorconfig` file in the root directory.
   - **Effort**: quick (< 5 min)

4. **Missing .env.example / configuration templates**
   - **Impact**: Missing environment variable documentation makes local setup harder for both humans and agents.
   - **Fix**: Create a `.env.example` (or `appsettings.Development.json` template) documenting required configurations (like Telegram tokens).
   - **Effort**: quick (< 5 min)

## Category B — Addressed in upcoming lessons

- **Missing security and lint steps in CI pipeline**
  - **Impact**: The current GitHub Actions pipeline builds and tests the code but lacks dedicated linting and security scanning stages.
  - **Fix**: You'll expand your CI/CD setup in an upcoming lesson (e.g., [Sprint Zero z Agentem: infrastruktura, walking skeleton i pierwszy deploy (M1L5)](https://platforma.przeprogramowani.pl/external/10xdevs-3/m1-l5)). For now, local test coverage and manual audits are sufficient.
  - **Effort**: upcoming lesson
