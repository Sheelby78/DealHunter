# Initial Offers Baseline (Warmup Mode) Implementation Plan

## Overview

Implement an initial baseline / warmup mode for newly added search rules in DealHunter. When a new `SearchRule` is processed for the first time, all existing offers currently returned on the OLX page are seeded into `ProcessedOfferRepository` as a baseline without dispatching Telegram notifications. Subsequent cycles will only alert on newly published offers, eliminating initial chat spam.

## Current State Analysis

- When a new `SearchRule` is added and processed for the first time by `ProcessOffersCommandHandler`, `_processedOfferRepository.FilterExistingOfferIdsAsync` returns an empty set.
- As a result, all 40-50 existing listings on the scraped OLX page are treated as new offers, triggering 40-50 individual Telegram notification alerts immediately after adding a rule.
- `SearchRule` entity currently lacks tracking for whether initial baseline seeding has completed.

## Desired End State

- `SearchRule` tracks whether initial baseline initialization has completed (`IsInitialized` flag, default `false`).
- On a rule's first execution cycle (`!rule.IsInitialized`), all extracted offers matching `MaxPrice` criteria are saved to `ProcessedOfferRepository` via `AddRangeAsync`, `rule.MarkInitialized()` is called, and `SearchRuleRepository.UpdateAsync(rule)` persists the state. **Zero Telegram alerts are sent.**
- On subsequent execution cycles (`rule.IsInitialized == true`), normal incremental processing takes place, sending Telegram alerts exclusively for newly published offers.
- EF Core migration adds `IsInitialized` column to `SearchRules` table in SQLite DB.
- Comprehensive unit tests verify initial baseline seeding without notifications and subsequent alert dispatch for new offers.

### Key Discoveries

- `DealHunter.Domain/Entities/SearchRule.cs`: Domain entity representing a search rule.
- `DealHunter.Domain/Repositories/ISearchRuleRepository.cs` & `IProcessedOfferRepository.cs`: Data access contracts.
- `DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommandHandler.cs`: Core offer processing logic.

## What We're NOT Doing

- We are not altering Telegram bot user commands (`/add`, `/list`, `/delete`).
- We are not changing the deduplication logic or notification format for subsequent runs.

## Implementation Approach

1. **Domain & Data Access Layer**: Add `IsInitialized` property and `MarkInitialized()` method to `SearchRule`. Add `UpdateAsync` to `ISearchRuleRepository` and `AddRangeAsync` to `IProcessedOfferRepository`.
2. **Persistence & EF Core Migration**: Implement `UpdateAsync` and `AddRangeAsync` in Infrastructure repositories. Add EF Core Migration `AddIsInitializedToSearchRule`.
3. **Application Handler Logic**: Update `ProcessOffersCommandHandler` to check `rule.IsInitialized`. If false, seed offers into DB, mark rule initialized, and skip Telegram alert dispatch.
4. **Unit Testing & Verification**: Update unit tests in `DealHunter.Tests` to verify baseline seeding behavior and subsequent notification triggering.

## Critical Implementation Details

- **Atomic Baseline Seeding**: On initial run, `AddRangeAsync` persists all baseline offers in a single batch transaction. `MarkInitialized()` is persisted afterwards so failures during scraping allow a clean retry on the next cycle.
- **Backward Compatibility**: Any pre-existing `SearchRule` records in existing databases will have `IsInitialized = true` (or defaulted cleanly) after migration to avoid re-seeding established rules.

## Implementation Phases

### Phase 1: Domain Entity & Repository Contracts

- Update `SearchRule` in `DealHunter.Domain/Entities/SearchRule.cs`:
  - Add property `public bool IsInitialized { get; private set; }`.
  - Add method `public void MarkInitialized()`.
  - Update `SearchRule` constructor and factory method `Create(...)` (default `IsInitialized` to `false`).
- Update `ISearchRuleRepository` in `DealHunter.Domain/Repositories/ISearchRuleRepository.cs`:
  - Add method `Task UpdateAsync(SearchRule rule, CancellationToken cancellationToken = default);`.
- Update `IProcessedOfferRepository` in `DealHunter.Domain/Repositories/IProcessedOfferRepository.cs`:
  - Add method `Task AddRangeAsync(IEnumerable<ProcessedOffer> offers, CancellationToken cancellationToken = default);`.

### Phase 2: Persistence, Repositories & EF Core Migration

- Implement `UpdateAsync` in `DealHunter.Infrastructure/Persistence/Repositories/SearchRuleRepository.cs`.
- Implement `AddRangeAsync` in `DealHunter.Infrastructure/Persistence/Repositories/ProcessedOfferRepository.cs`.
- Create EF Core Migration `AddIsInitializedToSearchRule` in `DealHunter.Infrastructure` using `dotnet ef migrations add`.

### Phase 3: Application Process Handler Logic

- Update `ProcessOffersCommandHandler` in `DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommandHandler.cs`:
  - Check `if (!rule.IsInitialized)` during rule loop.
  - If uninitialized:
    - Extract matching offers.
    - Save all matching offers to `_processedOfferRepository.AddRangeAsync(...)`.
    - Call `rule.MarkInitialized()` and `await _searchRuleRepository.UpdateAsync(rule, cancellationToken)`.
    - Do NOT call `_telegramNotificationService.SendOfferAlertAsync`.
  - If initialized:
    - Execute existing incremental deduplication and notification pipeline.

### Phase 4: Unit & Integration Testing

- Update `ProcessOffersCommandHandlerTests.cs` in `DealHunter.Tests/Unit/Offers/`:
  - Add test `Handle_UninitializedRule_SeedsBaselineWithoutSendingNotifications`.
  - Add test `Handle_InitializedRule_SendsNotificationsForNewOffersOnly`.
- Run full test suite (`dotnet test DealHunter.slnx`) and verify clean pass.

## Verification Plan

### Automated Tests
- Execute `dotnet test DealHunter.slnx` to verify 100% test pass rate.

### Manual Verification
- Launch application via `dotnet run --project DealHunter.Api`.
- Add a new rule via Telegram or test script, observe logs confirming baseline initialization without chat notification flood.

---

## Progress

### Automated Progress
- [x] Phase 1: Domain Entity & Repository Contracts — pending
- [x] Phase 2: Persistence, Repositories & EF Core Migration — pending
- [ ] Phase 3: Application Process Handler Logic — pending
- [ ] Phase 4: Unit & Integration Testing — pending

### Manual Progress
