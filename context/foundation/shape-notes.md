---
project: "DealHunter"
context_type: greenfield
created: 2026-07-21
updated: 2026-07-21
product_type: api
target_scale:
  users: small
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 4
  hard_deadline: null
  after_hours_only: true
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: "Insight"
      decision: "Serwisy ogłoszeniowe opóźniają natywne alerty, dając przewagę automatycznym narzędziom"
    - topic: "Primary persona"
      decision: "Osoba prywatna / hobbysta polujący na konkretny sprzęt do własnego użytku"
    - topic: "Access control"
      decision: "Jedno-użytkownikowy brak autentykacji dla MVP; interfejs Telegram Bot"
    - topic: "Timeline budget"
      decision: "4 tygodnie na budowę MVP po godzinach"
    - topic: "Management commands"
      decision: "Komendy /list i /delete podniesione do must-have ze względu na użyteczność MVP"
    - topic: "Business logic"
      decision: "Zdefiniowano jednolinijkową regułę biznesową filtrowania i deduplikacji ofert"
    - topic: "Scope boundaries"
      decision: "V1 skupione na OLX.pl, interfejsie Telegram oraz braku panelu WWW/AI"
  frs_drafted: 8
  quality_check_status: accepted
---

# DealHunter — Shape Notes

## Vision & Problem Statement

Atrakcyjne cenowo oferty na portalach ogłoszeniowych znikają w ciągu kilku-kilkunastu minut od publikacji. Osoby poszukujące używanego sprzętu oraz okazjonalni łowcy okazji tracą mnóstwo czasu na ciągłe, uciążliwe, ręczne odświeżanie stron w przeglądarce, a i tak często przegrywają z szybszymi kupującymi.

Istniejące natywne powiadomienia serwisów ogłoszeniowych działają ze znacznym opóźnieniem. Stworzenie narzędzia błyskawicznie wykrywającego nowe ogłoszenia i dostarczającego natychmiastowe alerty daje użytkownikowi decydującą przewagę czasową.

## User & Persona

### Primary Persona
- **Role**: Osoba prywatna / hobbysta poszukujący konkretnego sprzętu (np. elektroniki, instrumentów, części) do własnego użytku.
- **Context**: Monitoruje wybrane kategorie lub frazy kluczowe, zależy jej na szybkim przechwyceniu okazyjnej oferty zanim ubiegną ją inni.
- **Trigger**: Nowo opublikowane ogłoszenie spełniające kryteria wyszukiwania.

## Access Control

Jedno-użytkownikowa / osobista instancja aplikacji. Interfejsem dostępowym dla użytkownika jest interaktywny bot Telegram (`@DealHunterBot`). Brak konieczności tworzenia dedykowanych kont WWW w MVP — dostęp autoryzowany poprzez unikalne Chat ID użytkownika Telegram.

## Success Criteria

### Primary
- **Czas reakcji (Latency)**: System wygrywa wyścig z czasem, dostarczając powiadomienie Telegram o nowej ofercie w czasie < 5 minut od jej opublikowania w serwisie źródłowym.

### Secondary
- **Brak duplikatów (Deduplication Rate)**: 100% dostarczonych powiadomień to unikalne oferty (użytkownik nigdy nie otrzymuje powiadomienia o tej samej ofercie dwukrotnie).
- **Niezawodność cyklu (Uptime & Success Rate)**: >98% udanych cykli parsowania i wysyłki powiadomień bez awarii procesu w tle.

### Guardrails
- **Ochrona przed zablokowaniem IP (Rate Limiting)**: Zapytania do portalu ogłoszeniowego wykonywane w bezpiecznych odstępach (min. 3–5 s), zapobiegające błędom HTTP 429 i weryfikacjom CAPTCHA.
- **Odporność na błędy (Resilience)**: Przejściowe błędy sieciowe oraz chwilowa niedostępność portalu źródłowego są obsługiwane przez polityki ponowień (np. Polly) bez zatrzymania usugi w tle.

## User Stories

### US-01: Dodawanie nowej reguły śledzenia ofert
- **Given** użytkownik połączony z botem Telegram
- **When** wysyła komendę `/add <URL> --max-price <KWOTA>` z adresem URL
- **Then** system waliduje link, zapisuje regułę w bazie danych i potwierdza dodanie wiadomością zwrotną

#### Acceptance Criteria
- Podany link jest walidowany przed zapisem (sprawdzenie domeny i poprawnej struktury URL)
- Niepoprawny lub nieobsługiwany link zwraca natychmiastowy komunikat o błędzie bez zapisywania w bazie
- Opcjonalny parametr `--max-price` poprawnie filtruje oferty powyżej podanej kwoty

### US-02: Błyskawiczne powiadomienie Telegram o nowej okazji
- **Given** aktywna reguła monitorowania w bazie danych
- **When** Background Worker wykryje nowe ogłoszenie spełniające kryteria na portalu źródłowym
- **Then** wysyłana jest wiadomość na Telegram z widocznym zdjęciem, tytułem, ceną oraz bezpośrednim przyciskiem do ogłoszenia

#### Acceptance Criteria
- Czas dostarczenia wiadomości wynosi poniżej 5 minut od publikacji ogłoszenia na portalu
- Przycisk "Zobacz ogłoszenie" otwiera bezpośrednio stronę ogłoszenia na portalu źródłowym
- Oferty raz powiadomione są zapisywane i nie generują ponownych alertów (deduplikacja)

### US-03: Przeglądanie i usuwanie aktywnych reguł
- **Given** użytkownik z utworzonymi regułami monitorowania
- **When** wysyła komendę `/list` lub `/delete <ID>`
- **Then** otrzymuje czytelną listę swoich reguł lub potwierdzenie usunięcia wybranej reguły

#### Acceptance Criteria
- Komenda `/list` wyświetla ID reguły, adres URL oraz ustawiony filtr ceny maksymalnej
- Komenda `/delete <ID>` trwale usuwa regułę i zatrzymuje jej śledzenie przez Background Worker

## Functional Requirements

- FR-001: Użytkownik może zarejestrować swoje Chat ID wysyłając komendę `/start` do bota Telegram. Priority: must-have
- FR-002: Użytkownik może dodać nową regułę monitorowania podając URL z portalu (np. OLX) z opcjonalnym filtrem ceny maksymalnej (`/add <URL> --max-price <KWOTA>`). Priority: must-have
- FR-003: System (Background Worker) może cyklicznie pobierać i parsować ogłoszenia ze zdefiniowanych adresów URL. Priority: must-have
- FR-004: System może identyfikować unikalne oferty na podstawie unikalnego ID ogłoszenia (OfferID) i odrzucać duplikaty. Priority: must-have
- FR-005: System może wysłać sformatowane powiadomienie Telegram (ze zdjęciem, tytułem, ceną i przyciskiem URL) dla nowo wykrytej oferty. Priority: must-have
- FR-006: Użytkownik może wyświetlić listę swoich aktywnych reguł monitorowania z ich identyfikatorami (`/list`). Priority: must-have
- FR-007: Użytkownik może usunąć aktywną regułę monitorowania za pomocą jej ID (`/delete <ID>`). Priority: must-have
- FR-008: System może walidować strukturę i domenę podanego adresu URL przed zapisaniem reguły i odrzucać nieprawidłowe linki z komunikatem błędu. Priority: must-have

## Non-Functional Requirements

- NFR-001: Czas dostarczenia wiadomości Telegram od momentu przetworzenia nowej oferty w cyklu nie przekracza 5 sekund.
- NFR-002: Usługa w tle wywołuje cykl odświeżania wyników dla zdefiniowanej reguły z ustaloną częstotliwością (np. 5 minut).
- NFR-003: Zapytania HTTP do portalu ogłoszeniowego zachowują odstęp minimum 3 sekund między żądaniami dla ochrony przed blokadą IP.
- NFR-004: Przejściowe awarie zapytania HTTP ponawiane są maksymalnie 3-krotnie z logowaniem błędu, nie powodując zatrzymania całego procesu w tle.

## Business Logic

Główną regułą biznesową systemu jest deterministyczna detekcja unikalnych, nieprzetworzonych ofert z serwisów ogłoszeniowych i ich filtrowanie według zdefiniowanych kryteriów cenowych, gwarantująca natychmiastowe jednorazowe powiadomienie użytkownika.

System odczytuje ze zdefiniowanego adresu URL listę ogłoszeń, wyciąga unikalne identyfikatory zewnętrznych ofert (OfferID) oraz odpowiadające im metadane (tytuł, cena, URL zdjęcia, URL oferty). Otrzymany zestaw ofert jest porównywany z dotychczas zapisaną historią powiadomień. Tylko oferty nieistniejące w bazie i spełniające warunek cenowy (`Cena <= MaxPrice`) wyzwalają wysyłkę wiadomości i są natychmiast utwalane jako przetworzone.

## Non-Goals

- Brak obsługi wielu portali w MVP — wersja v1 wspiera wyłącznie OLX.pl.
- Brak graficznego interfejsu WWW / Dashboardu — zarządzanie wyłącznie za pomocą bota Telegram.
- Brak algorytmów sztucznej inteligencji i szacowania opłacalności oferty — system filtrowania bazuje wyłącznie na cenie ustalonej przez użytkownika.
- Brak modelu wielo-użytkownikowego SaaS, systemów płatności czy rejestracji kont przez przeglądarkę.
