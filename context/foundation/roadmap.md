---
project: "DealHunter"
created: 2026-07-21
updated: 2026-07-21
version: 1
main_goal: speed
north_star: "S-01: OLX Engine, Deduplication & Telegram Alerts"
top_blocker: time
investments:
  backend: deep
  data: simple
  frontend: simple
  infra: simple
status: active
---

# DealHunter — Technical Roadmap

## At a glance

| ID | Title | Status | Dependencies | Parallelizable | Target US / FRs |
|---|---|---|---|---|---|
| F-01 | Core Architecture & SQLite Persistence | done | None | No | Architectural baseline |
| S-01 | OLX Engine, Deduplication & Telegram Alerts | done | F-01 | No | US-02, FR-003, FR-004, FR-005 |
| S-02 | Telegram Bot Rule Management Interface | done | F-01 | Yes (with S-01) | US-01, US-03, FR-001, FR-002, FR-006, FR-007, FR-008 |
| S-03 | Resilience, Rate Limiting & Polly Retry Policies | ready | S-01 | No | NFR-001, NFR-002, NFR-003, NFR-004 |
| S-04 | CI/CD Automation & Azure App Service Deployment | ready | S-01 | Yes (with S-02, S-03) | `tech-stack.md` deployment hints |

---

## Baseline

Codebase baseline confirmed on 2026-07-21:

- **Frontend / UI**: `absent` — Brak aplikacji WWW; interfejs oparty na Telegram Bot.
- **Backend / API**: `partial` — Rozwiązanie `.NET 10.0` C# ze strukturą Clean Architecture (`DealHunter.Domain`, `DealHunter.Application`, `DealHunter.Infrastructure`, `DealHunter.Api`) w stanie początkowego szablonu.
- **Data**: `absent` — Brak bazy danych, dostawcy ORM i schematów encji.
- **Auth**: `absent` — Brak tożsamości WWW; autoryzacja bazuje na Telegram Chat ID.
- **Deploy / Infra**: `partial` — Azure App Service / GitHub Actions zdeklarowane w `tech-stack.md`, brak skryptów CI/CD i Dockerfile.
- **Observability**: `partial` — Podstawowe logowanie ASP.NET Core (`ILogger`).

---

## Foundations

### F-01: Core Architecture & SQLite Persistence

- **Scope**:
  - Konfiguracja SQLite oraz Entity Framework Core w warstwie `DealHunter.Infrastructure`.
  - Utworzenie modeli encji `SearchRule` (Id, ChatId, Url, MaxPrice, CreatedAt) oraz `ProcessedOffer` (OfferId, RuleId, ProcessedAt) w `DealHunter.Domain`.
  - Rejestracja MediatR oraz interfejsów repozytoriów i zewnętrznych usług w `DealHunter.Application`.
- **Value / Outcome**: Solidne fundamenty architektoniczne Clean Architecture i trwała baza danych SQLite pozwalająca na równoległą pracę nad silnikiem detekcji oraz botem Telegram.
- **Verification**: `dotnet test` przechodzi pomyślnie, zaimplementowano testy integracyjne in-memory DB dla SQLite DbContext.

---

## Slices

### S-01: OLX Engine, Deduplication & Telegram Alerts (North Star)

- **Scope**:
  - Implementacja HTML Parsera dla serwisu OLX.pl w `DealHunter.Infrastructure` wyciągającego OfferID, tytuł, cenę, URL zdjęcia oraz bezpośredni link.
  - Pętla przetwarzania w `BackgroundWorker` (`IHostedService`), cyklicznie pobierająca zdefinowane reguły (FR-003).
  - Logika deduplikacji i filtrowania cenowego (`Cena <= MaxPrice`) w MediatR `ProcessOffersCommand` (FR-004).
  - Klient Telegram Bot API wysyłający sformatowaną wiadomość ze zdjęciem i przyciskiem URL (FR-005).
- **Value / Outcome**: Realizacja priorytetowej hipotezy biznesowej — działający automatyczny potok wykrywający nowe oferty OLX i natychmiastowo dostarczający alerty na Telegram.
- **Verification**: Testy jednostkowe parsera OLX dla przykładowego HTML, testy komendy `ProcessOffersCommand` weryfikujące deduplikację, test integracyjny wysyłki wiadomości.
- **Dependencies**: F-01
- **Unknowns / Risks**: Zmiany w strukturze HTML OLX.pl mogą uszkodzić parser.
- **Status**: done

---

### S-02: Telegram Bot Rule Management Interface

- **Scope**:
  - Integracja biblioteki Telegram Bot Client (np. Telegram.Bot) do obróbki wiadomości wejściowych od użytkownika.
  - Komenda `/start` rejestrująca identyfikator Chat ID (FR-001).
  - Walidacja adresów URL pod kątem domeny OLX.pl i struktury przed zapisem (FR-008).
  - Komenda `/add <URL> [--max-price KWOTA]` zapisująca nową regułę w bazie (FR-002).
  - Komenda `/list` zwracająca aktywne reguły użytkownika (FR-006).
  - Komenda `/delete <ID>` trwale kasująca regułę z bazy (FR-007).
- **Value / Outcome**: Pełny interfejs zarządczy dla użytkownika końcowego umożliwiający dynamiczne dodawanie, podgląd i usuwanie reguł monitorowania bez ingerencji w kod/bazę.
- **Verification**: Testy jednostkowe walidatora URL oraz komend Telegram, testy integracyjne operacji CRUD na regułach.
- **Dependencies**: F-01
- **Unknowns / Risks**: Brak.
- **Status**: done

---

### S-03: Resilience, Rate Limiting & Polly Retry Policies

- **Scope**:
  - Wdrożenie bezpiecznych odstępów czasowych (rate limiting min. 3–5 sekund) między zapytaniami do OLX.pl (NFR-003, Guardrails).
  - Implementacja polityki ponowień Polly dla zapytań HTTP (retry with exponential backoff) chroniącej przed chwilowymi awariami sieci (NFR-004).
  - Zabezpieczenie pętli BackgroundWorker przed zatrzymaniem w przypadku błędu pojedynczego cyklu parsowania (NFR-002).
- **Value / Outcome**: Ochrona aplikacji przed zablokowaniem IP (HTTP 429) przez OLX.pl oraz zagwarantowanie ciągłości działania usługi 24/7.
- **Verification**: Testy jednostkowe polityki Polly, testy symulujące awarię sieciową HTTP oraz przekroczenie bezpiecznego tempa zapytań.
- **Dependencies**: S-01
- **Unknowns / Risks**: Zaostrzające się zabezpieczenia antybotowe portalu OLX.
- **Status**: ready

---

### S-04: CI/CD Automation & Azure App Service Deployment

- **Scope**:
  - Konfiguracja pliku workflow `.github/workflows/deploy.yml` do budowy rozwiązania i uruchamiania testów `dotnet test`.
  - Automatyczny deployment aplikacji `.NET 10` do Azure App Service po scaleniu z gałęzią `main`.
  - Konfiguracja zmiennych środowiskowych i sekretów (Telegram Bot Token, SQLite Connection String / Persistent Storage Path).
- **Value / Outcome**: Zautomatyzowany cykl dostarczania oprogramowania (CI/CD) eliminujący ręczne kroki wdrożeniowe.
- **Verification**: Udany uruchomiony workflow w GitHub Actions i zweryfikowany deployment na środowisko Azure.
- **Dependencies**: S-01
- **Unknowns / Risks**: Zarządzanie trwałym wolumenem pliku SQLite w Azure App Service (konfigurowalne przez Azure Storage Mount / App Service Local Storage).
- **Status**: ready

---

## Unresolved Blockers & Unknowns

- **Brak znanych krytycznych blokerów**: PRD jest w pełni spójne (score 4/4), a baseline oraz stos technologiczny zostały zweryfikowane.

---

## Done

- **S-01: Realizacja priorytetowej hipotezy biznesowej — działający automatyczny potok wykrywający nowe oferty OLX i natychmiastowo dostarczający alerty na Telegram.** — Archived 2026-07-21 → `context/archive/2026-07-21-S-01/`. Lesson: —.
- **S-02: Pełny interfejs zarządczy dla użytkownika końcowego umożliwiający dynamiczne dodawanie, podgląd i usuwanie reguł monitorowania bez ingerencji w kod/bazę.** — Archived 2026-07-21 → `context/archive/2026-07-21-S-02/`. Lesson: —.
