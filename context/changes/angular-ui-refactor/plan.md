# Angular UI Architecture Refactoring Plan

## Overview
Refactor the Angular frontend application (`DealHunter.Web`) to eliminate large Single-File Components (SFCs) with inline templates and styles, aligning with the official Angular Style Guide (Rule 02-01: One Thing Per File) and Clean Architecture principles. Specifically, we will extract inline HTML templates and CSS styles into separate `.component.html` and `.component.css` files for `LoginComponent` and `DashboardComponent`, and decompose large container views into smaller, focused sub-components. This change requires zero modifications to the ASP.NET Core backend API (`DealHunter.Api`) and preserves 100% visual and behavioral parity.

## Current State Analysis
* `DealHunter.Web/src/app/pages/login/login.component.ts` is 233 lines long. It encapsulates an inline HTML template (`template: ...`) and a 160+ line inline CSS style stylesheet (`styles: [...]`).
* `DealHunter.Web/src/app/pages/dashboard/dashboard.component.ts` is 328 lines long. It contains an inline HTML template for three distinct tab views ('monitor', 'logs', 'settings') and an inline CSS stylesheet (`styles: [...]`) of over 100 lines.
* Mixing templates, styling, and component TypeScript logic in single files impairs maintainability, increases the risk of merge conflicts, and violates standard Angular separation of concerns for medium-to-large components.

## Desired End State
* Clean separation of concerns in `DealHunter.Web/src/app/pages/login/`:
  - `login.component.ts` (strictly component TypeScript logic, signals, dependency injection, and imports).
  - `login.component.html` (extracted HTML template).
  - `login.component.css` (extracted styling).
* Clean separation of concerns and decomposition in `DealHunter.Web/src/app/pages/dashboard/`:
  - `dashboard.component.ts` (main page container and state coordinator).
  - `dashboard.component.html` (main shell template directing tabs).
  - `dashboard.component.css` (container styling).
  - `components/dashboard-monitor/dashboard-monitor.component.ts|html|css` (encapsulating stat cards, alert banner, add-rule form toggle, and rules list).
  - `components/dashboard-logs/dashboard-logs.component.ts|html|css` (encapsulating system log console view).
  - `components/dashboard-settings/dashboard-settings.component.ts|html|css` (encapsulating system configuration view).
* All extracted components remain Angular Standalone Components.
* 100% visual parity with the neon cyberpunk theme and existing animation keyframes.
* All unit tests and production builds pass without errors or warnings.

## What We're NOT Doing
* We are NOT modifying any domain logic, MediatR handlers, or infrastructure services in `DealHunter.Domain`, `DealHunter.Application`, or `DealHunter.Infrastructure`.
* We are NOT modifying C# API controllers, authentication filters, or static file hosting in `DealHunter.Api`.
* We are NOT introducing any external state management libraries (such as NgRx or Akita).
* We are NOT altering existing functionality, API request payloads, or authentication mechanisms.

## Implementation Approach
We will execute a structured 3-phase refactoring:
1. **Login Component Refactoring**: Extract the template and stylesheet from `login.component.ts` into `login.component.html` and `login.component.css`, updating component metadata to use `templateUrl` and `styleUrl`.
2. **Dashboard Component Decomposition & Extraction**: Create standalone sub-components for the Monitor, Logs, and Settings tab views under `src/app/pages/dashboard/components/`, and extract the shell template and styles of `DashboardComponent` into dedicated files.
3. **Verification & Build Validation**: Run unit test suites and verify production builds (`npm run build`), confirming zero visual regression against the backend API.

## Critical Implementation Details
* **Do NOT use Emojis**: Per `lessons.md`, keep all documentation, commit messages, and code comments completely free of emojis.
* **Do NOT modify backend code**: All refactoring is strictly confined to `DealHunter.Web/src/app/`.
* **Angular Metadata Syntax**: When replacing inline properties in `@Component({...})`, use `templateUrl: './login.component.html'` and `styleUrl: './login.component.css'`.
* **Signal Property Passing**: Ensure data passed from `DashboardComponent` to sub-components maintains reactive binding by passing signal values or computed properties via inputs (`input()` or `@Input()`).

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Login Component Extraction

#### Automated
- [x] 1.1 Extract template and styles for LoginComponent and verify build via `npm run build` in DealHunter.Web

#### Manual
- [ ] 1.2 Inspect login screen in browser to verify 100% visual parity and proper PIN keypad functionality

### Phase 2: Dashboard Component Decomposition & Extraction

#### Automated
- [ ] 2.1 Create Dashboard sub-components (Monitor, Logs, Settings) and extract main Dashboard template/styles, verifying build via `npm run build` in DealHunter.Web
- [ ] 2.2 Run unit test suite `npm run test` in DealHunter.Web to ensure all component and service tests pass

#### Manual
- [ ] 2.3 Verify tab switching between Monitor, Logs, and Settings in browser
- [ ] 2.4 Verify rule creation, rule deletion, and refresh button functionality

### Phase 3: Final Verification & Clean Architecture Review

#### Automated
- [ ] 3.1 Verify full solution build via `dotnet build DealHunter.slnx` and `npm run build` in DealHunter.Web

#### Manual
- [ ] 3.2 Review codebase to ensure no components in DealHunter.Web exceed 150 lines or contain inline HTML/CSS exceeding 10 lines
