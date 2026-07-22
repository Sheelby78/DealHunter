# DealHunter — Błyskawiczne Powiadomienia o Okazjach OLX

> **DealHunter** to zautomatyzowana aplikacja oparta na **C# / .NET 10.0**, która cyklicznie monitoruje serwisy ogłoszeniowe (np. OLX.pl) pod kątem nowych ofert i wysyła błyskawiczne powiadomienia ze szczegółami okazjonalnej oferty bezpośrednio na **Telegram**.

---

## Czym jest DealHunter?

Atrakcyjne oferty sprzętu elektronicznego, hobbystycznego czy części na portalach ogłoszeniowych potrafią zniknąć w ciągu kilku minut od publikacji. Natywne powiadomienia serwisów internetowych działają ze znacznym opóźnieniem. 

**DealHunter** rozwiązuje ten problem:
* Cyklicznie przeszukuje zdefiniowane linki OLX z ustawionymi kryteriami filtracji (np. maksymalną ceną).
* Gwarantuje **deduplikację** — każda unikalna oferta (OfferID) generuje tylko jedno powiadomienie.
* W ciągu kilku sekund od wykrycia nowej okazjonalnej oferty wysyła sformatowaną wiadomość na Telegram ze zdjęciem, ceną, tytułem oraz bezpośrednim przyciskiem do ogłoszenia.
* Zapewnia ochronę przed blokadami IP (bezpieczne odstępy zapytań) oraz obsługuje przejściowe błędy sieciowe (automatyczne retries).

---

## Architektura i Stos Technologiczny

Aplikacja została zbudowana zgodnie z zasadami **Clean Architecture**:

* **.NET 10.0 (ASP.NET Core Web API + Background Worker / `IHostedService`)**
* **MediatR** — wzorzec CQRS (Command and Query Responsibility Segregation)
* **Entity Framework Core + SQLite** — lekka i szybka baza danych przechowywana lokalnie lub na trwałym wolumenie chmurowym
* **Telegram.Bot API** — integracja z interfejsem bota Telegram
* **HtmlAgilityPack** — bezpieczne i wydajne parsowanie struktury HTML portali ogłoszeniowych
* **Polly** — polityki ponowień (retries) i odporności sieciowej

### Struktura Solucji:

```text
DealHunter.slnx
├── DealHunter.Domain/        # Czysta logika domenowa (Agregaty, Cienkie obiekty, Zdarzenia)
├── DealHunter.Application/   # Przypadki użycia (MediatR Commands/Queries, DTOs, Interfejsy)
├── DealHunter.Infrastructure/# Implementacje parserów, klienta Telegrama, bazy EF Core i Polly
├── DealHunter.Api/            # Punkt wejścia (ASP.NET Core API, Background Worker, Kontener DI)
└── DealHunter.Tests/          # Testy jednostkowe oraz integracyjne (xUnit/NSubstitute)
```

---

## Wymagania Wstępne i Konfiguracja

### Wymagania:
* [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* Konto na Telegramie oraz utworzony bot przez [@BotFather](https://t.me/BotFather) (aby uzyskać **Bot Token**)

### Zmienne Środowiskowe / Konfiguracja (`appsettings.json`):

Aplikacja wymaga podania danych bota w pliku `DealHunter.Api/appsettings.json` lub poprzez zmienne środowiskowe:

```json
{
  "Telegram": {
    "BotToken": "TWÓJ_TELEGRAM_BOT_TOKEN",
    "ChatId": "TWÓJ_CHAT_ID"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=dealhunter.db"
  }
}
```

---

## Uruchamianie Projektu Lokalnie

### 1. Budowanie projektu:
```bash
dotnet build DealHunter.slnx
```

### 2. Uruchomienie testów jednostkowych i integracyjnych:
```bash
dotnet test DealHunter.slnx
```

### 3. Uruchomienie aplikacji (API + usługa monitorująca w tle):
```bash
dotnet run --project DealHunter.Api
```

---

## Komendy Bota Telegram

Zarządzanie regułami monitorowania odbywa się bezpośrednio z poziomu czatu z botem Telegram:

| Komenda | Opis | Przykład |
| --- | --- | --- |
| `/start` | Inicjalizacja połączenia i rejestracja użytkownika | `/start` |
| `/add <URL> [--max-price <KWOTA>]` | Dodanie nowej reguły śledzenia linku OLX | `/add https://www.olx.pl/d/elektronika/ --max-price 500` |
| `/list` | Wyświetlenie listy Twoich aktywnych reguł monitorowania | `/list` |
| `/delete <ID>` | Usunięcie wybranej reguły śledzenia po podanym ID | `/delete 123` |

---

## Wdrażanie i Infrastruktura (Azure & GitHub Actions)

Projekt zawiera przygotowaną infrastrukturę w postaci kodu **Azure Bicep** oraz automatyczne potoki **GitHub Actions**:

* **CI (`.github/workflows/ci.yml`)**: Uruchamia automatyczny build oraz testy przy każdym Pull Requeście.
* **CD (`.github/workflows/cd.yml`)**: Po scaleniu do gałęzi `main` automatycznie buduje pakiet, aplikuje infrastrukturę Bicep i wdraża aplikację do **Azure App Service (Linux)** z bazą SQLite podłączoną na trwałym wolumenie dyskowym (`/home/site/wwwroot/data`).

Więcej szczegółów w dokumentacji [docs/azure-deployment.md](docs/azure-deployment.md).
