# DealHunter - Instant OLX Deal Notifications & Web Management Panel

> **DealHunter** is an automated application built with **C# / .NET 10.0** and **React 19** that periodically monitors classified ad portals (such as OLX.pl) for new deal listings, sends instant notifications with offer details directly via **Telegram**, and provides a modern **Web Management Panel** for visual rule configuration.

---

## What is DealHunter?

Attractive deals on electronics, hobby items, or parts on classified ad portals often disappear within minutes of publication. Native website notifications operate with a significant delay.

**DealHunter** solves this problem by:
* Periodically searching configured OLX links with custom filter criteria (e.g., maximum price).
* Guaranteeing **deduplication** — each unique deal (OfferID) generates only a single notification.
* Sending formatted Telegram messages with photo, price, title, and direct link to the listing within seconds of detecting a new deal.
* Providing a **Web Management Panel (Dashboard)** protected by PIN authentication for creating, inspecting, and deleting search rules visually from any desktop or mobile browser.
* Providing protection against IP rate limits (safe request intervals) and handling transient network errors (automatic retries).

---

## Architecture and Tech Stack

The application is built following **Clean Architecture** principles, decoupling core domain logic from infrastructure, API endpoints, and the web frontend.

### Backend Tech Stack (`.NET 10.0`):
* **ASP.NET Core Web API + Background Worker (`IHostedService`)** — Hosts REST endpoints, background search loops, and serves the SPA frontend.
* **MediatR** — CQRS pattern implementation (Command and Query Responsibility Segregation) for clean use-case isolation.
* **Entity Framework Core + SQLite** — Lightweight and fast database stored locally or on a persistent cloud volume.
* **Telegram.Bot API** — Direct integration with Telegram bot messaging and chat commands.
* **HtmlAgilityPack** — Safe and efficient HTML parsing of classified portal web pages.
* **Polly** — Retry policies and network resilience strategies.
* **REST API & Security** — `RulesController` endpoints secured via `[PinAuthorize]` custom filter validating header `X-PIN`.

### Frontend Tech Stack (`DealHunter.Web`):
* **Vite + React 19** — Fast build tooling and modern component-driven Single Page Application (SPA).
* **TypeScript** — Strongly typed frontend codebase matching backend domain contracts.
* **Framer Motion** — Smooth layout transitions, modal animations, and micro-interactions.
* **Lucide React** — Crisp vector icon set for action buttons, status badges, and navigation.
* **Vanilla CSS Design System** — Tailored dark mode palette, CSS variables, glassmorphism card surfaces, and fully responsive mobile layouts.

### Solution Structure:

```text
DealHunter.slnx
├── DealHunter.Domain/        # Pure domain logic (Aggregates, Value Objects, Domain Events)
├── DealHunter.Application/   # Use cases (MediatR Commands/Queries, DTOs, Interfaces)
├── DealHunter.Infrastructure/# Implementations of parsers, Telegram client, EF Core DB, and Polly
├── DealHunter.Api/            # ASP.NET Core API entry point, Background Worker, PIN auth & SPA static file host
├── DealHunter.Web/            # Frontend SPA Dashboard (React 19, Vite, TypeScript, Framer Motion)
└── DealHunter.Tests/          # Unit and integration tests (xUnit/NSubstitute)
```

---

## Prerequisites and Configuration

### Prerequisites:
* [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* [Node.js (v18+)](https://nodejs.org/) & `npm` (for frontend web dashboard development and builds)
* A Telegram account and a bot created via [@BotFather](https://t.me/BotFather) (to obtain a **Bot Token**)

### Environment Variables / Configuration (`appsettings.json`):

The application requires bot credentials and web panel settings configured in `DealHunter.Api/appsettings.json` or provided via environment variables:

```json
{
  "Telegram": {
    "BotToken": "YOUR_TELEGRAM_BOT_TOKEN",
    "ChatId": 0
  },
  "Panel": {
    "WebPanelPin": "1234"
  },
  "AllowedOrigins": [
    "http://localhost:5173"
  ],
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=dealhunter.db"
  }
}
```

> **Note on Environment Variables & GitHub Secrets:**
> In production or CI/CD deployments, environment variables override `appsettings.json` using double underscores (`__`):
> - `TELEGRAM_BOT_TOKEN` (GitHub Secret) → `Telegram__BotToken`
> - `TELEGRAM_CHAT_ID` (GitHub Secret) → `Telegram__ChatId`
> - `WEB_PANEL_PIN` (GitHub Secret) → `Panel__WebPanelPin`

---

## Running the Project Locally

### 1. Build the solution:
```bash
dotnet build DealHunter.slnx
```

### 2. Run backend unit and integration tests:
```bash
dotnet test DealHunter.slnx
```

### 3. Run the Frontend Dashboard (Development Mode):
```bash
cd DealHunter.Web
npm install
npm run dev
```
The Vite development server will start at `http://localhost:5173`.

### 4. Run the Full-Stack Application (API + Background Service + SPA Host):
To build the frontend and serve it directly from the .NET Web API:
```bash
# Build production SPA assets
cd DealHunter.Web
npm run build

# Start .NET API (hosts both API endpoints and SPA frontend)
cd ..
dotnet run --project DealHunter.Api
```

---

## Web Management Panel (Dashboard)

The Web Management Panel allows managing search rules visually without relying solely on chat commands:

* **PIN Lock Screen**: Secure login modal storing PIN credentials locally in the browser and transmitting them via `X-PIN` HTTP headers.
* **Rules Overview**: View active monitoring rules with status badges, search link shortcuts, and max price caps.
* **Rule Creation**: Form to add new search URLs and max price thresholds with instant validation.
* **Rule Deletion**: One-click rule deletion with immediate UI feedback and backend state synchronization.

---

## Telegram Bot Commands

Monitoring rules can also be managed directly from the Telegram chat interface:

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
* **CD (`.github/workflows/cd.yml`)**: Upon merging to `main`, automatically builds both backend and frontend SPA, applies Bicep infrastructure, and deploys to **Azure App Service (Linux)** with SQLite mounted on a persistent disk volume (`/home/site/wwwroot/data`).

For further details, refer to the documentation in [docs/azure-deployment.md](docs/azure-deployment.md).

