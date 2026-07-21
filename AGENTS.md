# Repository Guidelines

DealHunter is an automated C# / .NET 10.0 application designed to monitor online classified ad portals (such as OLX.pl) for new deal listings and send instant notifications via Telegram.

## Hard Rules

- Always read `@context/foundation/prd.md` before making product-level decisions or starting new features.
- Consult `@context/foundation/tech-stack.md` for architectural constraints and technology choices.
- **CRITICAL / STOP**: You MUST use your file reading tool to read `context/foundation/lessons.md` BEFORE starting ANY implementation, planning, or debugging. Do not write a single line of code or propose any fixes until you have verified the patterns and past mistakes documented there.
- Do not modify files in `context/archive/`. Archived changes are immutable.

## Project Structure & Module Organization

- **`DealHunter.Api/`** — Core ASP.NET Core Web API application containing controllers, MediatR command handlers, Telegram bot integration, and background worker services.
- **`context/`** — Project documentation managed by the 10xDevs AI workflow:
  - `foundation/` — Core specifications (`prd.md`, `tech-stack.md`, `shape-notes.md`).
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

- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` (e.g. `feat(api): add telegram notification handler`).
