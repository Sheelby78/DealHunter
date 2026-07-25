# Guaranteed Notification Delivery & Deduplication Implementation Plan

## Overview

Eliminate duplicate Telegram offer alerts and ensure zero missed notifications by introducing a two-phase delivery tracking system. New offers are saved to the database upon discovery before notification, and notification success updates a `NotifiedAt` timestamp. Additionally, `TelegramNotificationService` photo fallback is updated to only send text fallbacks when Telegram explicitly rejects the photo URL.

## Current State Analysis

- `ProcessOffersCommandHandler` sends Telegram notifications *before* saving `ProcessedOffer` entities to the database via `_processedOfferRepository.AddAsync`.
- If `AddAsync` fails or an error occurs during alert dispatch, the offer remains un-persisted and is re-notified on the next polling cycle.
- `TelegramNotificationService.SendOfferAlertAsync` catches *any* exception during `_botClient.SendPhoto` and unconditionally falls back to `_botClient.SendMessage`. If Telegram successfully delivered the photo before a network response timeout occurred, the user receives both a photo alert and a text alert for the same offer.

## Desired End State

- **Zero Duplicates**: Photo fallback is executed only when Telegram API explicitly returns an HTTP 400 Bad Request indicating the photo was rejected.
- **Zero Misses**: Offers are saved immediately upon discovery with `NotifiedAt = null`. Once Telegram sends the alert, `NotifiedAt` is set to `DateTimeOffset.UtcNow`. Any offers with `NotifiedAt == null` are retried on subsequent background cycles.

## What We're NOT Doing

- Implementing an external distributed queue (e.g. RabbitMQ or MassTransit).
- Modifying the OLX HTML parser logic.

## Implementation Approach

1. **Domain & Data Access Layer**:
   - Add `DateTimeOffset? NotifiedAt` property to `ProcessedOffer` entity.
   - Update `ProcessedOfferConfiguration` to include column configuration.
   - Update `IProcessedOfferRepository` and `ProcessedOfferRepository` with `GetPendingNotificationsAsync` and `MarkAsNotifiedAsync` methods.
2. **Notification Service Hardening**:
   - Update `TelegramNotificationService` to catch `Telegram.Bot.Exceptions.ApiRequestException` and verify `ErrorCode == 400` or message content before falling back to text.
3. **Application Command Handler**:
   - Update `ProcessOffersCommandHandler` to bulk save matching new offers with `NotifiedAt = null`.
   - Dispatch notifications for newly added offers and any existing unnotified offers.
   - Update `NotifiedAt` timestamp in database upon successful notification dispatch.
4. **Testing & Verification**:
   - Update unit tests in `DealHunter.Tests` for `ProcessOffersCommandHandlerTests` and `TelegramNotificationServiceTests`.

## Phase 1: Domain & Persistence Enhancements

### Overview
Add `NotifiedAt` field to `ProcessedOffer` entity, update EF Core entity configuration, create EF migration, and extend `IProcessedOfferRepository` to query and update delivery status.

### Changes Required:

#### 1. Domain Entity (`DealHunter.Domain`)
**File**: `DealHunter.Domain/Entities/ProcessedOffer.cs`
**Intent**: Add nullable `NotifiedAt` property, update constructor and factory method, and add `MarkNotified` domain method.
**Contract**: `public DateTimeOffset? NotifiedAt { get; private set; }`, `public void MarkNotified(DateTimeOffset notifiedAt)`

#### 2. EF Core Configuration (`DealHunter.Infrastructure`)
**File**: `DealHunter.Infrastructure/Persistence/Configurations/ProcessedOfferConfiguration.cs`
**Intent**: Configure `NotifiedAt` property in EF Core model and add an index for quick retrieval of un-notified records.
**Contract**: `builder.Property(o => o.NotifiedAt).IsRequired(false); builder.HasIndex(o => o.NotifiedAt);`

#### 3. EF Core Migration (`DealHunter.Infrastructure`)
**File**: `DealHunter.Infrastructure/Persistence/Migrations/`
**Intent**: Generate migration adding `NotifiedAt` column to `ProcessedOffers` table.
**Contract**: `AddNotifiedAtToProcessedOffers` migration file.

#### 4. Repository Interface & Implementation (`DealHunter.Application` & `DealHunter.Infrastructure`)
**File**: `DealHunter.Domain/Repositories/IProcessedOfferRepository.cs` and `DealHunter.Infrastructure/Persistence/Repositories/ProcessedOfferRepository.cs`
**Intent**: Add `GetPendingNotificationsAsync` and `MarkAsNotifiedAsync` to repository contract and implementation.
**Contract**: `Task<IReadOnlyList<ProcessedOffer>> GetPendingNotificationsAsync(CancellationToken cancellationToken = default);` and `Task MarkAsNotifiedAsync(string offerId, DateTimeOffset notifiedAt, CancellationToken cancellationToken = default);`

### Success Criteria:

#### Automated Verification:
- Build succeeds: `dotnet build DealHunter.slnx`
- Unit and repository integration tests pass: `dotnet test DealHunter.slnx`

#### Manual Verification:
- Database schema correctly reflects `NotifiedAt` column (nullable timestamp with index).

---

## Phase 2: Telegram Notification Service Hardening

### Overview
Update `TelegramNotificationService` to prevent false fallback text messages when `SendPhoto` succeeds or fails due to network socket timeouts.

### Changes Required:

#### 1. Notification Service (`DealHunter.Infrastructure`)
**File**: `DealHunter.Infrastructure/Notifications/TelegramNotificationService.cs`
**Intent**: Catch `ApiRequestException` during `SendPhoto` call and fall back to `SendMessage` only if `apiEx.ErrorCode == 400` or message contains photo fetching failure indications.
**Contract**: `catch (Telegram.Bot.Exceptions.ApiRequestException apiEx) when (apiEx.ErrorCode == 400)`

### Success Criteria:

#### Automated Verification:
- `dotnet test DealHunter.slnx` passes all notification tests.

#### Manual Verification:
- Simulated `SendPhoto` failure with HTTP 400 triggers text fallback.
- Simulated network timeout on `SendPhoto` does not send text fallback.

---

## Phase 3: Handler Delivery & Retry Logic

### Overview
Refactor `ProcessOffersCommandHandler` to persist discovered offers first with `NotifiedAt = null`, dispatch Telegram alerts, update `NotifiedAt`, and process pending unnotified offers.

### Changes Required:

#### 1. Command Handler (`DealHunter.Application`)
**File**: `DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommandHandler.cs`
**Intent**: Save new offers to repository before notification dispatch. Send notifications for new and pending offers. Update `NotifiedAt` timestamp upon successful alert.
**Contract**: Re-ordered workflow: Save baseline/new offers -> Fetch pending notifications -> Dispatch Telegram alerts -> Mark as notified.

### Success Criteria:

#### Automated Verification:
- `dotnet test DealHunter.slnx` passes.

#### Manual Verification:
- New offers are saved to database prior to Telegram alert.
- Interrupted Telegram alert is retried on subsequent background poll cycle.

---

## Phase 4: Unit Test Suite Expansion

### Overview
Update existing unit tests and add new test cases covering `NotifiedAt` behavior, retries for unnotified offers, and hardened photo fallbacks.

### Changes Required:

#### 1. Handler Tests (`DealHunter.Tests`)
**File**: `DealHunter.Tests/Unit/Offers/ProcessOffersCommandHandlerTests.cs`
**Intent**: Update existing mock setups and add test cases for `GetPendingNotificationsAsync` retries and `MarkAsNotifiedAsync` invocation.

### Success Criteria:

#### Automated Verification:
- `dotnet test DealHunter.slnx` runs all unit tests green.

#### Manual Verification:
- Test runner reports 100% pass rate.

---

## Testing Strategy

### Unit Tests:
- `ProcessedOffer` entity constructor and `MarkNotified` method tests.
- `ProcessOffersCommandHandler` save-first workflow and retry loop tests.
- `TelegramNotificationService` selective `ApiRequestException` fallback tests.

### Integration Tests:
- PostgreSQL repository tests for `GetPendingNotificationsAsync` and `MarkAsNotifiedAsync`.

### Manual Testing Steps:
1. Run `dotnet run --project DealHunter.Api`.
2. Add a search rule via Telegram.
3. Observe initial baseline population (`IsInitialized = true`).
4. Trigger new offer discovery and verify Telegram alert sent with `NotifiedAt` populated in database.
5. Verify zero duplicate notifications received.

## References

- Related change: `context/changes/guaranteed-notification-delivery/plan-brief.md`
- Code references: [ProcessOffersCommandHandler.cs](file:///C:/Users/sheel/Documents/.NET/DealHunter/DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommandHandler.cs), [TelegramNotificationService.cs](file:///C:/Users/sheel/Documents/.NET/DealHunter/DealHunter.Infrastructure/Notifications/TelegramNotificationService.cs)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Domain & Persistence Enhancements

#### Automated

- [x] 1.1 Add `NotifiedAt` property to `ProcessedOffer` domain entity and update factory method
- [x] 1.2 Update `ProcessedOfferConfiguration` in EF Core model
- [x] 1.3 Update `IProcessedOfferRepository` and `ProcessedOfferRepository` with `GetPendingNotificationsAsync` and `MarkAsNotifiedAsync`
- [x] 1.4 Generate EF Core migration for `NotifiedAt` column

#### Manual

- [ ] 1.5 Verify database schema updated with `NotifiedAt` column

### Phase 2: Telegram Notification Service Hardening

#### Automated

- [x] 2.1 Update `TelegramNotificationService` to catch specific `ApiRequestException` on `SendPhoto`

#### Manual

- [ ] 2.2 Verify selective photo fallback logic in test runner

### Phase 3: Handler Delivery & Retry Logic

#### Automated

- [x] 3.1 Update `ProcessOffersCommandHandler` to implement save-first and retry workflow

#### Manual

- [ ] 3.2 Verify end-to-end delivery cycle without duplicate alerts

### Phase 4: Unit Test Suite Expansion

#### Automated

- [x] 4.1 Update `ProcessOffersCommandHandlerTests` with mock assertions for retries and delivery tracking
- [x] 4.2 Run `dotnet test DealHunter.slnx` and verify all tests pass

#### Manual

- [ ] 4.3 Verify 100% test pass rate
