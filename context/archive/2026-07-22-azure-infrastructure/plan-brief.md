# Azure Infrastructure & GitHub Actions CI/CD — Plan Brief

> Full plan: `file:///C:/Users/sheel/Documents/.NET/DealHunter/context/changes/azure-infrastructure/plan.md`

## What & Why

Skonfigurowanie bezobsługowej, powtarzalnej infrastruktury na Azure (IaC) oraz automatycznych potoków CI/CD w GitHub Actions dla aplikacji DealHunter. Umożliwi to automatyczne uruchamianie testów przy każdym Pull Requeście oraz automatyczny deployment zaktualizowanej aplikacji na Azure App Service (z bazą SQLite na trwałym wolumenie) po scaleniu kodu do gałęzi `main`.

## Starting Point

Obecnie aplikacja posiada kompletny kod w C# / .NET 10.0 z czystą architekturą (Clean Architecture), ale brak w niej jakichkolwiek plikow konfiguracyjnych dla Azure (IaC / Bicep) oraz katalogu `.github/workflows/` z potokami CI/CD.

## Desired End State

1. Deklaratywne szablony Azure Bicep (`infra/main.bicep`) definiujące serwer App Service (Linux) oraz skonfigurowaną aplikację Web App.
2. Automatyczny pipeline CI (`.github/workflows/ci.yml`) sprawdzający i testujący kod przy każdym PR.
3. Automatyczny pipeline CD (`.github/workflows/cd.yml`) wdrażający infrastrukturę Bicep oraz aplikację .NET po scaleniu do `main`.
4. Baza danych SQLite działająca niezawodnie w trwałym katalogu danych `/home/site/wwwroot/data/dealhunter.db` bez ryzyka utraty przy restarcie.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Hosting Model | Azure App Service (Linux, .NET 10) | Najprostsza, bezobsługowa usługa PaaS wspierająca wbudowane zadania w tle `IHostedService`. | Plan |
| IaC Tooling | Azure Bicep (`main.bicep`) | Deklaratywne, natywne rozwiązanie Microsoftu zintegrowane z GitHub Actions. | Plan |
| Database Engine | SQLite (Trwały storage App Service) | Zero kosztów utrzymania osobnego serwera bazy danych w fazie MVP. | User Choice |
| CI/CD Pipeline | Dwa osobne workflowy (`ci.yml` + `cd.yml`) | Wyraźny podział na szybką walidację PR oraz produkcyjny deployment z rejestracją sekretów. | Plan |

## Scope

**In scope:**
- Tworzenie szablonów Azure Bicep (`infra/main.bicep`, `infra/main.bicepparam`).
- Tworzenie potoków GitHub Actions: `ci.yml` (PR check) oraz `cd.yml` (Build & Deploy to Azure).
- Konfiguracja SQLite dla środowiska chmurowego (trwały katalog dyskowy).
- Instrukcja konfiguracji sekretów GitHub (`AZURE_PUBLISH_PROFILE`, `TELEGRAM_BOT_TOKEN`, itp.).

**Out of scope:**
- Konteneryzacja w Docker / Azure Container Apps (wybrany natywny runtime App Service).
- Płatne zarządzane bazy danych (PostgreSQL / Azure SQL).
- Złożona infrastruktura sieciowa (VNet / Private Endpoints).

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Azure Bicep IaC | Szablony Bicep dla App Service Plan i Web App z właściwymi zmiennymi | Błędne uprawnienia lub zła nazwa SKUs w Azure |
| 2. CI/CD Workflows | Pliki `ci.yml` i `cd.yml` dla GitHub Actions | Błędy autoryzacji z GitHub Secrets / Azure Publish Profile |
| 3. SQLite & App Service Readiness | Dostosowanie ścieżki SQLite i automatyczne tworzenie katalogu danych na Azure | Utrata pliku bazy danych przy redeployu (obsłużona przez `WEBSITES_ENABLE_APP_SERVICE_STORAGE`) |
| 4. Verification & Documentation | Kompletny poradnik wdrażania oraz weryfikacja lokalna i na CI | Niedopatrzenie wymaganych zmiennych środowiskowych w instrukcji |

**Prerequisites:** Dostęp do subskrypcji Azure oraz uprawnienia do tworzenia repozytoryjnych sekretów w GitHub.  
**Estimated effort:** ~1-2 sesje pracy.

## Success Criteria (Summary)

- Wszystkie testy jednostkowe i integracyjne przechodzą na CI przed dopuszczeniem kodu do `main`.
- Po scaleniu PR do `main`, kod automatycznie buduje się i wdraża na Azure App Service.
- Aplikacja po wdrożeniu poprawnie inicjalizuje bazę SQLite na trwałym wolumenie dyskowym i kontynuuje cykliczny monitoring OLX.
