# S-01: OLX Engine, Deduplication & Telegram Alerts Implementation Plan

## Overview

Implement the core automated deal monitoring engine for DealHunter. This includes the OLX.pl HTML parser using `HtmlAgilityPack`, MediatR command `ProcessOffersCommand` for offer extraction, deduplication, and max-price filtering, Telegram Bot alerting service using `Telegram.Bot`, background worker polling service (`IHostedService`) using `.NET PeriodicTimer`, and a comprehensive test suite with static HTML fixtures and mocked MediatR handler tests.

## Current State Analysis

- **Baseline Architecture**: Clean Architecture project layout configured in `F-01` (`DealHunter.Domain`, `DealHunter.Application`, `DealHunter.Infrastructure`, `DealHunter.Api`, `DealHunter.Tests`).
- **Persistence**: `SearchRule` and `ProcessedOffer` entities mapped in EF Core PostgreSQL DBContext with `ISearchRuleRepository` and `IProcessedOfferRepository` implementations.
- **Application Layer**: `AddApplicationServices` configures MediatR.
- **Missing Components**: No HTML parser for OLX, no Telegram notification service, no MediatR offer processing command, no background worker service, and no parser unit test fixtures.

## Desired End State

1. **Application Interfaces**:
   - `IOlxHtmlParser`: Interface defining `IReadOnlyList<ExtractedOfferDto> Parse(string htmlContent)`.
   - `ITelegramNotificationService`: Interface defining `Task SendOfferAlertAsync(long chatId, ExtractedOfferDto offer, decimal? maxPrice, CancellationToken cancellationToken)`.
   - `ProcessOffersCommand`: MediatR command processing active rules and delivering alerts.
2. **Infrastructure Implementations**:
   - `OlxHtmlParser`: Implemented in `DealHunter.Infrastructure` using `HtmlAgilityPack`. Extracts OfferID, title, price, photo URL, and direct link.
   - `TelegramNotificationService`: Implemented in `DealHunter.Infrastructure` using `Telegram.Bot`. Sends photo message with title, price caption, and inline 'Zobacz ogłoszenie' URL button.
3. **Background Worker & DI Root**:
   - `BackgroundWorker`: `.NET BackgroundService` in `DealHunter.Api` running a `PeriodicTimer` loop. Catches exceptions per rule, logs details via `ILogger`, and continues processing without crashing the worker.
   - Configuration for Telegram Bot Token in `appsettings.json` / Environment variables.
4. **Test Verification**:
   - `OlxHtmlParserTests` in `DealHunter.Tests` verifying extraction from static HTML fixtures.
   - `ProcessOffersHandlerTests` in `DealHunter.Tests` verifying deduplication logic and notification dispatching with `NSubstitute` mocks.

## What We're NOT Doing

- Implementing Telegram Bot incoming user commands (`/start`, `/add`, `/list`, `/delete`) — scoped to **S-02**.
- Implementing rate limiting middleware or Polly retry policies — scoped to **S-03**.
- Supporting multiple classified portals besides OLX.pl — MVP is limited exclusively to OLX.pl.

## Implementation Approach

Follow Clean Architecture guidelines strictly:
- `DealHunter.Application`: Holds interfaces `IOlxHtmlParser`, `ITelegramNotificationService`, DTO `ExtractedOfferDto`, command `ProcessOffersCommand`, and handler `ProcessOffersCommandHandler`.
- `DealHunter.Infrastructure`: References `HtmlAgilityPack` and `Telegram.Bot`. Implements `OlxHtmlParser` and `TelegramNotificationService`. Registers DI services in `AddInfrastructureServices`.
- `DealHunter.Api`: Implements `BackgroundWorker` hosting service and configures `TelegramBotClient` in DI.
- `DealHunter.Tests`: Unit tests for parser and command handler.

---

## Critical Implementation Details

- **OLX HTML Selectors**: Target OLX listing elements (typically `<div data-cy="l-card">` or `<a href="/d/oferta/...">`) to extract `OfferId` (from element ID or URL pattern), title, price decimal parsing, image source URL, and full offer URL.
- **Batch Deduplication**: `ProcessOffersCommandHandler` receives all active search rules from `ISearchRuleRepository`. For each rule, it parses the HTML, filters out offers where `Price > rule.MaxPrice`, checks existing `OfferId`s in batch via `IProcessedOfferRepository.FilterExistingOfferIdsAsync`, sends Telegram alerts for new offers, and bulk persists `ProcessedOffer` entities.
- **Fault Isolation**: Any network error or HTML parsing failure on a single URL is trapped inside a `try-catch` block per rule inside `BackgroundWorker` so other rules continue unaffected.

---

## Proposed Changes

### Phase 1: Application Contracts & ProcessOffersCommand (`DealHunter.Application`)

- Create `DealHunter.Application/Common/Interfaces/IOlxHtmlParser.cs`:
  - Method: `IReadOnlyList<ExtractedOfferDto> Parse(string htmlContent)`.
- Create `DealHunter.Application/Common/Interfaces/ITelegramNotificationService.cs`:
  - Method: `Task SendOfferAlertAsync(long chatId, ExtractedOfferDto offer, CancellationToken cancellationToken = default)`.
- Create `DealHunter.Application/DTOs/ExtractedOfferDto.cs`:
  - Properties: `string OfferId`, `string Title`, `decimal Price`, `string OfferUrl`, `string? ImageUrl`.
- Create `DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommand.cs` & `ProcessOffersCommandHandler.cs`:
  - `ProcessOffersCommand`: MediatR `IRequest<ProcessOffersResult>`.
  - `ProcessOffersCommandHandler`: Injects `ISearchRuleRepository`, `IProcessedOfferRepository`, `IOlxHtmlParser`, `ITelegramNotificationService`, and `HttpClient`.
  - Logic: Fetches active rules, downloads HTML for each rule URL, parses offers, filters price `<= MaxPrice`, identifies un-notified offers via `FilterExistingOfferIdsAsync`, sends Telegram alerts, and saves new `ProcessedOffer` entities to DB.

### Phase 2: OLX HTML Parser Implementation (`DealHunter.Infrastructure`)

- Add `HtmlAgilityPack` package to `DealHunter.Infrastructure.csproj`.
- Create `DealHunter.Infrastructure.Parsers.OlxHtmlParser`:
  - Implements `IOlxHtmlParser`.
  - Selects offer card elements, parses offer ID from `id` attributes or URL href, parses Polish price text (e.g. `1 200 zł` -> `1200.00m`), extracts image `src`, constructs absolute offer URL.
- Register `IOlxHtmlParser` as singleton/transient in `DependencyInjection.cs`.

### Phase 3: Telegram Bot Notification Service (`DealHunter.Infrastructure`)

- Add `Telegram.Bot` package to `DealHunter.Infrastructure.csproj`.
- Create `DealHunter.Infrastructure.Notifications.TelegramNotificationService`:
  - Implements `ITelegramNotificationService`.
  - Injects `ITelegramBotClient`.
  - Uses `botClient.SendPhotoAsync` (if `ImageUrl` present) or `SendTextMessageAsync` with HTML parse mode.
  - Caption format: `<b>{Title}</b>\nCena: <b>{Price} zł</b>`.
  - Adds `InlineKeyboardMarkup` with button `'Zobacz ogłoszenie'` linking to `OfferUrl`.
- Register `ITelegramBotClient` and `ITelegramNotificationService` in `DependencyInjection.cs`.

### Phase 4: BackgroundWorker Polling Service & DI Composition (`DealHunter.Api`)

- Create `DealHunter.Api.Services.BackgroundWorker`:
  - Inherits `BackgroundService`.
  - Injects `IServiceScopeFactory` and `ILogger<BackgroundWorker>`.
  - Uses `PeriodicTimer` with configurable interval (e.g., 5 minutes from configuration).
  - Creates scoped MediatR scope per tick and dispatches `ProcessOffersCommand`.
  - Traps exceptions per cycle with detailed logging.
- Update `DealHunter.Api/appsettings.json`:
  - Add `Telegram:BotToken` configuration key.
- Update `DealHunter.Api/Program.cs`:
  - Register `HostedService<BackgroundWorker>()`.

### Phase 5: Test Suite & Verification (`DealHunter.Tests`)

- Create `DealHunter.Tests/Fixtures/olx_search_results.html` test fixture containing realistic OLX HTML output.
- Create `DealHunter.Tests/Unit/Parsers/OlxHtmlParserTests.cs`:
  - Verifies `OlxHtmlParser.Parse` correctly extracts OfferId, Title, Price, OfferUrl, and ImageUrl from static HTML fixture.
- Create `DealHunter.Tests/Unit/Offers/ProcessOffersCommandHandlerTests.cs`:
  - Verifies `ProcessOffersCommandHandler` deduplication: filters out existing offers and sends Telegram alerts only for new offers below `MaxPrice`.
- Run full test suite: `dotnet test DealHunter.slnx`.

---

## Verification Plan

### Automated Tests
- `dotnet build DealHunter.slnx` compiles without warnings or errors.
- `dotnet test DealHunter.slnx` runs unit tests for `OlxHtmlParser` and `ProcessOffersCommandHandler` alongside existing PostgreSQL container tests.

### Manual Verification
- Verify DI container initializes `BackgroundWorker` on `dotnet run --project DealHunter.Api`.

---

## Progress

### Phase 1: Application Contracts & ProcessOffersCommand
- [x] 1.1 `IOlxHtmlParser` & `ITelegramNotificationService` interfaces — e9af48c
- [x] 1.2 `ExtractedOfferDto` definition — e9af48c
- [x] 1.3 `ProcessOffersCommand` & `ProcessOffersCommandHandler` implementation — e9af48c

### Phase 2: OLX HTML Parser Implementation
- [x] 2.1 Add `HtmlAgilityPack` package to `DealHunter.Infrastructure`
- [x] 2.2 `OlxHtmlParser` implementation for OLX.pl DOM structure
- [x] 2.3 Register `IOlxHtmlParser` in Infrastructure DI

### Phase 3: Telegram Bot Notification Service
- [ ] 3.1 Add `Telegram.Bot` package to `DealHunter.Infrastructure`
- [ ] 3.2 `TelegramNotificationService` with inline URL button and photo caption
- [ ] 3.3 Register `ITelegramBotClient` & `ITelegramNotificationService` in DI

### Phase 4: BackgroundWorker Polling Service & DI Composition
- [ ] 4.1 `BackgroundWorker` implementation using `PeriodicTimer`
- [ ] 4.2 Add `Telegram:BotToken` configuration to `appsettings.json`
- [ ] 4.3 Register `BackgroundWorker` in `Program.cs` DI root

### Phase 5: Test Suite & Verification
- [ ] 5.1 Add `olx_search_results.html` test fixture
- [ ] 5.2 Implement `OlxHtmlParserTests`
- [ ] 5.3 Implement `ProcessOffersCommandHandlerTests`
- [ ] 5.4 Run full test suite via `dotnet test DealHunter.slnx`
