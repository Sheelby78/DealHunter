# Repository Guidelines

DealHunter is an automated C# / .NET 10.0 application designed to monitor online classified ad portals (such as OLX.pl) for new deal listings and send instant notifications via Telegram.

## Hard Rules

- **NEVER COMMIT OR PUSH TO MAIN**: Always work on a separate feature branch. Never commit or push directly to `main`. Pull requests on the remote repository are created solely by the user.
- **EXPLICIT COMMIT APPROVAL REQUIRED**: Never run `git commit` or `git push` without explicit approval from the user.
- **PLAN FIRST, ACT SECOND**: Always present a detailed implementation plan first and wait for explicit user approval before executing file modifications or writing code.
- Always read `@context/foundation/prd.md` before making product-level decisions or starting new features.
- Consult `@context/foundation/tech-stack.md` for architectural constraints and technology choices.
- **CRITICAL / STOP**: You MUST use your file reading tool to read `context/foundation/lessons.md` BEFORE starting ANY implementation, planning, or debugging. Do not write a single line of code or propose any fixes until you have verified the patterns and past mistakes documented there.
- Do not modify files in `context/archive/`. Archived changes are immutable.

## Project Structure & Module Organization

The solution follows **Clean Architecture** principles decoupled into distinct layer projects:

- **`DealHunter.Domain/`** — Core domain entities (e.g. `Offer`, `SearchRule`), Value Objects, Domain Events, and Repository/Service Interfaces. Zero framework dependencies.
- **`DealHunter.Application/`** — Use cases, MediatR commands & queries (`ProcessOffersCommand`, `AddRuleCommand`), DTOs, and interface contracts for external services (parsers, notifications). Depends only on `DealHunter.Domain`.
- **`DealHunter.Infrastructure/`** — Implementations of external services: HTML parsers (OLX), Telegram Bot API client, database context / repositories, and Polly retry policies. Depends on `DealHunter.Application`.
- **`DealHunter.Api/`** — ASP.NET Core Web API controllers, Background Worker service (`IHostedService`), and Dependency Injection composition root (`Program.cs`). Depends on `DealHunter.Application` and `DealHunter.Infrastructure`.
- **`context/`** — Project documentation managed by the 10xDevs AI workflow:
  - `foundation/` — Core specifications (`prd.md`, `tech-stack.md`, `shape-notes.md`, `lessons.md`).
  - `changes/` — Active implementation plans and bootstrap verification logs.
  - `archive/` — Completed, immutable records of past implementation plans.

## Build and Development Commands

- **Build solution**: `dotnet build DealHunter.slnx`
- **Run Web API**: `dotnet run --project DealHunter.Api`
- **Run tests**: `dotnet test DealHunter.slnx`

## Coding Style & Naming Conventions

- Follow standard C# naming conventions: `PascalCase` for classes, interfaces, methods, and properties; `camelCase` for parameters and private fields.
- Code should be strongly typed and self-documenting. **NEVER add unnecessary code comments**, obvious inline comments, or tutorial-style explanations. Only explain exceptionally complex domain algorithms if absolutely required.

## Commit & Pull Request Guidelines

- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` (e.g. `feat(infra): add olx html parser implementation`).

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 3, Lesson 4 (E2E Tests)

**For E2E tests, use the `/10x-e2e` skill.** It is the single source of truth
for the workflow — risk → seed test + rules → generate → review against the five
anti-patterns → re-prompt → verify. The skill's `references/` carry the full
rules, anti-patterns, seed pattern, and prompt-template.

A few hard rules that hold even before you invoke the skill:

- **Locators:** `getByRole` / `getByLabel` / `getByText` first; `getByTestId`
  only when accessibility attributes are ambiguous. Never CSS selectors, XPath,
  or DOM structure.
- **Never `page.waitForTimeout()`.** Wait for state: `toBeVisible()`,
  `waitForURL()`, `waitForResponse()`.
- **Test independence + cleanup.** Each test runs standalone — its own setup,
  action, assertion, and cleanup; unique ids (timestamp suffix) so parallel runs
  and re-runs don't collide.

Two boundaries to keep straight:

- **DOM (snapshot) is the default.** Vision (`--caps=vision`) is a supplement for
  visual-only risks (layout, z-index, animation); for pixel regression prefer
  deterministic tools (`toMatchSnapshot`, Argos, Lost Pixel). VLM model
  selection/cost is a debugging topic (Lesson 5), not testing.
- **Healer helps on selectors, harms on logic.** A changed selector → healer
  re-finds it (route through PR review). A changed business behavior → healer
  masks the bug; that failing-test-to-fix case is Lesson 5.

<!-- END @przeprogramowani/10x-cli -->
