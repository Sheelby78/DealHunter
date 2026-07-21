---
project: "DealHunter"
version: 1
status: draft
created: 2026-07-21
context_type: greenfield
product_type: api
target_scale:
  users: small
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 4
  hard_deadline: null
  after_hours_only: true
---

# DealHunter — Product Requirements Document (PRD)

## Vision & Problem Statement

Atrakcyjne cenowo oferty na portalach ogłoszeniowych znikają w ciągu kilku-kilkunastu minut od publikacji. Osoby poszukujące używanego sprzętu oraz okazjonalni łowcy okazji tracą mnóstwo czasu na ciągłe, uciążliwe, ręczne odświeżanie stron w przeglądarce, a i tak często przegrywają z szybszymi kupującymi.

Istniejące natywne powiadomienia serwisów ogłoszeniowych działają ze znacznym opóźnieniem. Stworzenie narzędzia błyskawicznie wykrywającego nowe ogłoszenia i dostarczającego natychmiastowe alerty daje użytkownikowi decydującą przewagę czasową.

## User & Persona

### Primary Persona
- **Role**: Osoba prywatna / hobbysta poszukujący konkretnego sprzętu (np. elektroniki, instrumentów, części) do własnego użytku.
- **Context**: Monitoruje wybrane kategorie lub frazy kluczowe, zależy jej na szybkim przechwyceniu okazyjnej oferty zanim ubiegną ją inni.
- **Trigger**: Nowo opublikowane ogłoszenie spełniające kryteria wyszukiwania.

## Success Criteria

### Primary
- **Czas reakcji (Latency)**: System wykrywa i dostarcza powiadomienie o nowej ofercie w czasie < 5 minut od jej opublikowania w serwisie źródłowym.

### Secondary
- **Brak duplikatów (Deduplication Rate)**: 100% dostarczonych powiadomień to unikalne oferty (użytkownik nigdy nie otrzymuje powiadomienia o tej samej ofercie dwukrotnie).
- **Niezawodność cyklu (Uptime & Success Rate)**: >98% udanych cykli parsowania i wysyłki powiadomień bez awarii procesu w tle.

### Guardrails
- **Ochrona przed zablokowaniem IP (Rate Limiting)**: Zapytania do portalu ogłoszeniowego wykonywane w bezpiecznych odstępach (min. 3–5 s), zapobiegające blokadom zapytań.
- **Odporność na błędy (Resilience)**: Przejściowe błędy sieciowe oraz chwilowa niedostępność portalu źródłowego są obsługiwane przez automatyczne polityki ponowień bez zatrzymania usługi w tle.

## User Stories

### US-01: Dodawanie nowej reguły śledzenia ofert

- **Given** użytkownik połączony z botem powiadomień
- **When** wysyła komendę dodania reguły z adresem URL
- **Then** system waliduje link, zapisuje regułę i potwierdza dodanie wiadomością zwrotną

#### Acceptance Criteria
- Podany link jest walidowany przed zapisem (sprawdzenie domeny i poprawnej struktury URL)
- Niepoprawny lub nieobsługiwany link zwraca natychmiastowy komunikat o błędzie bez zapisywania
- Opcjonalny parametr ceny maksymalnej poprawnie filtruje oferty powyżej podanej kwoty

### US-02: Błyskawiczne powiadomienie o nowej okazji

- **Given** aktywna reguła monitorowania
- **When** system wykryje nowe ogłoszenie spełniające kryteria na portalu źródłowym
- **Then** wysyłana jest wiadomość z widocznym zdjęciem, tytułem, ceną oraz bezpośrednim przyciskiem do ogłoszenia

#### Acceptance Criteria
- Czas dostarczenia wiadomości wynosi poniżej 5 minut od publikacji ogłoszenia na portalu
- Przycisk "Zobacz ogłoszenie" otwiera bezpośrednio stronę ogłoszenia na portalu źródłowym
- Oferty raz powiadomione są zapisywane i nie generują ponownych alertów (deduplikacja)

### US-03: Przeglądanie i usuwanie aktywnych reguł

- **Given** użytkownik z utworzonymi regułami monitorowania
- **When** wysyła komendę wyświetlenia listy lub usunięcia reguły po ID
- **Then** otrzymuje czytelną listę swoich reguł lub potwierdzenie usunięcia wybranej reguły

#### Acceptance Criteria
- Wyświetlanie listy ukazuje ID reguły, adres URL oraz ustawiony filtr ceny maksymalnej
- Komenda usunięcia trwale kasuje regułę i zatrzymuje jej śledzenie

## Functional Requirements

- FR-001: Użytkownik może zarejestrować swój identyfikator powiadomień wysyłając komendę `/start` do bota. Priority: must-have
- FR-002: Użytkownik może dodać nową regułę monitorowania podając URL z portalu (np. OLX) z opcjonalnym filtrem ceny maksymalnej (`/add <URL> --max-price <KWOTA>`). Priority: must-have
- FR-003: System może cyklicznie pobierać i parsować ogłoszenia ze zdefiniowanych adresów URL. Priority: must-have
- FR-004: System może identyfikować unikalne oferty na podstawie unikalnego ID ogłoszenia (OfferID) i odrzucać duplikaty. Priority: must-have
- FR-005: System może wysłać sformatowane powiadomienie (ze zdjęciem, tytułem, ceną i przyciskiem URL) dla nowo wykrytej oferty. Priority: must-have
- FR-006: Użytkownik może wyświetlić listę swoich aktywnych reguł monitorowania z ich identyfikatorami (`/list`). Priority: must-have
- FR-007: Użytkownik może usunąć aktywną regułę monitorowania za pomocą jej ID (`/delete <ID>`). Priority: must-have
- FR-008: System może walidować strukturę i domenę podanego adresu URL przed zapisaniem reguły i odrzucać nieprawidłowe linki z komunikatem błędu. Priority: must-have

## Non-Functional Requirements

- NFR-001: Czas dostarczenia powiadomienia od momentu przetworzenia nowej oferty w cyklu nie przekracza 5 sekund.
- NFR-002: System wywołuje cykl odświeżania wyników dla zdefiniowanej reguły z ustaloną częstotliwością (np. 5 minut).
- NFR-003: Zapytania do portalu ogłoszeniowego zachowują odstęp minimum 3 sekund między żądaniami dla ochrony przed blokadą IP.
- NFR-004: Przejściowe awarie zapytań są ponawiane maksymalnie 3-krotnie z logowaniem błędu, nie powodując zatrzymania pracy całego systemu.

## Business Logic

Główną regułą biznesową systemu jest deterministyczna detekcja unikalnych, nieprzetworzonych ofert z serwisów ogłoszeniowych i ich filtrowanie według zdefiniowanych kryteriów cenowych, gwarantująca natychmiastowe jednorazowe powiadomienie użytkownika.

System odczytuje ze zdefiniowanego adresu URL listę ogłoszeń, wyciąga unikalne identyfikatory zewnętrznych ofert (OfferID) oraz odpowiadające im metadane (tytuł, cena, URL zdjęcia, URL oferty). Otrzymany zestaw ofert jest porównywany z dotychczas zapisaną historią powiadomień. Tylko oferty nieistniejące w bazie i spełniające warunek cenowy (`Cena <= MaxPrice`) wyzwalają wysyłkę wiadomości i są natychmiast utwalane jako przetworzone.

## Access Control

Jedno-użytkownikowa / osobista instancja aplikacji. Dostęp autoryzowany poprzez unikalny identyfikator użytkownika (Chat ID). Brak konieczności tworzenia kont WWW i zarządzania uprawnieniami w wersji MVP.

## Non-Goals

- Brak obsługi wielu portali w MVP — wersja v1 wspiera wyłącznie OLX.pl.
- Brak graficznego interfejsu WWW / Dashboardu — zarządzanie odbywa się wyłącznie przez interfejs bota powiadomień.
- Brak algorytmów sztucznej inteligencji i szacowania opłacalności oferty — system filtrowania bazuje wyłącznie na cenie ustalonej przez użytkownika.
- Brak modelu wielo-użytkownikowego SaaS, systemów płatności czy rejestracji kont przez przeglądarkę.

## Open Questions

1. **Szczegółowy format komendy Telegram dla zaawansowanych filtrów**: Czy w wersji MVP opcja `--max-price` wystarczy, czy będą potrzebne inne filtry (np. warunki dostawy)? — Odpowiedź: Na etapie MVP wystarczy parametr `--max-price`.
