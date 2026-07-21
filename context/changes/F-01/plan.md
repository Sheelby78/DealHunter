# F-01: Core Architecture & PostgreSQL Persistence Implementation Plan

## Overview

Establish the foundational Clean Architecture layers and database persistence for DealHunter using PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`). This change introduces domain models (`SearchRule`, `ProcessedOffer`), repository abstractions, EF Core DbContext, MediatR CQRS pipeline, startup database migrations, and an automated integration test suite in `DealHunter.Tests` powered by `Testcontainers.PostgreSql`.

## Current State Analysis

- The solution contains four empty/template C# projects: `DealHunter.Domain`, `DealHunter.Application`, `DealHunter.Infrastructure`, `DealHunter.Api`.
- No database ORM, migration scripts, or MediatR dependencies are configured.
- No unit or integration test projects currently exist in `DealHunter.slnx`.

## Desired End State

1. **Domain Layer**: Strongly-typed `SearchRule` and `ProcessedOffer` entities in `DealHunter.Domain`, with repository interfaces `ISearchRuleRepository` and `IProcessedOfferRepository`.
2. **Application Layer**: MediatR registered, DTOs defined, and Dependency Injection extensions (`AddApplicationServices`) ready for commands/queries.
3. **Infrastructure Layer**: `DealHunterDbContext` configured with EF Core PostgreSQL entity mappings, repository implementations, EF Core migration generated, and `AddInfrastructureServices` extension method.
4. **API Host**: Connection string configured in `appsettings.json`, DI container wired in `Program.cs`, and `Database.MigrateAsync()` executed at application startup.
5. **Testing Baseline**: `DealHunter.Tests` project created and added to `DealHunter.slnx`, using `Testcontainers.PostgreSql`, `xunit`, `FluentAssertions`, and `NSubstitute` to verify DbContext migrations and repository operations against a real PostgreSQL container.

## What We're NOT Doing

- Implementing OLX HTML parsing logic (scoped to S-01).
- Implementing Telegram Bot API integration or command handlers (scoped to S-01 / S-02).
- Implementing Polly retry policies or rate limiting middleware (scoped to S-03).
- Writing GitHub Actions deployment workflows (scoped to S-04).

## Implementation Approach

Follow Clean Architecture boundaries without layer leakage:
- `DealHunter.Domain`: Zero external NuGet dependencies. Defines core entities and interfaces.
- `DealHunter.Application`: Depends only on `DealHunter.Domain`. References `MediatR`.
- `DealHunter.Infrastructure`: Depends on `DealHunter.Application` & `DealHunter.Domain`. References `Npgsql.EntityFrameworkCore.PostgreSQL` and `Microsoft.EntityFrameworkCore.Tools`.
- `DealHunter.Api`: References `DealHunter.Application` & `DealHunter.Infrastructure`. Composes DI root and manages startup lifecycle.
- `DealHunter.Tests`: Integration tests run real PostgreSQL database migrations via Testcontainers.

## Critical Implementation Details

- **Strongly Typed IDs & Offsets**: `SearchRule` uses `Guid Id` as primary key. `ProcessedOffer` uses `string OfferId` (external ID from OLX) as primary key with a foreign key to `SearchRule.Id`. All timestamp properties use `DateTimeOffset` (UTC).
- **PostgreSQL Migration Tooling**: Use `Npgsql.EntityFrameworkCore.PostgreSQL` version `9.0.*` or compatible with `.NET 10.0`.
- **Test Isolation**: `DealHunter.Tests` uses `Testcontainers.PostgreSql` container fixture to ensure tests run against a real PostgreSQL instance without relying on local DB installations.

---

## Proposed Changes

### Phase 1: Domain Models & Repository Interfaces (`DealHunter.Domain`)

- Create `DealHunter.Domain/Entities/SearchRule.cs`:
  - Properties: `Guid Id`, `long ChatId`, `string Url`, `decimal? MaxPrice`, `bool IsActive`, `DateTimeOffset CreatedAt`.
  - Methods: Factory method `Create(long chatId, string url, decimal? maxPrice)`, `Deactivate()`.
- Create `DealHunter.Domain/Entities/ProcessedOffer.cs`:
  - Properties: `string OfferId`, `Guid RuleId`, `string Title`, `decimal Price`, `string OfferUrl`, `string? ImageUrl`, `DateTimeOffset ProcessedAt`.
- Create `DealHunter.Domain/Repositories/ISearchRuleRepository.cs`:
  - Methods: `Task AddAsync(SearchRule rule, CancellationToken cancellationToken = default)`, `Task<SearchRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)`, `Task<IReadOnlyList<SearchRule>> GetAllActiveAsync(CancellationToken cancellationToken = default)`, `Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)`.
- Create `DealHunter.Domain/Repositories/IProcessedOfferRepository.cs`:
  - Methods: `Task AddAsync(ProcessedOffer offer, CancellationToken cancellationToken = default)`, `Task<bool> ExistsAsync(string offerId, CancellationToken cancellationToken = default)`, `Task<IReadOnlyList<string>> FilterExistingOfferIdsAsync(IEnumerable<string> offerIds, CancellationToken cancellationToken = default)`.

### Phase 2: Application Layer Setup & MediatR (`DealHunter.Application`)

- Add `MediatR` (v12.*) package to `DealHunter.Application.csproj`.
- Create `DealHunter.Application/DependencyInjection.cs`:
  - Method: `public static IServiceCollection AddApplicationServices(this IServiceCollection services)`.
- Create placeholder DTOs: `SearchRuleDto`, `OfferDto`.

### Phase 3: Infrastructure EF Core PostgreSQL & Repositories (`DealHunter.Infrastructure`)

- Add `Npgsql.EntityFrameworkCore.PostgreSQL` and `Microsoft.EntityFrameworkCore.Tools` to `DealHunter.Infrastructure.csproj`.
- Create `DealHunter.Infrastructure/Persistence/DealHunterDbContext.cs`:
  - `DbSet<SearchRule> SearchRules => Set<SearchRule>();`
  - `DbSet<ProcessedOffer> ProcessedOffers => Set<ProcessedOffer>();`
- Create Entity Configurations in `DealHunter.Infrastructure/Persistence/Configurations/`:
  - `SearchRuleConfiguration`: Primary key `Id`, index on `IsActive`, URL required.
  - `ProcessedOfferConfiguration`: Primary key `OfferId`, foreign key `RuleId`.
- Create Repositories in `DealHunter.Infrastructure/Persistence/Repositories/`:
  - `SearchRuleRepository`: Implements `ISearchRuleRepository`.
  - `ProcessedOfferRepository`: Implements `IProcessedOfferRepository`.
- Create `DependencyInjection.cs` in `DealHunter.Infrastructure`:
  - Method: `public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)`.
- Generate Initial EF Core Migration (`InitialCreate`).

### Phase 4: API Composition Root & Startup Migration (`DealHunter.Api`)

- Update `appsettings.json` with `ConnectionStrings:DefaultConnection` (PostgreSQL string).
- Update `DealHunter.Api/Program.cs`:
  - Wire `builder.Services.AddApplicationServices()` and `builder.Services.AddInfrastructureServices(builder.Configuration)`.
  - Add startup migration execution: `await using (var scope = app.Services.CreateAsyncScope()) { var db = scope.ServiceProvider.GetRequiredService<DealHunterDbContext>(); await db.Database.MigrateAsync(); }`.

### Phase 5: Test Suite Setup & Integration Tests (`DealHunter.Tests`)

- Create `DealHunter.Tests/DealHunter.Tests.csproj` targeting `net10.0`.
- Add packages: `Microsoft.NET.Test.Sdk`, `xunit`, `xunit.runner.visualstudio`, `FluentAssertions`, `NSubstitute`, `Testcontainers.PostgreSql`, `Microsoft.EntityFrameworkCore.Design`.
- Add `DealHunter.Tests.csproj` to `DealHunter.slnx`.
- Create `DealHunter.Tests/Fixtures/PostgresContainerFixture.cs`:
  - Manages lifecycle of `PostgreSqlContainer` (`IAsyncLifetime`).
- Create `DealHunter.Tests/Integration/Repositories/SearchRuleRepositoryTests.cs`:
  - Tests `AddAsync`, `GetByIdAsync`, `GetAllActiveAsync`, `DeleteAsync` against live container.
- Create `DealHunter.Tests/Integration/Repositories/ProcessedOfferRepositoryTests.cs`:
  - Tests `AddAsync`, `ExistsAsync`, `FilterExistingOfferIdsAsync`.

---

## Verification Plan

### Automated Tests
- Run solution build: `dotnet build DealHunter.slnx`
- Run integration tests: `dotnet test DealHunter.slnx`
- Verify all tests pass with zero failures.

### Manual Verification
- Start API: `dotnet run --project DealHunter.Api` (with local/container PostgreSQL running) and verify database migration applies cleanly on startup without exceptions.

---

## Progress

### Phase 1: Domain Models & Repository Interfaces
- [x] 1.1 Domain Entities (`SearchRule`, `ProcessedOffer`)
- [x] 1.2 Repository Interfaces (`ISearchRuleRepository`, `IProcessedOfferRepository`)

### Phase 2: Application Layer Setup & MediatR
- [x] 2.1 MediatR NuGet package & `AddApplicationServices` DI setup
- [x] 2.2 DTO abstractions (`SearchRuleDto`, `OfferDto`)

### Phase 3: Infrastructure EF Core PostgreSQL & Repositories
- [x] 3.1 Npgsql EF Core packages & `DealHunterDbContext` setup
- [x] 3.2 EF Entity Configurations & Repository Implementations
- [x] 3.3 Initial EF Core Migration (`InitialCreate`)

### Phase 4: API Composition Root & Startup Migration
- [x] 4.1 Connection String & DI Wiring in `Program.cs`
- [x] 4.2 Startup `Database.MigrateAsync()` execution

### Phase 5: Test Suite Setup & Integration Tests
- [x] 5.1 Create `DealHunter.Tests` with `Testcontainers.PostgreSql`
- [x] 5.2 Integration Tests for Repositories & Migrations

