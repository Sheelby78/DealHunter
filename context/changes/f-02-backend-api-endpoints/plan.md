# Backend API Endpoints (Auth & Rules) Implementation Plan

## Overview

We need to add REST API endpoints to `DealHunter.Api` to allow the new React frontend to fetch, add, and delete OLX search rules. These endpoints will be secured by a static PIN, and newly created rules will be mapped to a globally configured Telegram ChatId.

## Current State Analysis

- The `DealHunter.Application` layer already has MediatR handlers (`GetSearchRulesQuery`, `AddSearchRuleCommand`, `DeleteSearchRuleCommand`).
- The `DealHunter.Api` is wired up for controllers (`AddControllers()`) but lacks any actual controllers.
- The `SearchRule` domain entity strictly requires a `ChatId` on creation. Currently, this comes from Telegram messages.

## Desired End State

- A new `RulesController` exists under `DealHunter.Api/Controllers`.
- Three endpoints (`GET /api/rules`, `POST /api/rules`, `DELETE /api/rules/{id}`) mapped to MediatR logic.
- A custom `[PinAuthorize]` filter verifies the `x-pin` header against a configured `WebPanelPin`.
- New rules created via API are automatically assigned the `AdminChatId` from `appsettings.json`.

### Key Discoveries:

- `AddSearchRuleCommand` expects a `ChatId`. We will inject the `AdminChatId` into this command inside the controller.
- `GetSearchRulesQuery` also filters by `ChatId`. The controller must pass `AdminChatId` to fetch only the admin's rules.

## What We're NOT Doing

- We are NOT issuing JWT tokens or creating a complex login session system.
- We are NOT modifying the existing Telegram bot functionality.
- We are NOT changing the underlying SQLite database schema.

## Implementation Approach

1. **Configuration**: Add `WebPanelPin` and `AdminChatId` to `appsettings.json` and map them to a strongly typed options class (e.g., `PanelOptions`).
2. **Security**: Implement an `IAuthorizationFilter` (e.g., `PinAuthFilter`) that checks the `x-pin` request header.
3. **Controller**: Create `RulesController` decorating it with the PIN auth filter. Inject `IMediator` and `IOptions<PanelOptions>` to handle the HTTP methods and delegate to MediatR.

---

## Phase 1: Configuration & Global ChatId

- Add `WebPanelPin` and `AdminChatId` settings to `DealHunter.Api/appsettings.json`.
- Create a `PanelOptions` record/class in `DealHunter.Api/Configuration` to hold these values.
- Register `PanelOptions` in `Program.cs` via `builder.Services.Configure<PanelOptions>(...)`.

## Phase 2: Authentication Filter

- Create `PinAuthFilter` implementing `IAuthorizationFilter` in `DealHunter.Api/Filters`.
- Inject `IOptions<PanelOptions>` into the filter.
- In `OnAuthorization`, verify if the `x-pin` header matches `PanelOptions.WebPanelPin`. Return `401 Unauthorized` if it doesn't.
- Create a custom attribute `[PinAuthorize]` that applies this filter via `TypeFilterAttribute`.

## Phase 3: RulesController Implementation

- Create `DealHunter.Api/Controllers/RulesController.cs`.
- Apply `[ApiController]`, `[Route("api/[controller]")]`, and `[PinAuthorize]` attributes.
- Implement `GET /api/rules`: Send `GetSearchRulesQuery(AdminChatId)` via MediatR and return the result.
- Implement `POST /api/rules`: Read `Url` and `MaxPrice` from the request body. Send `AddSearchRuleCommand(AdminChatId, Url, MaxPrice)` via MediatR.
- Implement `DELETE /api/rules/{id}`: Send `DeleteSearchRuleCommand(id, AdminChatId)` via MediatR.

## Progress

- [x] Phase 1: Configuration & Global ChatId — 97934eb
- [x] Phase 2: Authentication Filter — c753dda
- [x] Phase 3: RulesController Implementation
