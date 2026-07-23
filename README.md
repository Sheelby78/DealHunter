# DealHunter - Instant OLX Deal Notifications

> **DealHunter** is an automated application built with **C# / .NET 10.0** that periodically monitors classified ad portals (such as OLX.pl) for new deal listings and sends instant notifications with offer details directly via **Telegram**.

---

## What is DealHunter?

Attractive deals on electronics, hobby items, or parts on classified ad portals often disappear within minutes of publication. Native website notifications operate with a significant delay.

**DealHunter** solves this problem by:
* Periodically searching configured OLX links with custom filter criteria (e.g., maximum price).
* Guaranteeing **deduplication** — each unique deal (OfferID) generates only a single notification.
* Sending a formatted Telegram message with a photo, price, title, and direct link to the listing within seconds of detecting a new deal.
* Providing protection against IP rate limits (safe request intervals) and handling transient network errors (automatic retries).

---

## Architecture and Tech Stack

The application is built following **Clean Architecture** principles:

* **.NET 10.0 (ASP.NET Core Web API + Background Worker / `IHostedService`)**
* **MediatR** — CQRS pattern implementation (Command and Query Responsibility Segregation)
* **Entity Framework Core + SQLite** — Lightweight and fast database stored locally or on a persistent cloud volume
* **Telegram.Bot API** — Integration with the Telegram bot interface
* **HtmlAgilityPack** — Safe and efficient HTML parsing of classified portal web pages
* **Polly** — Retry policies and network resilience strategies

### Solution Structure:

```text
DealHunter.slnx
├── DealHunter.Domain/        # Pure domain logic (Aggregates, Value Objects, Domain Events)
├── DealHunter.Application/   # Use cases (MediatR Commands/Queries, DTOs, Interfaces)
├── DealHunter.Infrastructure/# Implementations of parsers, Telegram client, EF Core DB, and Polly
├── DealHunter.Api/            # Entry point (ASP.NET Core API, Background Worker, DI Container)
└── DealHunter.Tests/          # Unit and integration tests (xUnit/NSubstitute)
```

---

## Prerequisites and Configuration

### Prerequisites:
* [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* A Telegram account and a bot created via [@BotFather](https://t.me/BotFather) (to obtain a **Bot Token**)

### Environment Variables / Configuration (`appsettings.json`):

The application requires bot credentials configured in `DealHunter.Api/appsettings.json` or provided via environment variables:

```json
{
  "Telegram": {
    "BotToken": "YOUR_TELEGRAM_BOT_TOKEN",
    "ChatId": "YOUR_CHAT_ID"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=dealhunter.db"
  }
}
```

---

## Running the Project Locally

### 1. Build the solution:
```bash
dotnet build DealHunter.slnx
```

### 2. Run unit and integration tests:
```bash
dotnet test DealHunter.slnx
```

### 3. Run the application (API + Background Monitoring Service):
```bash
dotnet run --project DealHunter.Api
```

---

## Telegram Bot Commands

Monitoring rules are managed directly from the Telegram chat interface:

| Command | Description | Example |
| --- | --- | --- |
| `/start` | Initialize connection and register user | `/start` |
| `/add <URL> [--max-price <AMOUNT>]` | Add a new monitoring rule for an OLX link | `/add https://www.olx.pl/d/elektronika/ --max-price 500` |
| `/list` | Display a list of your active monitoring rules | `/list` |
| `/delete <ID>` | Delete an active monitoring rule by ID | `/delete 123` |

---

## Deployment and Infrastructure (Azure & GitHub Actions)

The project includes infrastructure as code via **Azure Bicep** templates and automated **GitHub Actions** CI/CD workflows:

* **CI (`.github/workflows/ci.yml`)**: Runs automated builds and tests on every Pull Request.
* **CD (`.github/workflows/cd.yml`)**: Upon merging to `main`, automatically builds the application package, applies Bicep infrastructure, and deploys to **Azure App Service (Linux)** with SQLite mounted on a persistent disk volume (`/home/site/wwwroot/data`).

For further details, refer to the documentation in [docs/azure-deployment.md](docs/azure-deployment.md).
