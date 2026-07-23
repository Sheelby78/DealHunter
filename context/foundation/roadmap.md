---
project: "DealHunter"
created: 2026-07-21
updated: 2026-07-23
version: 2
main_goal: quality
north_star: "S-05: Autoryzacja PIN i Wyświetlanie Listy Reguł"
top_blocker: none
investments:
  backend: simple
  data: simple
  frontend: deep
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
| S-03 | Resilience, Rate Limiting & Polly Retry Policies | done | S-01 | No | NFR-001, NFR-002, NFR-003, NFR-004 |
| S-04 | CI/CD Automation & Azure App Service Deployment | done | S-01 | Yes (with S-02, S-03) | `tech-stack.md` deployment hints |
| F-02 | Backend API Endpoints (Auth & Rules) | done | S-01 | Yes (with F-03) | REST/SignalR |
| F-03 | Frontend Setup & Cyberpunk Design System | ready | S-04 | Yes (with F-02) | Vite, React |
| S-05 | Autoryzacja PIN i Wyświetlanie Listy Reguł | proposed | F-02, F-03 | No | US-01, Scope: Auth, List |
| S-06 | Pełne Zarządzanie (Dodawanie / Usuwanie) | proposed | S-05 | No | US-01, Scope: Add, Delete |

---

## Baseline

Codebase baseline (auto-researched):

  Frontend:      present — Vite + React SPA w katalogu DealHunter.Web (package.json)
  Backend/API:   present — .NET 10 Web API z Clean Architecture (DealHunter.Api)
  Data:          present — SQLite + EF Core (DealHunter.Infrastructure)
  Auth:          partial — PIN autoryzacja zdefiniowana w PRD, ale jeszcze niewdrożona.
  Deploy/infra:  present — Azure App Service / GitHub Actions dla backendu.
  Observability: partial — .NET ILogger.

---

## Foundations

### F-01: Core Architecture & SQLite Persistence

- **Scope**:
  - Konfiguracja SQLite oraz Entity Framework Core w warstwie `DealHunter.Infrastructure`.
  - Utworzenie modeli encji `SearchRule` (Id, ChatId, Url, MaxPrice, CreatedAt) oraz `ProcessedOffer` (OfferId, RuleId, ProcessedAt) w `DealHunter.Domain`.
  - Rejestracja MediatR oraz interfejsów repozytoriów i zewnętrznych usług w `DealHunter.Application`.
- **Value / Outcome**: Solidne fundamenty architektoniczne Clean Architecture i trwała baza danych SQLite pozwalająca na równoległą pracę nad silnikiem detekcji oraz botem Telegram.
- **Verification**: `dotnet test` przechodzi pomyślnie, zaimplementowano testy integracyjne in-memory DB dla SQLite DbContext.

### F-02: Backend API Endpoints (Auth & Rules)
- **Scope**: Dodanie nowych kontrolerów i endpointów REST w `DealHunter.Api` obsługujących walidację statycznego kodu PIN, pobieranie listy, dodawanie i usuwanie reguł.
- **Value / Outcome**: Umożliwienie aplikacji klienckiej (WWW) na odczyt i modyfikację stanu aplikacji bez naruszania wewnętrznej logiki silnika.
- **Verification**: Udane zapytania w Postman / Swagger, odpowiednio zabezpieczone statycznym PINem (200 OK / 401 Unauthorized).
- **Change ID**: f-02-backend-api-endpoints
- **Status**: done

### F-03: Frontend Setup & Cyberpunk Design System
- **Scope**: Skonfigurowanie globalnych styli CSS (zmienne, kolory neon-zielony i fioletowy, fonty w stylu terminalowym) w wygenerowanej aplikacji `DealHunter.Web`. Przygotowanie podstawowych layoutów (Card, Input, Button) w klimacie hakerskim.
- **Value / Outcome**: Solidny, dedykowany system projektowy, który spełnia najwyższe wymagania estetyczne (ultra wysoka jakość, cel: `quality`).
- **Verification**: Ręczny przegląd UI (lokalnie `npm run dev`) sprawdzający spójność wizualną z motywem (dark theme, neon accents).

---

## Slices

### S-01: OLX Engine, Deduplication & Telegram Alerts
- **Status**: done

### S-02: Telegram Bot Rule Management Interface
- **Status**: done

### S-03: Resilience, Rate Limiting & Polly Retry Policies
- **Status**: done

### S-04: CI/CD Automation & Azure App Service Deployment
- **Status**: done

### S-05: Autoryzacja PIN i Wyświetlanie Listy Reguł (North Star)
- **Scope**:
  - Budowa ekranu logowania (wprowadzenie kodu PIN) w React z zachowaniem animacji i stylu Cyberpunk.
  - Ochrona routingu po stronie frontendu (jeśli brak prawidłowego PINu, przeniesienie do ekranu logowania).
  - Ekran główny (Dashboard) pobierający listę reguł z API i wyświetlający ją w ostylowanej, neonowej tabeli.
- **Value / Outcome**: Kluczowy dowód integracji UI z backendem; możliwość bezpiecznego przeglądania danych (read-only) w nowym, zachwycającym UI.
- **Verification**: Test E2E (lub manualny): wejście na stronę -> wpisanie PIN -> udane wyświetlenie elementów zapisanych przez Telegram bota.
- **Dependencies**: F-02, F-03
- **Unknowns / Risks**: Żadne (blocker: none). Zespół skupia się wyłącznie na płynności i jakości UI.
- **Status**: proposed

### S-06: Pełne Zarządzanie (Dodawanie / Usuwanie)
- **Scope**:
  - Dokończenie ekranu głównego o interaktywny formularz dodawania (URL + Max Price).
  - Integracja obsługi błędów API (np. niepoprawny format linku OLX).
  - Guziki akcji (usuwanie) wywołujące mutację API z dopracowanymi mikro-animacjami (np. płynne zanikanie wiersza tabeli).
- **Value / Outcome**: Pełna wartość biznesowa panelu administracyjnego WWW; brak konieczności powrotu do bota Telegram w celu zarządzania listą (wszystko w jednym, pięknym interfejsie).
- **Verification**: Manualna weryfikacja czy usunięta lub dodana z poziomu przeglądarki reguła faktycznie zmienia zachowanie silnika .NET na Telegramie.
- **Dependencies**: S-05
- **Unknowns / Risks**: Brak.
- **Status**: proposed

---

## Unresolved Blockers & Unknowns

- **Brak znanych krytycznych blokerów**: Traktujemy ten projekt jako pozbawiony krytycznych zagrożeń (zgodnie ze wskazanym blocker = none). Celem jest idealne dostosowanie estetyki i UX (jakość / quality).

---

## Done

- **S-01: Realizacja priorytetowej hipotezy biznesowej — działający automatyczny potok wykrywający nowe oferty OLX i natychmiastowo dostarczający alerty na Telegram.** — Archived 2026-07-21 → `context/archive/2026-07-21-S-01/`. Lesson: —.
- **S-02: Pełny interfejs zarządczy dla użytkownika końcowego umożliwiający dynamiczne dodawanie, podgląd i usuwanie reguł monitorowania bez ingerencji w kod/bazę.** — Archived 2026-07-21 → `context/archive/2026-07-21-S-02/`. Lesson: —.
- **S-04: Zautomatyzowany cykl dostarczania oprogramowania (CI/CD) eliminujący ręczne kroki wdrożeniowe.** — Archived 2026-07-22 → `context/archive/2026-07-22-azure-infrastructure/`. Lesson: —.
- **S-03: Resilience, Rate Limiting & Polly Retry Policies** — Archived 2026-07-23 → `context/archive/2026-07-22-s-03/`. Lesson: —.
- **F-02: Backend API Endpoints (Auth & Rules)** — Archived 2026-07-23 → `context/archive/2026-07-23-f-02-backend-api-endpoints/`. Lesson: —.
