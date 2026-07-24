# DealHunter Azure App Service Deployment Guide (GitHub Actions)

A comprehensive guide describing the automated cloud infrastructure setup (Azure Bicep) and CI/CD pipelines (GitHub Actions) for the **DealHunter** application.

---

## Prerequisites

1. Active account and subscription on [Azure Portal](https://portal.azure.com/).
2. Project repository hosted on GitHub with administrative permissions.
3. A Telegram bot created via [@BotFather](https://t.me/BotFather) along with its `BotToken` and `ChatId`.

---

## Automated Infrastructure (Azure Bicep)

The entire application infrastructure (Linux B1 App Service Plan + Web App with persistent data volume for SQLite) is 100% defined in `infra/main.bicep`.

**You do not need to manually configure resources in the Azure Portal**. The `cd.yml` pipeline in GitHub Actions automatically connects to your Azure account, provisions required resources via the Bicep template, and deploys the compiled application and web client.

---

## Configuring Secrets in GitHub Repositories

Navigate to your repository on GitHub: **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following secrets:

| Secret Name | Value / Description |
| --- | --- |
| `AZURE_CREDENTIALS` | JSON credentials (Service Principal) generated via CLI command: `az ad sp create-for-rbac --sdk-auth` |
| `AZURE_SUBSCRIPTION_ID` | Your Azure Subscription ID. |
| `AZURE_RESOURCE_GROUP` | *(Optional)* Azure Resource Group name (e.g. `rg-dealhunter-prod`). |
| `AZURE_WEBAPP_NAME` | *(Optional)* Azure Web App service name (e.g. `dealhunter-app`). |
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot token obtained from `@BotFather`. |
| `TELEGRAM_CHAT_ID` | Your Telegram Chat ID. |
| `WEB_PANEL_PIN` | Authorization PIN code for the Web Admin Panel (Admin PIN). |

> **Note (Variable Mapping):** Secret names in GitHub (e.g., `TELEGRAM_BOT_TOKEN`, `WEB_PANEL_PIN`) are automatically passed by the CD pipeline to Azure App Service settings with .NET prefixes (e.g., `Telegram__BotToken`, `Panel__WebPanelPin`). ASP.NET Core automatically binds them to the `Telegram` and `Panel` configuration sections.

---

## CI/CD Pipeline (GitHub Actions Workflows)

Two automated workflows are configured in the repository:

1. **`CI` (`.github/workflows/ci.yml`)**:
   - Triggers on every **Pull Request** targeting the `main` branch.
   - Executes `dotnet build` and `dotnet test`.

2. **`CD` (`.github/workflows/cd.yml`)**:
   - Triggers upon **merging** code to the `main` branch (or via manual workflow dispatch in GitHub Actions).
   - Automatically logs in to Azure using `AZURE_CREDENTIALS`.
   - Deploys `infra/main.bicep` — Azure automatically provisions the app service and environment.
   - Builds the frontend web app, publishes the .NET 10 Web API, and deploys the package to Azure App Service.

---

## Verifying Application Execution on Azure

After the CD workflow completes:
1. The SQLite database will be automatically initialized at `/home/data/dealhunter.db`.
2. The background service (`IHostedService`) will begin periodic monitoring of configured OLX rules and sending Telegram notifications.
3. Application logs are available in Azure Portal: **App Service** -> **Log stream**.
