# Lessons Learned & Architecture Patterns

This document records recurring architectural patterns, workflow constraints, and lessons learned for DealHunter.

## Workflow & Git Constraints

- **No Direct Commits to Main**: All work must be performed on a dedicated feature branch. Never commit or push directly to `main`. The user manages PRs on the remote repository.
- **Explicit Commit Approval**: Never execute a `git commit` or `git push` command without explicit approval from the user.
- **Plan First**: Always propose a detailed plan of action and receive explicit approval from the user before executing file edits or major commands.

## Architecture Guidelines (Clean Architecture)

- **Domain Layer (`DealHunter.Domain`)**: Pure domain models, value objects, domain interfaces, and domain events. No external framework dependencies.
- **Application Layer (`DealHunter.Application`)**: Use cases, MediatR commands/queries, DTOs, interfaces for external services (parsers, notifications). Depends only on Domain.
- **Infrastructure Layer (`DealHunter.Infrastructure`)**: External service implementations (OLX HTML parser, Telegram Bot client, EF Core DB, Polly policies). Depends on Application.
- **API/Host Layer (`DealHunter.Api`)**: ASP.NET Core controllers, BackgroundWorker service (`IHostedService`), dependency injection setup.
