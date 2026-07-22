# S-03: Resilience, Rate Limiting & Polly Retry Policies Implementation Plan

## Overview

Implement HTTP resilience, rate limiting, and fault isolation for DealHunter's OLX scraping pipeline. This change introduces Polly retry policies with exponential backoff for transient HTTP errors (NFR-004), rate limiting with configurable delays between OLX scraping calls (NFR-003), and per-rule exception isolation in `ProcessOffersCommandHandler` to prevent individual rule failures from halting the background processing loop (NFR-002).

## Current State Analysis

- `ProcessOffersCommandHandler` (`DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommandHandler.cs`) fetches active rules and iterates through them sequentially, making direct calls to `_httpClient.GetStringAsync(rule.Url)`.
- If an exception occurs while fetching or parsing a specific rule, the unhandled exception propagates out of `ProcessOffersCommandHandler.Handle`, aborting processing for all subsequent rules in the cycle.
- `BackgroundWorker` (`DealHunter.Api/Services/BackgroundWorker.cs`) catches exceptions around `mediator.Send(...)`, preventing worker process termination but losing rule execution for that cycle.
- `HttpClient` is registered in `Program.cs` via standard `builder.Services.AddHttpClient()` without transient fault handling, retries, or rate limiting policies.
- No Polly package is currently referenced in any project file.

## Desired End State

- Transient network and HTTP errors (5xx HTTP status codes, 408 Request Timeout, network drops, `HttpRequestException`, `TaskCanceledException` / timeouts) during OLX scraping are automatically retried up to 3 times using exponential backoff (2s, 4s, 8s).
- Rate limiting is enforced between OLX scraping requests with a minimum 3-second delay (`TimeSpan.FromSeconds(3)`) to protect against IP rate limits (HTTP 429) from OLX.pl.
- `ProcessOffersCommandHandler` traps exceptions on a per-rule basis, logging the error and continuing to process all remaining active search rules in the cycle.
- Resilience parameters (retry counts, backoff intervals, rate limit delays) are configurable via `appsettings.json` under a `Resilience` section with safe fallback defaults.
- All existing tests pass and new unit/integration tests verify retry behavior, rate limiting delays, and exception isolation.

### Key Discoveries

- `DealHunter.Infrastructure/DependencyInjection.cs`: Registration site for infrastructure services and HTTP clients.
- `DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommandHandler.cs`: Command handler executing HTTP GET calls for active search rules.
- `DealHunter.Api/Program.cs`: Application entry point registering services via `AddHttpClient()`.

## What We're NOT Doing

- We are not implementing circuit breakers or advanced distributed rate limiting (e.g. Redis-backed rate limiting) in MVP.
- We are not implementing custom proxy rotation or anti-bot bypass mechanisms.
- We are not altering the core database schema or Telegram notification dispatch contracts.

## Implementation Approach

1. **Infrastructure & Configuration Setup**: Add `Microsoft.Extensions.Http.Polly` package to `DealHunter.Infrastructure`. Define `ResilienceOptions` bound to `appsettings.json` under the `"Resilience"` configuration section.
2. **Polly Retry Policy**: Configure an `IAsyncPolicy<HttpResponseMessage>` transient HTTP retry policy with exponential backoff (3 retries: 2s, 4s, 8s) for `HttpClient` in `DealHunter.Infrastructure`.
3. **Rate Limiting & Exception Isolation**: Update `ProcessOffersCommandHandler` to isolate rule processing within a `try-catch` block per rule, and introduce an asynchronous inter-request delay (`Task.Delay(interRequestDelay, cancellationToken)`) between rule requests.
4. **Automated Testing**: Add comprehensive unit tests in `DealHunter.Tests` verifying retry execution on HTTP failures, rate limit delays, and per-rule exception trapping.

## Critical Implementation Details

- **Fault Handling Scope**: Retries apply strictly to transient HTTP errors (5xx, 408, `HttpRequestException`, `TimeoutException`). Permanent client errors (e.g., 404 Not Found, 400 Bad Request) must NOT be retried.
- **Cancellation Token Propagation**: `Task.Delay` and Polly policy executions must strictly honor the `CancellationToken` passed from `ProcessOffersCommand` to ensure graceful shutdown during service stopping signals.
- **Clean Architecture Boundaries**: `ResilienceOptions` and Polly policy configurations belong in `DealHunter.Infrastructure` / `DealHunter.Application`, keeping `DealHunter.Domain` completely free of external dependencies.

## Implementation Phases

### Phase 1: Configuration & Resilience Infrastructure

- Add `Microsoft.Extensions.Http.Polly` NuGet package to `DealHunter.Infrastructure/DealHunter.Infrastructure.csproj`.
- Create `ResilienceOptions` configuration class in `DealHunter.Application/Common/Models/ResilienceOptions.cs` with properties: `MaxRetryCount` (default: 3), `BaseBackoffSeconds` (default: 2), `InterRequestDelaySeconds` (default: 3).
- Update `appsettings.json` in `DealHunter.Api` to include a `"Resilience"` section.

### Phase 2: Polly HTTP Retry Policy Integration

- Define Polly retry policy helper method `GetOlxRetryPolicy(ResilienceOptions options, ILogger logger)` in `DealHunter.Infrastructure`.
- Update `DependencyInjection.cs` in `DealHunter.Infrastructure` to register a resilient `HttpClient` using `AddHttpClient` configured with `AddPolicyHandler(GetOlxRetryPolicy(...))`.
- Update `DealHunter.Api/Program.cs` to ensure DI initialization leverages the resilience-configured HTTP client setup.

### Phase 3: Rate Limiting & Per-Rule Exception Isolation

- Update `ProcessOffersCommandHandler` in `DealHunter.Application/Offers/Commands/ProcessOffers/ProcessOffersCommandHandler.cs`:
  - Wrap processing of each `rule` inside the `foreach` loop in a `try-catch` block.
  - Log exceptions on per-rule failure without stopping the loop, allowing remaining active rules to execute.
  - Introduce `await Task.Delay(TimeSpan.FromSeconds(options.InterRequestDelaySeconds), cancellationToken)` between consecutive rule requests when processing multiple rules.

### Phase 4: Unit & Integration Testing

- Create `ProcessOffersCommandHandlerTests.cs` in `DealHunter.Tests/Unit/Application/` testing:
  - Exception in one rule does not break processing of subsequent active rules.
  - Rate limit delay is invoked when multiple active rules are processed.
- Create `PollyResiliencePolicyTests.cs` in `DealHunter.Tests/Unit/Infrastructure/` testing retry behavior on 5xx status codes and `HttpRequestException`.
- Execute full test suite (`dotnet test DealHunter.slnx`) and verify clean pass.

## Verification Plan

### Automated Tests
- Run `dotnet test DealHunter.slnx` to execute all existing and newly created tests.
- Verify 100% pass rate across unit and integration tests.

### Manual Verification
- Launch application via `dotnet run --project DealHunter.Api`.
- Verify background worker execution logs showing resilient processing and configured rate limiting interval.

---

## Progress

### Automated Progress
- [x] Phase 1: Configuration & Resilience Infrastructure — pending
- [ ] Phase 2: Polly HTTP Retry Policy Integration — pending
- [ ] Phase 3: Rate Limiting & Per-Rule Exception Isolation — pending
- [ ] Phase 4: Unit & Integration Testing — pending

### Manual Progress
