# Azure Infrastructure & GitHub Actions CI/CD Implementation Plan

## Overview

Niniejszy plan opisuje wdrożenie pełnej infrastruktury chmurowej w postaci kodu (Infrastructure as Code - IaC przy użyciu Azure Bicep) oraz skonfigurowanie automatycznych potoków CI/CD (GitHub Actions) dla projektu DealHunter. Aplikacja .NET 10.0 zostanie przygotowana do bezobsługowego uruchamiania na chmurze Azure App Service (Linux) z wykorzystaniem bezkosztowej bazy SQLite umieszczonej na trwałym wolumenie dyskowym serwera.

## Current State Analysis

- Aplikacja .NET 10.0 posiada strukturę Clean Architecture (`DealHunter.Api`, `DealHunter.Application`, `DealHunter.Domain`, `DealHunter.Infrastructure`, `DealHunter.Tests`).
- W repozytorium brak konfiguracji infrastruktur w chmurze (`infra/` nie istnieje).
- W repozytorium brak potoków ciągłej integracji i wdrażania (`.github/workflows/` jest pusty).
- Kod w `DealHunter.Infrastructure` korzysta z SQLite (EF Core).

## Desired End State

- W pełni powtarzalna infrastruktura zdefiniowana deklaratywnie w plikach Azure Bicep (`infra/main.bicep`).
- Workflow CI (`.github/workflows/ci.yml`) uruchamiający build i testy na każdym Pull Requeście.
- Workflow CD (`.github/workflows/cd.yml`) wdrażający infrastrukturę Bicep oraz opublikowany pakiet .NET do Azure App Service przy każdym commitcie do `main`.
- Automatyczne tworzenie katalogu dla pliku SQLite w chmurze z zachowaniem trwałości danych między wdrażaniem nowszych wersji aplikacji.

### Key Discoveries:
- Szablon Bicep wymaga ustawienia flagi `WEBSITES_ENABLE_APP_SERVICE_STORAGE = true`, aby katalog `/home/site/wwwroot/data` zachowywał trwałość podczas restartów i wdrożeń nowych wersji aplikacji.
- `dotnet publish` tworzy skompilowaną paczkę gotową do bezpośredniego wdrożenia na Linux App Service bez konieczności tworzenia obrazów Docker.

## What We're NOT Doing

- Nie tworzymy obrazów kontenerowych Docker ani repozytorium Azure Container Registry (ACR) — używamy natywnego środowiska uruchomieniowego .NET w Azure App Service.
- Nie konfigurujemy płatnych baz managed (Azure SQL / PostgreSQL) — wykorzystujemy SQLite na trwałym dysku App Service.
- Nie ustawiamy skomplikowanych reguł sieciowych Virtual Network (VNet) ani Private Endpoints w fazie MVP.

## Implementation Approach

1. **Phase 1 (IaC)**: Utworzenie szablonów Azure Bicep definiujących App Service Plan (skalowalny Linux B1/F1) oraz Web App ze zdefiniowanymi ustawieniami aplikacji (App Settings).
2. **Phase 2 (CI/CD)**: Stworzenie potoków GitHub Actions — `ci.yml` do automatycznej weryfikacji kodów i testów oraz `cd.yml` do budowy, testów, aplikowania Bicep i wdrażania na Azure Web App.
3. **Phase 3 (App Readiness)**: Weryfikacja i przygotowanie ścieżek bazodanowych w kodzie C#, aby automatycznie tworzyły folder bazodanowy pod wskazaną ścieżką z konfiguracji.
4. **Phase 4 (Docs & Secrets)**: Przygotowanie dokumentacji krok-po-kroku z opisem konfiguracji sekretów GitHub (`AZURE_PUBLISH_PROFILE`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).

## Critical Implementation Details

- **Trwałość danych SQLite**: Ścieżka SQLite w środowisku produkcyjnym Azure musi wskazywać na trwale podmontowany wolumen systemowy `/home/site/wwwroot/data/dealhunter.db`. W szablonie Bicep należy upewnić się, że w zmiennych środowiskowych Web App ustawione są odpowiednie parametry.
- **Uprawnienia / Autoryzacja**: Najprostszym i najbardziej niezawodnym sposobem autoryzacji deploymentu w GitHub Actions bez skomplikowanych ról Azure RBAC jest wykorzystanie `AZURE_PUBLISH_PROFILE` pobranego bezpośrednio z Azure Web App.

---

## Phase 1: Infrastructure as Code (Azure Bicep)

### Overview
Stworzenie deklaratywnych szablonów Bicep definiujących zasoby chmurowe Azure niezbędne do uruchomienia aplikacji.

### Changes Required:

#### 1. Szablon zasobów Azure Bicep
**File**: `infra/main.bicep`  
**Intent**: Zdefiniowanie App Service Plan (Linux) oraz Web App dla .NET 10.0 z odpowiednimi ustawieniami zmiennych środowiskowych.  
**Contract**: Deklaratywny plik Bicep akceptujący parametry `appName`, `environment` oraz `location`.

#### 2. Parametry szablonu Bicep
**File**: `infra/main.bicepparam`  
**Intent**: Podanie domyślnych wartości parametrów dla środowiska produkcyjnego.  
**Contract**: Plik Bicepparam wskazujący na `main.bicep`.

### Success Criteria:

#### Automated Verification:
- Walidacja pliku Bicep za pomocą Azure CLI przechodzi pomyślnie: `az bicep build --file infra/main.bicep`

#### Manual Verification:
- Szablon Bicep zawiera poprawne definicje zmiennych środowiskowych dla SQLite oraz Telegram bota.

---

## Phase 2: GitHub Actions CI/CD Workflows

### Overview
Utworzenie dwóch automatycznych potoków budowania, testowania i wdrażania aplikacji w GitHub Actions.

### Changes Required:

#### 1. Potok walidacji Pull Requestów (CI)
**File**: `.github/workflows/ci.yml`  
**Intent**: Automatyczne sprawdzanie poprawności kompilacji oraz uruchamianie testów jednostkowych dla każdego Pull Requesta kierowanego do `main`.  
**Contract**: Workflow wyzwalany na `pull_request: branches: [ main ]` zawierający kroki: checkout, setup .NET 10, dotnet restore, dotnet build, dotnet test.

#### 2. Potok wdrożeniowy produkcyjny (CD)
**File**: `.github/workflows/cd.yml`  
**Intent**: Budowanie, testowanie, aplikowanie Bicep i wdrażanie aplikacji na Azure App Service po scaleniu zmian do `main`.  
**Contract**: Workflow wyzwalany na `push: branches: [ main ]` zawierający kroki: checkout, setup .NET 10, dotnet test, dotnet publish, az deployment group create (lub arm-deploy), azure/webapps-deploy.

### Success Criteria:

#### Automated Verification:
- Składnia plików YAML w `.github/workflows/` jest poprawna.
- Komenda `dotnet test DealHunter.slnx` wykonuje się bez błędów.

#### Manual Verification:
- Po scaleniu PR do `main`, potok `cd.yml` poprawnie publikuje paczkę na serwerze Azure.

---

## Phase 3: SQLite & Azure App Service Path Preparation

### Overview
Dostosowanie konfiguracji połączenia bazy danych w C# tak, aby na środowisku Azure baza SQLite automatycznie zakładała wymagany katalog dyskowy.

### Changes Required:

#### 1. Konfiguracja domyślna bazy danych
**File**: `DealHunter.Api/appsettings.json`  
**Intent**: Zapewnienie elastycznego connection stringa wspierającego zmienne środowiskowe z Azure App Settings.  
**Contract**: `ConnectionStrings:DefaultConnection` w postaci `"Data Source=data/dealhunter.db"`.

#### 2. Uruchamianie migracji / Tworzenie katalogu bazy
**File**: `DealHunter.Api/Program.cs`  
**Intent**: Upewnienie się, że podczas startu aplikacji katalog docelowy pliku SQLite istnieje na dysku serwera.  
**Contract**: Wywołanie logiki zapewniającej istnienie katalogu przed aplikacją migracji EF Core.

### Success Criteria:

#### Automated Verification:
- Projekt kompiluje się bez błędów: `dotnet build DealHunter.slnx`
- Testy integracyjne i jednostkowe przechodzą pomyślnie: `dotnet test DealHunter.slnx`

#### Manual Verification:
- Aplikacja uruchomiona lokalnie oraz na Azure bez przeszkód zakłada i obsługuje plik bazy danych SQLite.

---

## Phase 4: Documentation & Deployment Setup Guide

### Overview
Przygotowanie kompletnej instrukcji konfiguracji sekretów i uruchomienia infrastruktury dla programisty/użytkownika.

### Changes Required:

#### 1. Przewodnik wdrożeniowy Azure
**File**: `docs/azure-deployment.md`  
**Intent**: Opisanie kroków wymaganych po stronie Azure Portal oraz GitHub Repositories (tworzenie sekretów `AZURE_PUBLISH_PROFILE`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).  
**Contract**: Dokument w formacie Markdown z czytelną instrukcją krok po kroku.

### Success Criteria:

#### Automated Verification:
- Dokument `docs/azure-deployment.md` istnieje w repozytorium.

#### Manual Verification:
- Instrukcja w sposób jednoznaczny prowadzi użytkownika przez proces pierwszej konfiguracji w chmurze Azure.

---

## Testing Strategy

### Unit & Integration Tests:
- Wykonanie pełnej paczki testów w `DealHunter.Tests` w ramach każdego przebiegu GitHub Actions.

### Manual Testing Steps:
1. Skonfigurowanie sekretów w GitHub Repository Settings.
2. Wykonanie testowego Pull Requesta i weryfikacja działania workflowu `ci.yml`.
3. Scalenie PR do `main` i weryfikacja przebiegu wdrażania `cd.yml` oraz weryfikacja działania bota na serwerze Azure App Service.

---

## Performance Considerations

- Wdrażanie aplikacji natywnie (.NET publish zip deploy) trwa zazwyczaj poniżej 2 minut w GitHub Actions.
- Wykorzystanie trwałego dysku App Service dla SQLite nie generuje narzutu sieciowego.

## Migration Notes

- Przy pierwszym wdrożeniu baza danych SQLite zostanie automatycznie utworzona na serwerze w podanej ścieżce produkcyjnej przy użyciu EF Core Migrations.

## References

- Azure Bicep Documentation: `https://learn.microsoft.com/azure/azure-resource-manager/bicep/`
- GitHub Actions for Azure Web Apps: `https://github.com/Azure/webapps-deploy`

---

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Infrastructure as Code (Azure Bicep)

#### Automated
- [x] 1.1 Walidacja pliku Bicep za pomocą Azure CLI przechodzi pomyślnie: `az bicep build --file infra/main.bicep`

#### Manual
- [x] 1.2 Szablon Bicep zawiera poprawne definicje zmiennych środowiskowych dla SQLite oraz Telegram bota.

### Phase 2: GitHub Actions CI/CD Workflows

#### Automated
- [x] 2.1 Składnia plików YAML w `.github/workflows/` jest poprawna.
- [x] 2.2 Komenda `dotnet test DealHunter.slnx` wykonuje się bez błędów.

#### Manual
- [ ] 2.3 Po scaleniu PR do `main`, potok `cd.yml` poprawnie publikuje paczkę na serwerze Azure.

### Phase 3: SQLite & Azure App Service Path Preparation

#### Automated
- [x] 3.1 Projekt kompiluje się bez błędów: `dotnet build DealHunter.slnx`
- [x] 3.2 Testy integracyjne i jednostkowe przechodzą pomyślnie: `dotnet test DealHunter.slnx`

#### Manual
- [x] 3.3 Aplikacja uruchomiona lokalnie oraz na Azure bez przeszkód zakłada i obsługuje plik bazy danych SQLite.

### Phase 4: Documentation & Deployment Setup Guide

#### Automated
- [x] 4.1 Dokument `docs/azure-deployment.md` istnieje w repozytorium.

#### Manual
- [x] 4.2 Instrukcja w sposób jednoznaczny prowadzi użytkownika przez proces pierwszej konfiguracji w chmurze Azure.

