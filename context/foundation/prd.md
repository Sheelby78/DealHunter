---
project: "DealHunter"
version: 2
status: draft
created: 2026-07-23
context_type: brownfield
product_type: web-app
target_scale:
  users: small
timeline_budget:
  delivery_weeks: 1
  hard_deadline: null
  after_hours_only: true
---

## Current System Overview
System DealHunter to bot na Telegramie oparty o C# / .NET 10.0, który monitoruje oferty z OLX i wysyła natychmiastowe powiadomienia. Użytkowany przez pojedynczego hobbystę. Zarządzanie regułami odbywa się obecnie poprzez ręczne wpisywanie komend na Telegramie (np. `/add`, `/list`, `/delete`), co staje się uciążliwe przy bardziej skomplikowanych konfiguracjach. Zmiana polega na dodaniu interfejsu graficznego WWW. Aplikacja w trakcie wdrażania może doświadczyć chwilowej przerwy w działaniu.

## Problem Statement & Motivation
Zarządzanie regułami poprzez wpisywanie komend w Telegramie jest niewygodne i podatne na błędy (literówki). Stworzenie dedykowanego panelu webowego (Dashboardu) pozwoli na łatwe, wizualne dodawanie, przeglądanie i usuwanie reguł, kładąc fundament pod obsługę znacznie bardziej zaawansowanych filtrów (wykluczanie słów, opcje dostawy) w przyszłości.

## User & Persona
Pojedynczy hobbysta / właściciel bota, poszukujący wygodnego sposobu zarządzania swoimi regułami wyszukiwania bez konieczności używania interfejsu konwersacyjnego z botem.

## Success Criteria

### Primary
1. Użytkownik wchodzi na adres panelu WWW.
2. Wpisuje poprawny PIN.
3. Widzi czytelną listę wszystkich aktualnie monitorowanych reguł.
4. Może wypełnić prosty formularz (URL i Max Price), aby dodać nową regułę.
5. Może usunąć istniejącą regułę z listy jednym kliknięciem.

### Secondary
Aplikacja ma nowoczesny, bardzo estetyczny i dynamiczny wygląd (zgodnie z pryncypiami projektowania nowoczesnych stron WWW) i jest czytelna na telefonie.

### Guardrails
- Dodanie panelu WWW nie może zakłócić głównej pętli monitorowania ofert.
- Powiadomienia nadal bez zakłóceń i opóźnień trafiają na Telegram (w tej fazie powiadomienia web push nie są wdrażane).

## User Stories

### US-01: Zarządzanie regułami
- **Given** zalogowany przez PIN użytkownik w panelu WWW
- **When** wypełnia formularz i klika "Zapisz"
- **Then** nowa reguła pojawia się na liście i system backendowy natychmiast rozpoczyna monitorowanie tego adresu na OLX

## Scope of Change
- [new] Użytkownik może autoryzować się w panelu WWW przy użyciu ustalonego numeru PIN.
- [new] Użytkownik może przeglądać listę aktywnych reguł w panelu WWW.
- [new] Użytkownik może dodać nową regułę (podając URL i maksymalną cenę) poprzez formularz WWW.
- [new] Użytkownik może usunąć istniejącą regułę klikając przycisk w panelu WWW.
- [preserved] Główna usługa kontynuuje wysyłkę alertów przez Telegram (integracja zachowana).

## Constraints & Compatibility
Architektura w .NET (API) musi zostać rozszerzona o endpointy REST lub SignalR niezbędne dla frontendu (do operacji pobierania, dodawania, usuwania i weryfikacji PIN). Baza danych lub mechanizm przechowywania reguł nie ulega fundamentalnej zmianie.

## Business Logic Changes
Brak zmian w logice domenowej. To zmiana czysto infrastrukturalna i interfejsowa. Dotychczasowa logika wyszukiwania, deduplikacji i wysyłania powiadomień pozostaje w 100% zachowana.

## Access Control Changes
Dostęp do panelu WWW chroniony jest za pomocą jednego, globalnego numeru PIN (hasła dostępu). Nie używamy skomplikowanego logowania (konta, maile), ponieważ to wewnętrzne narzędzie dla jednej osoby, wystawione jednak w publicznym internecie.

## Non-Goals
- Powiadomienia bezpośrednio w przeglądarce (Web Push) – pozostajemy na Telegramie.
- Rozbudowane zarządzanie kontami, ról użytkowników, przypominanie hasła.
- Dodawanie obsługi Allegro/Vinted (te nowe systemy zbudujemy w Kolejnej Fazie, gdy fundament WWW będzie gotowy).

## Open Questions
Brak (wymagania są kompletne).
