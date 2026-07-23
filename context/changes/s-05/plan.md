# Autoryzacja PIN i Wyświetlanie Listy Reguł Implementation Plan

## Overview

Implement end-to-end PIN authentication and active rule list viewing in `DealHunter.Web` (North Star slice S-05). This change connects the React SPA to the `.NET 10` Web API (`F-02`), adding a Cyberpunk terminal login screen, React Auth Context with PIN persistence, `x-pin` header injection, 401 Unauthorized handling, live backend rule fetching (`GET /api/rules`), background polling, and connection error handling.

## Current State Analysis

- `F-02` backend endpoints (`GET /api/rules`, `POST /api/rules`, `DELETE /api/rules/{id}`) are implemented and protected by `PinAuthFilter` reading the `x-pin` header.
- `F-03` frontend setup contains the Cyberpunk design system, responsive mobile layout, and UI components in `DealHunter.Web`.
- Currently, `App.tsx` renders static mock rule state in memory without authenticating against or fetching from `DealHunter.Api`.

## Desired End State

- Users accessing `DealHunter.Web` are presented with a Cyberpunk terminal PIN login screen if unauthenticated.
- PIN is validated against `DealHunter.Api` via `x-pin` request header.
- Successful authentication stores the PIN in client storage (`localStorage`/`sessionStorage`) and unlocks the protected main dashboard.
- Active search rules are fetched from `GET /api/rules` and displayed live in the Cyberpunk dashboard.
- Automatic 401 recovery resets authentication and redirects to the login screen if the PIN is invalid or changed.
- Manual `[ REFRESH_DATA ]` button and optional background polling keep data in sync.

### Key Discoveries:

- `F-02` `PinAuthFilter` verifies the `x-pin` header on `GET /api/rules`. A successful `200 OK` response serves as PIN validation.
- `vite.config.ts` requires a proxy rule mapping `/api` requests to the `.NET` Web API (`http://localhost:5000` or `http://localhost:5001`).
- Lessons learned rule: No emojis in documentation or code files.

## What We're NOT Doing

- Implementing backend mutation actions (Add Rule / Delete Rule) from the Web UI (saved for S-06).
- Building complex multi-user accounts, JWT refresh tokens, or password resets.
- Modifying Telegram bot alert logic.

## Implementation Approach

1. **API & Auth Client**: Create `src/lib/api.ts` (fetch wrapper sending `x-pin`) and `src/context/AuthContext.tsx` managing PIN state and storage.
2. **Vite Proxy Configuration**: Add `/api` proxy target in `vite.config.ts` resolving to `.NET` backend host.
3. **Cyberpunk Login Screen**: Build `PinKeypad.tsx` and `LoginPage.tsx` styled with neon borders, masked PIN display, and error handling.
4. **Protected Dashboard**: Create `ProtectedLayout.tsx` guarding the main layout and fetching live rules via `GET /api/rules`.
5. **Quality Gate**: Verify via TypeScript build (`npm run build`) and integration testing.

---

## Execution Phases

### Phase 1: API Client & Auth Context Infrastructure

- Task 1.1: Create `DealHunter.Web/src/lib/api.ts` with custom `fetchWithAuth` wrapper injecting `x-pin` header and handling HTTP status codes.
- Task 1.2: Create `DealHunter.Web/src/shared/context/AuthContext.tsx` with `AuthProvider`, `useAuth` hook, PIN persistence in `localStorage`, and `validatePin` method.
- Task 1.3: Update `DealHunter.Web/vite.config.ts` to proxy `/api` requests to `http://localhost:5000` (or `http://localhost:5001`).

### Phase 2: Cyberpunk Terminal Login Screen

- Task 2.1: Create `DealHunter.Web/src/features/auth/components/PinKeypad.tsx` with Cyberpunk numeric buttons (0-9, CLEAR, ENTER) styled with neon glow.
- Task 2.2: Create `DealHunter.Web/src/features/auth/pages/LoginPage.tsx` assembling terminal glitch title, masked PIN display, numeric keypad, and invalid PIN alert box.

### Phase 3: Protected Router & Live Rule List API Integration

- Task 3.1: Create `DealHunter.Web/src/shared/components/ProtectedLayout.tsx` rendering `LoginPage` when unauthenticated and main `Layout` when authenticated.
- Task 3.2: Create `DealHunter.Web/src/features/rules/api/rulesApi.ts` for fetching rules from `GET /api/rules`.
- Task 3.3: Connect `App.tsx` to `AuthContext` and live rule fetching, adding manual refresh button and 30-second silent background poll.

### Phase 4: Error Handling & Loading Skeletons

- Task 4.1: Create `DealHunter.Web/src/shared/components/ui/AlertPanel.tsx` for displaying connection errors and backend offline states with a retry button.
- Task 4.2: Add loading skeleton state to rules panel while initial `GET /api/rules` call is pending.

### Phase 5: Verification & Quality Validation

- Task 5.1: Run `npm run build` in `DealHunter.Web` to verify zero TypeScript errors and successful production bundling.
- Task 5.2: Verify authentication flow (unauthenticated state -> login with PIN -> dashboard unlock -> 401 auto logout).

---

## Verification Plan

### Automated Verification
- Run `npm run build` inside `DealHunter.Web` directory.
- Expectation: Clean build output with zero TS errors.

### Manual Verification
- Test entering an invalid PIN: verify error alert `INVALID_PIN_CREDENTIAL`.
- Test entering valid PIN: verify dashboard unlocks and active rules load live from `.NET` API.
- Test refreshing the page: verify user remains logged in via stored PIN.
- Test backend offline state: verify connection error panel with `[ RETRY_CONNECTION ]` button.

---

## Progress

### Phase 1: API Client & Auth Context Infrastructure
- [x] 1.1 Create `DealHunter.Web/src/lib/api.ts` with custom `fetchWithAuth` wrapper injecting `x-pin` header and handling HTTP status codes.
- [x] 1.2 Create `DealHunter.Web/src/shared/context/AuthContext.tsx` with `AuthProvider`, `useAuth` hook, PIN persistence in `localStorage`, and `validatePin` method.
- [x] 1.3 Update `DealHunter.Web/vite.config.ts` to proxy `/api` requests to `http://localhost:5000` (or `http://localhost:5001`).

### Phase 2: Cyberpunk Terminal Login Screen
- [ ] 2.1 Create `DealHunter.Web/src/features/auth/components/PinKeypad.tsx` with Cyberpunk numeric buttons (0-9, CLEAR, ENTER) styled with neon glow.
- [ ] 2.2 Create `DealHunter.Web/src/features/auth/pages/LoginPage.tsx` assembling terminal glitch title, masked PIN display, numeric keypad, and invalid PIN alert box.

### Phase 3: Protected Router & Live Rule List API Integration
- [ ] 3.1 Create `DealHunter.Web/src/shared/components/ProtectedLayout.tsx` rendering `LoginPage` when unauthenticated and main `Layout` when authenticated.
- [ ] 3.2 Create `DealHunter.Web/src/features/rules/api/rulesApi.ts` for fetching rules from `GET /api/rules`.
- [ ] 3.3 Connect `App.tsx` to `AuthContext` and live rule fetching, adding manual refresh button and 30-second silent background poll.

### Phase 4: Error Handling & Loading Skeletons
- [ ] 4.1 Create `DealHunter.Web/src/shared/components/ui/AlertPanel.tsx` for displaying connection errors and backend offline states with a retry button.
- [ ] 4.2 Add loading skeleton state to rules panel while initial `GET /api/rules` call is pending.

### Phase 5: Verification & Quality Validation
- [ ] 5.1 Run `npm run build` in `DealHunter.Web` to verify zero TypeScript errors and successful production bundling.
- [ ] 5.2 Verify authentication flow (unauthenticated state -> login with PIN -> dashboard unlock -> 401 auto logout).

