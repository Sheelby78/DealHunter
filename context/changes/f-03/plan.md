# Frontend Setup & Cyberpunk Design System Implementation Plan

## Overview

Transform `DealHunter.Web` from a prototype vanilla TypeScript script into a production-ready Vite + React SPA with a Cyberpunk design system. This foundation sets up React 19, configures Vite and TypeScript path aliases, modularizes global CSS design tokens (neon colors, CRT grid, glitch animations, scanlines), and creates a reusable component library (`Button`, `Input`, `Badge`, `Panel`, `GlitchText`, `Layout`, `Header`, `Sidebar`) to support upcoming authentication (S-05) and rule management (S-06) slices.

## Current State Analysis

- `DealHunter.Web` has basic Vite files (`package.json`, `index.html`, `src/style.css`, `src/main.ts`).
- `package.json` lacks React dependencies (`react`, `react-dom`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`).
- `src/main.ts` uses direct DOM manipulation to render mock rules and handle forms.
- Prototype CSS variables and keyframe animations (`scanline`, `glitch-anim`) are defined in `src/style.css`.
- Path aliases (`@/*`) are not yet configured in Vite or TypeScript.

## Desired End State

- Fully configured Vite + React 19 + TypeScript application in `DealHunter.Web`.
- Vite configured with `@vitejs/plugin-react` and `@/*` alias resolving to `src/`.
- Modular CSS design system in `src/index.css` with CSS custom properties for neon tokens and terminal styling.
- Reusable UI component library under `src/shared/components/ui/` and layout components under `src/shared/layout/`.
- Domain showcase components under `src/features/rules/components/`.
- Interactive showcase dashboard in `src/App.tsx` demonstrating all components, hover/focus FX, and state toggles.
- Clean build verification via `npm run build` with zero TypeScript errors.

### Key Discoveries:

- `DealHunter.Web/package.json` needs `@vitejs/plugin-react`, `react`, `react-dom`, and `lucide-react`.
- Google Fonts (`Orbitron` and `Share Tech Mono`) are pre-linked in `DealHunter.Web/index.html`.
- Lessons learned rule: No emojis in documentation or code files.

## What We're NOT Doing

- Connecting components to live backend REST API endpoints (deferred to S-05 and S-06).
- Implementing PIN authentication logic or persistent storage (deferred to S-05).
- Adding complex global state libraries like Redux or Zustand (local React state is sufficient).

## Implementation Approach

1. Upgrade dependencies in `DealHunter.Web/package.json` to include React 19, `@vitejs/plugin-react`, and `lucide-react`.
2. Configure `vite.config.ts` and `tsconfig.json` for React TSX support and `@/*` path aliases.
3. Migrate `src/style.css` into `src/index.css` with clean token variables and component utility classes.
4. Build strongly-typed React components in `src/shared/components/ui/`, `src/shared/layout/`, and `src/features/rules/components/`.
5. Create `src/App.tsx` as an interactive showcase app with mock state.
6. Verify via `npm run build` and `npm run dev`.

---

## Execution Phases

### Phase 1: React & Vite Environment Setup

- Task 1.1: Update `DealHunter.Web/package.json` to include React 19, React DOM, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, and `lucide-react`.
- Task 1.2: Create `DealHunter.Web/vite.config.ts` with React plugin and path alias `@` -> `./src`.
- Task 1.3: Update `DealHunter.Web/tsconfig.json` to support React JSX (`"jsx": "react-jsx"`) and path alias (`"@/*": ["./src/*"]`).
- Task 1.4: Convert entry point from `src/main.ts` to `src/main.tsx` and update `index.html` script reference. Remove legacy `src/counter.ts`.

### Phase 2: Cyberpunk Design System & Token Foundation

- Task 2.1: Refactor `src/style.css` into `src/index.css` defining global variables (`--bg-color`, `--panel-bg`, `--neon-green`, `--neon-purple`, `--neon-red`, `--text-main`, `--text-muted`, `--font-heading`, `--font-mono`), scanline overlay, glitch animations, and custom scrollbars.
- Task 2.2: Create theme and component prop type definitions in `src/shared/types/theme.ts`.

### Phase 3: Cyberpunk Reusable Component Library

- Task 3.1: Create `src/shared/components/ui/Button.tsx` supporting primary (neon green), danger (neon red), and ghost variants with glow and hover animation.
- Task 3.2: Create `src/shared/components/ui/Input.tsx` supporting cyberpunk terminal input with label, placeholder, and focus glow.
- Task 3.3: Create `src/shared/components/ui/Badge.tsx` for status badges with neon borders.
- Task 3.4: Create `src/shared/components/ui/Panel.tsx` for cards/containers with glowing corner brackets (`::before`, `::after`) and blur backdrop.
- Task 3.5: Create `src/shared/components/ui/GlitchText.tsx` for header titles with cyberpunk text glitch effect.
- Task 3.6: Create `src/shared/layout/Header.tsx` for top navigation bar with system status indicators.
- Task 3.7: Create `src/shared/layout/Sidebar.tsx` for terminal navigation links and user status box.
- Task 3.8: Create `src/shared/layout/Layout.tsx` for main grid layout structure.

### Phase 4: Domain Showcase Components & Interactive Showcase App

- Task 4.1: Create `src/features/rules/components/RuleCard.tsx` for displaying active search rules with max price, formatted URL link, creation date, and terminate button.
- Task 4.2: Create `src/features/rules/components/AddRuleForm.tsx` for target URL and max price inputs with submit handler.
- Task 4.3: Create `src/App.tsx` assembling the layout, header, sidebar, rule form, rule list, and interactive mock state management.

### Phase 5: Verification & Build Validation

- Task 5.1: Run `npm run build` in `DealHunter.Web` to verify zero TypeScript errors and successful bundle creation.
- Task 5.2: Conduct local manual check using `npm run dev` to verify responsive grid, glitch text rendering, neon button glows, and mock rule add/delete interactions.

---

## Verification Plan

### Automated Verification
- Run `npm run build` inside `DealHunter.Web` directory.
- Expectation: Successful compilation with no TS or Vite build errors.

### Manual Verification
- Run `npm run dev` and navigate to local dev server URL in browser.
- Verify glitch animation on `DealHunter_OS` header text.
- Verify scanline effect across top bar.
- Test adding a mock rule in the form and observing live card addition.
- Test clicking `[ TERMINATE ]` button on a card and verifying card removal.

---

## Progress

| Phase | Tasks | Status | Verified |
|---|---|---|---|
| Phase 1: React & Vite Environment Setup | 4/4 | completed | yes |
| Phase 2: Cyberpunk Design System & Token Foundation | 2/2 | completed | yes |
| Phase 3: Cyberpunk Reusable Component Library | 8/8 | completed | yes |
| Phase 4: Domain Showcase Components & Interactive Showcase App | 3/3 | completed | yes |
| Phase 5: Verification & Build Validation | 2/2 | completed | yes |
