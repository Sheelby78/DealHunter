# Angular 19 Frontend Migration Implementation Plan

## Overview
Migrate the frontend web application (`DealHunter.Web`) from React 19 / Vite to Angular 19 Standalone Components using the Angular CLI (esbuild/Vite builder). This transition establishes an enterprise-grade Angular architecture with fine-grained reactive state (Signals), functional HTTP interceptors, and pure CSS transition animations while maintaining 100% visual parity with the existing Cyberpunk design system and requiring zero changes to the ASP.NET Core backend (`DealHunter.Api`).

## Current State Analysis
* The existing frontend is a React 19 SPA located in `DealHunter.Web/src`, consisting of 25 source files (2,226 lines of code) built via Vite.
* Authentication relies on a static PIN stored in `localStorage` (`dealhunter_pin`) and transmitted via custom `X-PIN` HTTP headers using a custom fetch wrapper (`fetchWithAuth`).
* State synchronization is handled via local React component state and a 30-second silent `setInterval` background poll in `Dashboard.tsx`.
* Styling is encapsulated in `src/index.css` (526 lines), which uses pure CSS variables, scanlines, and glitch animation keyframes without any framework-specific styling dependencies.
* ASP.NET Core serves the compiled SPA static files from `DealHunter.Api/wwwroot/` via `app.UseStaticFiles()` and fallback routing (`app.MapFallbackToFile("index.html")`).

## Desired End State
* A modern Angular 19 Standalone application operating in `DealHunter.Web` without traditional `NgModule` boilerplate.
* Reactive state management powered by Angular Signals (`signal`, `computed`) in `AuthService` and `RulesService`, coupled with RxJS `timer(0, 30000)` for silent background polling.
* Secure API communication via an Angular functional HTTP interceptor (`HttpInterceptorFn`) that injects the `X-PIN` header and automatically purges session credentials upon 401 Unauthorized responses.
* Zero third-party JavaScript animation dependencies; modal and list transitions handled by CSS classes and `@keyframes` in `styles.css`.
* Vector icons provided by `lucide-angular`, matching all 16 existing UI icons.
* Seamless full-stack deployment where running `ng build` outputs the production bundle directly into `DealHunter.Api/wwwroot/`, ready to be served by `dotnet run --project DealHunter.Api`.

### Key Discoveries:
- [src/index.css](file:///C:/Users/sheel/Documents/.NET/DealHunter/DealHunter.Web/src/index.css#L1-L526) contains 100% standard CSS (variables, grid layouts, scanline keyframes) and can be used verbatim in Angular without modifications.
- [DealHunter.Api/Program.cs](file:///C:/Users/sheel/Documents/.NET/DealHunter/DealHunter.Api/Program.cs#L44-L60) serves whatever static files reside in `wwwroot/` with fallback to `index.html`. Angular CLI's build output flattening (`"browser": ""`) directly integrates with this hosting model without touching C# code.
- [src/lib/api.ts](file:///C:/Users/sheel/Documents/.NET/DealHunter/DealHunter.Web/src/lib/api.ts#L1-L50) implements the authorization header injection and 401 error interception that maps directly to Angular 17+ functional `HttpInterceptorFn`.

## What We're NOT Doing
* We are NOT modifying any domain logic, database schemas, or MediatR handlers in `DealHunter.Domain`, `DealHunter.Application`, or `DealHunter.Infrastructure`.
* We are NOT modifying C# API controllers or authentication filters in `DealHunter.Api` (`RulesController.cs`, `[PinAuthorize]`).
* We are NOT introducing state management libraries like NgRx, SignalStore, Akita, or Redux.
* We are NOT adding server-side rendering (SSR / Angular Universal / Analog SSR); this remains a strictly client-side SPA.

## Implementation Approach
We will execute a structured 5-phase replacement of the React frontend in `DealHunter.Web`:
1. Initialize an Angular 19 Standalone workspace, configure the esbuild builder, transfer `index.css` to `styles.css`, and configure `angular.json` to output built assets directly to `../DealHunter.Api/wwwroot`.
2. Build the core services (`AuthService`, `RulesService`), functional HTTP interceptor (`authInterceptor`), and route guard (`authGuard`) using Angular Signals, supported by unit tests.
3. Re-create all 14 Cyberpunk presentation components (`Button`, `Badge`, `Input`, `Panel`, `AlertPanel`, `StatCard`, `ConfirmModal`, `GlitchText`, `PinKeypad`, `Header`, `Sidebar`, `Layout`) using standalone Angular component metadata and `lucide-angular` icons.
4. Implement page components (`LoginComponent`, `DashboardComponent` with RxJS polling), wire up the application router, run automated builds, and verify end-to-end operation against the running .NET API.
5. Delete all legacy React source files (`*.tsx`, `index.css`, `vite.config.ts`) once Angular Standalone migration is complete and verified.

## Critical Implementation Details
* **Do NOT modify backend code**: All integration happens via static file output into `DealHunter.Api/wwwroot/`. Do not edit C# files to accommodate frontend routing or build paths.
* **Angular CLI Output Path Flattening**: In `angular.json`, set `"outputPath": "../DealHunter.Api/wwwroot"` and remove any nested subfolder (or configure `"browser": ""`) so `index.html` resides at the root of `wwwroot/`.
* **CSS Parity**: Copy the exact contents of `DealHunter.Web/src/index.css` into the Angular project's `src/styles.css` to ensure 100% visual parity with the Cyberpunk design system.
* **Signal Re-renders**: When mutating lists in `RulesService` (e.g. optimistic deletions or additions), always use immutable signal updates (`this.rulesSignal.update(list => list.filter(...))`).

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Project Scaffolding & Core Configuration

#### Automated

- [x] 1.1 Verify Angular CLI production build generates bundles in wwwroot — 64965f1

#### Manual

- [x] 1.2 Verify index.html and static assets appear in DealHunter.Api/wwwroot — 64965f1

### Phase 2: Authentication, API Services & Interceptors

#### Automated

- [x] 2.1 Verify unit test suite passes for AuthService, RulesService, and authInterceptor — 1a0249c

### Phase 3: Cyberpunk UI Components & Layouts

#### Automated

- [x] 3.1 Verify production build compiles all 14 standalone UI components without errors — 8d96e4c

#### Manual

- [x] 3.2 Inspect compiled bundle to verify no missing styles or template errors — 8d96e4c

### Phase 4: Pages, Polling & Full-Stack Integration

#### Automated

- [x] 4.1 Verify frontend and backend .NET solution build successfully — 6ef6e29

#### Manual

- [ ] 4.2 Verify full-stack login, rule creation, and rule deletion in browser

### Phase 5: Legacy React Code Cleanup

#### Automated

- [x] 5.1 Delete legacy React source files and verify clean Angular build — 3c96fa2

## Phase 1: Project Scaffolding & Core Configuration

### Goal
Initialize the Angular 19 Standalone workspace in `DealHunter.Web`, establish the CSS design system, install icon dependencies, and configure proxying and build output paths.

### Changes
- `DealHunter.Web/package.json` - Replace React dependencies with `@angular/core`, `@angular/common`, `@angular/platform-browser`, `@angular/router`, and `lucide-angular`.
- `DealHunter.Web/angular.json` - Configure esbuild architect targets, set `outputPath` to `../DealHunter.Api/wwwroot`, and link proxy configuration.
- `DealHunter.Web/proxy.conf.json` - Create development server proxy routing `/api/*` to `https://localhost:7001`.
- `DealHunter.Web/src/styles.css` - Populate with all 526 lines of CSS variables, scanline keyframes, and layout grids from React `index.css`.
- `DealHunter.Web/src/main.ts` & `DealHunter.Web/src/app/app.config.ts` - Set up standalone app bootstrap with `provideHttpClient()`, `provideRouter()`, and interceptor registration.

### Automated Verification
- `cd DealHunter.Web && npm run build`

### Manual Verification
- Verify that `DealHunter.Api/wwwroot/index.html` and supporting `.js`/`.css` bundles are generated after running the build command.

## Phase 2: Authentication, API Services & Interceptors

### Goal
Implement reactive authentication state, backend rule data fetching, HTTP request interception for PIN authorization, and routing guards.

### Changes
- `DealHunter.Web/src/app/core/auth/auth.service.ts` - Create `@Injectable({ providedIn: 'root' })` service using `signal<string | null>` for PIN state, handling login, logout, and `localStorage` persistence.
- `DealHunter.Web/src/app/core/auth/auth.guard.ts` - Create functional `CanActivateFn` guard redirecting unauthenticated users to `/login`.
- `DealHunter.Web/src/app/core/api/auth.interceptor.ts` - Create functional `HttpInterceptorFn` injecting `X-PIN` header from `AuthService` and calling `logout()` on 401 HTTP responses.
- `DealHunter.Web/src/app/features/rules/rules.service.ts` - Create `@Injectable()` service using `HttpClient` to fetch, create, and delete search rules, exposing reactive `rules` signal.
- `DealHunter.Web/src/app/core/auth/auth.service.spec.ts` - Unit tests verifying PIN persistence, signal updates, and logout behavior.
- `DealHunter.Web/src/app/core/api/auth.interceptor.spec.ts` - Unit tests verifying `X-PIN` header injection and 401 error interception.

### Automated Verification
- `cd DealHunter.Web && npm run test`

### Manual Verification
- None required for this phase; verification is handled via automated unit tests.

## Phase 3: Cyberpunk UI Components & Layouts

### Goal
Recreate all presentation, layout, and interactive components in Angular Standalone format using pure CSS transitions and `lucide-angular` icons.

### Changes
- `DealHunter.Web/src/app/shared/components/ui/button/button.component.ts` - Cyberpunk button with variant classes and scanline hover effects.
- `DealHunter.Web/src/app/shared/components/ui/badge/badge.component.ts` - Styled badge pill (`green`, `purple`, `red` variants).
- `DealHunter.Web/src/app/shared/components/ui/input/input.component.ts` - Custom text and numeric step input (+/- 100 PLN controls).
- `DealHunter.Web/src/app/shared/components/ui/panel/panel.component.ts` - Container with corner pseudo-element borders.
- `DealHunter.Web/src/app/shared/components/ui/alert-panel/alert-panel.component.ts` - Error banner with retry trigger.
- `DealHunter.Web/src/app/shared/components/ui/stat-card/stat-card.component.ts` - Metric card displaying icon, label, and dynamic value.
- `DealHunter.Web/src/app/shared/components/ui/glitch-text/glitch-text.component.ts` - Animated header using CSS glitch keyframes.
- `DealHunter.Web/src/app/shared/components/ui/confirm-modal/confirm-modal.component.ts` - Confirmation modal dialog with pure CSS opacity/scale transition classes.
- `DealHunter.Web/src/app/features/auth/pin-keypad/pin-keypad.component.ts` - On-screen 3x4 numeric keypad emitting keypress and submit events.
- `DealHunter.Web/src/app/shared/layout/header/header.component.ts` - Header bar displaying status badge, scanline animation, and logout action.
- `DealHunter.Web/src/app/shared/layout/sidebar/sidebar.component.ts` - Navigation sidebar with mobile responsive bottom navigation bar.
- `DealHunter.Web/src/app/shared/layout/layout.component.ts` - Shell wrapper organizing sidebar, header, and `<router-outlet>`.

### Automated Verification
- `cd DealHunter.Web && npm run build`

### Manual Verification
- Inspect component compilation in build output to verify no missing template references or style syntax errors exist.

## Phase 4: Pages, Polling & Full-Stack Integration

### Goal
Implement page-level views (`LoginComponent`, `DashboardComponent`), wire up background polling, assemble router routes, and verify end-to-end functionality against the .NET API.

### Changes
- `DealHunter.Web/src/app/pages/login/login.component.ts` - PIN authentication screen supporting physical keyboard listeners and virtual keypad integration.
- `DealHunter.Web/src/app/features/rules/add-rule-form/add-rule-form.component.ts` - Reactive form with custom validator enforcing `olx.pl` URL requirement.
- `DealHunter.Web/src/app/features/rules/rule-card/rule-card.component.ts` - Rule display card with title extraction helper and delete event emitter.
- `DealHunter.Web/src/app/pages/dashboard/dashboard.component.ts` - Main dashboard integrating stat cards, rule list, search filter, and RxJS `timer(0, 30000)` background polling.
- `DealHunter.Web/src/app/app.routes.ts` - Route definitions tying `/login` and `/dashboard` (protected by `authGuard`) with default redirect to `/dashboard`.

### Automated Verification
- `cd DealHunter.Web && npm run build`
- `dotnet build DealHunter.slnx`

### Manual Verification
1. Start the backend API: `dotnet run --project DealHunter.Api`.
2. Open a web browser at `https://localhost:7001` (or the configured http port).
3. Verify that the Cyberpunk PIN login screen loads with neon styles and scanline animations.
4. Enter the configured PIN (`1234`) and verify redirection to the Dashboard.
5. Create a new search rule (`https://www.olx.pl/d/elektronika/` with max price `500`) and verify immediate appearance in the list.
6. Delete a rule and verify removal without page reload.

## Phase 5: Legacy React Code Cleanup

### Goal
Remove all 25 legacy React source files, components, contexts, and configuration files from `DealHunter.Web` now that Angular migration and verification are complete.

### Changes
- `DealHunter.Web/src/*.tsx` & `DealHunter.Web/src/**/*.tsx` - Delete all legacy React components, pages, and context providers.
- `DealHunter.Web/src/index.css` & `DealHunter.Web/vite.config.ts` - Delete Vite and legacy CSS entry files (since `styles.css` is now used).

### Automated Verification
- `cd DealHunter.Web && npm run build`

### Manual Verification
- Verify that `DealHunter.Web/src` contains only Angular TypeScript files (`*.ts`, `*.html`, `*.css`).
