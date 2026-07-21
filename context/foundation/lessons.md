# Lessons Learned & Architecture Patterns

This document records recurring architectural patterns, past mistakes, and rules to follow for DealHunter.

## Architecture Guidelines (Clean Architecture)

- **Domain Layer (`DealHunter.Domain`)**: Pure domain models, value objects, domain interfaces, and domain events. No external framework dependencies.
- **Application Layer (`DealHunter.Application`)**: Use cases, MediatR commands/queries, DTOs, interfaces for external services (parsers, notifications). Depends only on Domain.
- **Infrastructure Layer (`DealHunter.Infrastructure`)**: External service implementations (OLX HTML parser, Telegram Bot client, EF Core DB, Polly policies). Depends on Application.
- **API/Host Layer (`DealHunter.Api`)**: ASP.NET Core controllers, BackgroundWorker service (`IHostedService`), dependency injection setup.
