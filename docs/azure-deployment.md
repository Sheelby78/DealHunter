# Instrukcja Wdrażania DealHunter na Azure App Service (GitHub Actions)

Podręcznik opisujący proces automatycznej konfiguracji infrastruktury chmurowej (Azure Bicep) oraz potoków CI/CD (GitHub Actions) dla aplikacji **DealHunter**.

---

## Wymagania Wstępne

1. Aktywne konto i subskrypcja na [Azure Portal](https://portal.azure.com/).
2. Repozytorium projektu w usłudze GitHub z uprawnieniami administratora.
3. Bot stworzony na Telegramie (poprzez `@BotFather`) oraz pobrany `BotToken` i `ChatId`.

---

## Automatyczna Infrastruktura (Azure Bicep)

Cała infrastruktura aplikacji (App Service Plan Linux B1 + Web App z wolumenem danych dla SQLite) jest w 100% zdefiniowana w pliku `infra/main.bicep`.

**Nie musisz wyklikiwać aplikacji ani serwera w Azure Portal**. Potok `cd.yml` w GitHub Actions sam połączy się z Twoim Azure, utworzy potrzebne zasoby przy użyciu pliku Bicep i wgra skompilowaną aplikację.

---

## Konfiguracja Sekretów w GitHub Repositories

Przejdź do repozytorium na GitHubie: **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Dodaj następujące sekrety:

| Nazwa Sekretu | Wartość / Opis |
| --- | --- |
| `AZURE_CREDENTIALS` | JSON z danymi dostępowymi (Service Principal) wygenerowanymi komendą: `az ad sp create-for-rbac --sdk-auth` |
| `AZURE_SUBSCRIPTION_ID` | Identyfikator Twojej subskrypcji Azure (Subscription ID). |
| `AZURE_RESOURCE_GROUP` | *(Opcjonalnie)* Nazwa grupy zasobów w Azure (np. `rg-dealhunter-prod`). |
| `AZURE_WEBAPP_NAME` | *(Opcjonalnie)* Nazwa usługi Web App w Azure (np. `dealhunter-app`). |
| `TELEGRAM_BOT_TOKEN` | Token Twojego bota Telegram pobrany od `@BotFather`. |
| `TELEGRAM_CHAT_ID` | Twój identyfikator czatu Telegram. |

---

## Przepływ CI/CD (GitHub Actions Workflows)

W repozytorium skonfigurowane są dwa automatyczne potoki:

1. **`CI` (`.github/workflows/ci.yml`)**:
   - Wyzwala się przy każdym **Pull Requeście** zmierzającym do gałęzi `main`.
   - Wykonuje `dotnet build` oraz `dotnet test`.

2. **`CD` (`.github/workflows/cd.yml`)**:
   - Wyzwala się po **scaleniu (merge)** kodu do gałęzi `main` (lub przy ręcznym wyzwoleniu w GitHub Actions).
   - Automatycznie loguje się do Azure (`AZURE_CREDENTIALS`).
   - Uruchamia `infra/main.bicep` — Azure sam stawia serwer i aplikację.
   - Buduje i wgrywa paczkę .NET 10 do utworzonego App Service.

---

## Weryfikacja Działania Aplikacji na Azure

Po zakończeniu działania workflowu CD:
1. Baza danych SQLite zostanie automatycznie zainicjalizowana pod ścieżką `/home/site/wwwroot/data/dealhunter.db`.
2. Usługa w tle `IHostedService` rozpocznie cykliczny monitoring zdefiniowanych reguł OLX i powiadamianie na Telegramie.
3. Logi aplikacji są dostępne w Azure Portal: **App Service** -> **Log stream**.
