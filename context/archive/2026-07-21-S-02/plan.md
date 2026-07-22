# S-02: Telegram Bot Rule Management Interface Implementation Plan

## Overview

Implement the complete interactive Telegram Bot command interface for DealHunter. This enables end users to manage deal monitoring rules directly from Telegram chat commands (`/start`, `/add <URL> [--max-price <KWOTA>]`, `/list`, `/delete <ID|index>`, `/help`). This change introduces `IOlxUrlValidator`, MediatR command and query handlers (`AddSearchRuleCommand`, `GetSearchRulesQuery`, `DeleteSearchRuleCommand`), `TelegramCommandParser`, `TelegramBotListener` long-polling `BackgroundService`, and a comprehensive unit test suite in `DealHunter.Tests`.

## Current State Analysis

- **Completed Slices**: `F-01` (Core Clean Architecture & EF Core PostgreSQL DB Context) and `S-01` (OLX Engine, Deduplication & Telegram Alerts) are fully implemented and archived.
- **Persistence**: `ISearchRuleRepository` supports `AddAsync`, `GetByIdAsync`, `GetAllActiveAsync`, and `DeleteAsync`.
- **Infrastructure**: `Telegram.Bot` v22 package registered in `DealHunter.Infrastructure`.
- **Missing Components**: No method to query search rules by `ChatId`, no OLX URL validation, no MediatR commands for adding/deleting/querying rules from chat input, no command string parser, and no background update listener (`TelegramBotListener`).

## Desired End State

1. **Repository Extension**:
   - `ISearchRuleRepository`: Extended with `Task<IReadOnlyList<SearchRule>> GetByChatIdAsync(long chatId, CancellationToken cancellationToken = default)`.
2. **Application Validation & Commands**:
   - `IOlxUrlValidator`: Validates that URLs use `https://` scheme, target `olx.pl` or `www.olx.pl` host, and contain a non-empty path/query.
   - `AddSearchRuleCommand`: MediatR command taking `chatId`, `url`, and optional `maxPrice`, returning created `SearchRuleDto`.
   - `GetSearchRulesQuery`: MediatR query taking `chatId`, returning `IReadOnlyList<SearchRuleDto>`.
   - `DeleteSearchRuleCommand`: MediatR command taking `chatId` and `ruleIdentifier` (either 1-based index or GUID string), deleting the rule from PostgreSQL.
3. **Telegram Command Parsing & Listening**:
   - `TelegramCommandParser`: Parses raw message text into command type (`Start`, `Add`, `List`, `Delete`, `Help`, `Unknown`) and extracts arguments (URL, `--max-price`, rule index/ID).
   - `TelegramBotListener`: `BackgroundService` in `DealHunter.Api` running `botClient.StartReceiving`, parsing incoming text messages, dispatching MediatR commands, and sending HTML-formatted Telegram replies.
4. **Test Suite**:
   - `OlxUrlValidatorTests`: Verifies validation rules for valid and invalid URLs.
   - `TelegramCommandParserTests`: Verifies parsing of all command variations, arguments, whitespace, and invalid syntaxes.
   - MediatR handler tests: `AddSearchRuleCommandHandlerTests`, `GetSearchRulesQueryHandlerTests`, `DeleteSearchRuleCommandHandlerTests`.

## What We're NOT Doing

- Webhook endpoint integration (long-polling `ReceiveAsync` is used for MVP simplicity and local dev support).
- Supporting multiple classified portals besides OLX.pl — MVP validation is strictly tied to `olx.pl`.
- Complex multi-step conversational state machines — all commands are single-message text commands.

## Implementation Approach

Follow Clean Architecture guidelines strictly:
- `DealHunter.Domain`: Extend `ISearchRuleRepository` interface.
- `DealHunter.Application`: Implement `OlxUrlValidator`, MediatR commands (`AddSearchRuleCommand`, `DeleteSearchRuleCommand`, `GetSearchRulesQuery`), and `TelegramCommandParser`.
- `DealHunter.Infrastructure`: Implement `GetByChatIdAsync` in `SearchRuleRepository`.
- `DealHunter.Api`: Implement `TelegramBotListener` background hosting service and wire DI.
- `DealHunter.Tests`: Unit test suite.

---

## Critical Implementation Details

- **Short Index Mapping for `/delete`**: When a user calls `/list`, the rules for their `ChatId` are listed with 1-based index numbers (`1.`, `2.`, ...). `/delete 1` deletes the 1st rule returned by `GetByChatIdAsync(chatId)`. `/delete <GUID>` is also supported for exact GUID deletion.
- **Parsing `--max-price`**: `/add <URL> --max-price 1500` or `/add <URL> 1500` or `/add <URL>`. Parser handles flags flexibly and extracts decimal values while ignoring spaces.
- **Fault Isolation**: `TelegramBotListener` traps all update processing exceptions, logs them with `ILogger`, and sends a friendly error message to the user (`Wystąpił błąd podczas przetwarzania polecenia.`) without crashing the bot listener.

---

## Proposed Changes

### Phase 1: Domain & Application Contracts, DTOs & Validation (`DealHunter.Domain`, `DealHunter.Application`, `DealHunter.Infrastructure`)

- Update `DealHunter.Domain/Repositories/ISearchRuleRepository.cs`:
  - Add method `Task<IReadOnlyList<SearchRule>> GetByChatIdAsync(long chatId, CancellationToken cancellationToken = default)`.
- Update `DealHunter.Infrastructure/Persistence/Repositories/SearchRuleRepository.cs`:
  - Implement `GetByChatIdAsync` querying `_dbContext.SearchRules.Where(r => r.ChatId == chatId && r.IsActive)`.
- Create `DealHunter.Application/Common/Interfaces/IOlxUrlValidator.cs`:
  - Method: `bool IsValidOlxUrl(string url, out string? errorMessage)`.
- Create `DealHunter.Application/Common/Validators/OlxUrlValidator.cs`:
  - Implements `IOlxUrlValidator`. Validates HTTPS scheme, `olx.pl` host, and non-empty path.

### Phase 2: MediatR Commands & Queries for Rule Management (`DealHunter.Application`)

- Create `DealHunter.Application/Rules/Commands/AddSearchRule/AddSearchRuleCommand.cs` & `AddSearchRuleCommandHandler.cs`:
  - Validates URL via `IOlxUrlValidator`, creates `SearchRule`, persists via `ISearchRuleRepository`, and returns `SearchRuleDto`.
- Create `DealHunter.Application/Rules/Queries/GetSearchRules/GetSearchRulesQuery.cs` & `GetSearchRulesQueryHandler.cs`:
  - Queries `ISearchRuleRepository.GetByChatIdAsync(chatId)` and maps to `IReadOnlyList<SearchRuleDto>`.
- Create `DealHunter.Application/Rules/Commands/DeleteSearchRule/DeleteSearchRuleCommand.cs` & `DeleteSearchRuleCommandHandler.cs`:
  - Takes `chatId` and `ruleIdentifier`. If integer, resolves 1-based index against `GetByChatIdAsync(chatId)`; otherwise parses GUID. Calls `DeleteAsync` on repository.

### Phase 3: Telegram Command Parser & Response Formatting (`DealHunter.Application`)

- Create `DealHunter.Application/Common/Interfaces/ITelegramCommandParser.cs` & `TelegramCommandType.cs`:
  - Enum `TelegramCommandType`: `Start`, `Add`, `List`, `Delete`, `Help`, `Unknown`.
  - DTO `ParsedTelegramCommand(TelegramCommandType Type, string? Url, decimal? MaxPrice, string? RuleIdentifier, string? RawArgs)`.
- Create `DealHunter.Application/Common/Services/TelegramCommandParser.cs`:
  - Parses text messages into `ParsedTelegramCommand`. Handles `/start`, `/add`, `/list`, `/delete`, `/help` commands and extracts flags.
- Create `DealHunter.Application/Common/Services/TelegramMessageFormatter.cs`:
  - Formats `/list` output HTML with numbered items and clickable links.
  - Formats help and success/error messages.

### Phase 4: Telegram Bot Listener Background Service & DI Root (`DealHunter.Api`)

- Create `DealHunter.Api.Services.TelegramBotListener`:
  - Inherits `BackgroundService`.
  - Injects `ITelegramBotClient`, `IServiceScopeFactory`, `ITelegramCommandParser`, and `ILogger<TelegramBotListener>`.
  - In `ExecuteAsync`: calls `botClient.StartReceiving(HandleUpdateAsync, HandleErrorAsync, ...)` to receive incoming Telegram messages via long-polling.
  - In `HandleUpdateAsync`: processes text messages, dispatches to MediatR commands in scope, and sends formatted replies via `botClient.SendMessage`.
- Update `DealHunter.Api/Program.cs`:
  - Register `HostedService<TelegramBotListener>()`.
  - Register `IOlxUrlValidator`, `ITelegramCommandParser`, `ITelegramMessageFormatter` in DI.

### Phase 5: Test Suite & Verification (`DealHunter.Tests`)

- Create `DealHunter.Tests/Unit/Validators/OlxUrlValidatorTests.cs`:
  - Tests valid and invalid OLX URLs.
- Create `DealHunter.Tests/Unit/Parsers/TelegramCommandParserTests.cs`:
  - Tests parsing of `/start`, `/add <URL> --max-price 1500`, `/list`, `/delete 1`, `/delete <guid>`, `/help`, and invalid command strings.
- Create `DealHunter.Tests/Unit/Rules/AddSearchRuleCommandHandlerTests.cs`:
  - Tests rule creation and URL validation failure cases.
- Create `DealHunter.Tests/Unit/Rules/DeleteSearchRuleCommandHandlerTests.cs`:
  - Tests rule deletion by 1-based index and by GUID.
- Run full test suite: `dotnet test DealHunter.slnx`.

---

## Verification Plan

### Automated Tests
- `dotnet build DealHunter.slnx` compiles cleanly without warnings or errors.
- `dotnet test DealHunter.slnx` runs unit tests for `OlxUrlValidator`, `TelegramCommandParser`, `AddSearchRuleCommandHandler`, `DeleteSearchRuleCommandHandler`, and `GetSearchRulesQueryHandler`.

### Manual Verification
- Verify DI container initializes `TelegramBotListener` on `dotnet run --project DealHunter.Api`.

---

## Progress

### Phase 1: Domain & Application Contracts, DTOs & Validation
- [x] 1.1 `ISearchRuleRepository.GetByChatIdAsync` interface & EF Core implementation — 0ba8ca9
- [x] 1.2 `IOlxUrlValidator` & `OlxUrlValidator` implementation — 0ba8ca9
- [x] 1.3 Application DI registrations for validators — 0ba8ca9

### Phase 2: MediatR Commands & Queries for Rule Management
- [x] 2.1 `AddSearchRuleCommand` & handler — 1179491
- [x] 2.2 `GetSearchRulesQuery` & handler — 1179491
- [x] 2.3 `DeleteSearchRuleCommand` & handler — 1179491

### Phase 3: Telegram Command Parser & Response Formatting
- [x] 3.1 `TelegramCommandType` & `ParsedTelegramCommand` DTOs — 0080d01
- [x] 3.2 `TelegramCommandParser` implementation — 0080d01
- [x] 3.3 `TelegramMessageFormatter` implementation — 0080d01

### Phase 4: Telegram Bot Listener Background Service & DI Root
- [x] 4.1 `TelegramBotListener` long-polling `BackgroundService` — 0691d6b
- [x] 4.2 Wire update handler & reply dispatching to MediatR commands — 0691d6b
- [x] 4.3 Register `TelegramBotListener` in `Program.cs` DI root — 0691d6b

### Phase 5: Test Suite & Verification
- [x] 5.1 `OlxUrlValidatorTests` implementation — fbdb76a
- [x] 5.2 `TelegramCommandParserTests` implementation — fbdb76a
- [x] 5.3 MediatR rule management handler tests — fbdb76a
- [x] 5.4 Run full test suite via `dotnet test DealHunter.slnx` — fbdb76a
