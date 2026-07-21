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
- Code should be strongly typed and self-documenting. Avoid adding unnecessary code comments; write explanations in English only if essential.

## Commit & Pull Request Guidelines

- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` (e.g. `feat(infra): add olx html parser implementation`).
