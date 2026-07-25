# Guaranteed Notification Delivery & Deduplication — Plan Brief

> Full plan: `context/changes/guaranteed-notification-delivery/plan.md`

## What & Why

Fix duplicate Telegram offer notifications and ensure zero offers are missed by implementing a two-phase delivery tracking system. Currently, photo-to-text fallbacks and post-alert database writes cause duplicate alerts and potential missed notifications during transient network or database errors.

## Starting Point

The current system (`ProcessOffersCommandHandler`) sends Telegram alerts *before* persisting offers to the database (`ProcessedOffers`). Furthermore, `TelegramNotificationService` catches any exception during `SendPhoto` and unconditionally falls back to sending a text message via `SendMessage`, even if Telegram successfully delivered the photo.

## Desired End State

* Zero duplicate notifications per offer, even if photo sending encounters socket response timeouts or network glitches.
* Guaranteed notification delivery with no missed offers: new offers are saved to the database immediately upon discovery, and unnotified offers are safely retried on subsequent background cycles.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Delivery Tracking | Add `NotifiedAt` column to `ProcessedOffer` | Allows DB persistence first while tracking delivery status for retries without duplicate alerts | Plan |
| Photo Fallback | Inspect Telegram API error code | Only fall back to text message if Telegram explicitly rejected the photo (HTTP 400), not on timeout | Plan |
| Retry Mechanism | Retry pending `NotifiedAt == null` offers in worker | Guarantees zero missed offers if Telegram is down during a polling cycle | Plan |

## Scope

**In scope:**
* Domain update to `ProcessedOffer` entity (add `NotifiedAt` property).
* EF Core migration for `ProcessedOffers` table schema change.
* Repository methods to query un-notified offers and mark offers as notified.
* Selective fallback handling in `TelegramNotificationService`.
* Update `ProcessOffersCommandHandler` to save first and retry pending notifications.
* Unit tests for updated domain entity, handler, and notification service.

**Out of scope:**
* External message queueing services (e.g. RabbitMQ, Azure Service Bus).
* Multi-user authorization for search rules.

## Architecture / Approach

1. **Discovery & Persistence**: When matching offers are found, save them to the database immediately with `NotifiedAt = null`.
2. **Notification Dispatch**: Dispatch Telegram alerts for newly saved or pending un-notified offers.
3. **Delivery Acknowledgment**: Mark `NotifiedAt = UtcNow` in the database upon successful Telegram dispatch.
4. **Selective Fallback**: In `TelegramNotificationService`, catch `ApiRequestException` on `SendPhoto` and only trigger text fallback if error code is 400 (photo rejected).

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Domain & Persistence | `NotifiedAt` property on `ProcessedOffer`, EF Core migration, repo queries | Migration compatibility on existing database |
| 2. Notification Service Hardening | Selective photo fallback handling in `TelegramNotificationService` | Correct error code filtering for Telegram API errors |
| 3. Handler & Delivery Engine | Save-first & retry workflow in `ProcessOffersCommandHandler` | Ensuring atomic updates and batch efficiency |
| 4. Verification & Unit Testing | Full unit test coverage for retries, deduplication, and photo fallback | Test setup with mock repositories |

**Prerequisites:** Build passing, PostgreSQL migration tooling available.
**Estimated effort:** ~1-2 sessions across 4 phases.

## Open Risks & Assumptions

* **Assumption:** Telegram API returns HTTP 400 / `ApiRequestException` with error code 400 when photo content cannot be fetched from source URL.
* **Risk:** Concurrent background worker runs could process the same pending offers if multiple API instances remain active (addressed by DB uniqueness on `OfferId`).

## Success Criteria (Summary)

* Zero duplicate notifications sent for offers with valid or invalid photos.
* Transient Telegram outages do not cause missed notifications — pending alerts are retried on subsequent cycles.
* All unit tests pass cleanly (`dotnet test DealHunter.slnx`).
