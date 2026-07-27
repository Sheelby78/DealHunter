# Fix Stat Card Border Color Implementation Plan

## Overview

Fix the CSS string concatenation bug in `stat-card.component.ts` where CSS variable references (`var(--neon-green)` and `var(--neon-purple)`) are directly concatenated with hex opacity digits (`'40'`, `'15'`, `'30'`, `'0a'`). This produces invalid CSS strings such as `var(--neon-green)40`, causing the browser to ignore the inline style and fall back to `currentcolor` (which is `#e0e0e0` white/light gray).

## Current State Analysis

- In `stat-card.component.ts`, `accentColor` returns `'var(--neon-purple)'`, `'#00e5ff'`, or `'var(--neon-green)'`.
- In `stat-card.component.ts` template, inline styles concatenate hex opacity digits directly onto the result of `accentColor()`, e.g., `[style.border-color]="accentColor() + '40'"`.
- Because `var(--neon-green)40` is invalid CSS syntax, the style rule is ignored by the browser.
- Due to the default `border: 1px solid;` rule in `.stat-card`, the border color falls back to `currentcolor` (`#e0e0e0`), making borders appear white instead of neon green or neon purple.

## Desired End State

1. Update `accentColor` in `stat-card.component.ts` to return direct 6-digit hex color strings:
   - Green variant: `#39ff14` (matching `--neon-green` in `styles.css`)
   - Purple variant: `#bc13fe` (matching `--neon-purple` in `styles.css`)
   - Blue variant: `#00e5ff` (unchanged)
2. Ensure concatenating hex alpha digits (`'40'`, `'15'`, `'30'`, `'0a'`) onto `accentColor()` produces valid 8-digit hex colors (e.g., `#39ff1440`).
3. Verify that the application builds and tests pass cleanly in `DealHunter.Web`.

## What We're NOT Doing

- Not modifying any other UI components or global stylesheet definitions in `styles.css`.

## Implementation Approach

Modify `stat-card.component.ts` to return `#39ff14` for `'green'` and `#bc13fe` for `'purple'` in the `accentColor` computed signal.

## Proposed Changes

### Phase 1: Update StatCardComponent Accent Colors

- Modify `DealHunter.Web/src/app/shared/components/ui/stat-card/stat-card.component.ts`:
  - Update `accentColor` computed property to return `#bc13fe` for `purple` and `#39ff14` for `green`.

---

## Verification Plan

### Automated Tests
- Run frontend test suite: `cd DealHunter.Web && npm test`
- Verify build succeeds: `cd DealHunter.Web && npm run build`

### Manual Verification
- Verify in browser dashboard that Active Rules and Alert Delivery stat cards display neon green and neon purple borders respectively instead of white.

---

## Progress

### Phase 1: Update StatCardComponent Accent Colors
- [x] 1.1 Update `accentColor` computed values in `stat-card.component.ts`
- [x] 1.2 Run frontend verification tests and build
