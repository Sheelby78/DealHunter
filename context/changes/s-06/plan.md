# Pełne Zarządzanie (Dodawanie / Usuwanie) Implementation Plan

## Overview
Implement the full management lifecycle (add/delete) for monitoring rules in the DealHunter React dashboard. This includes wiring the existing `AddRuleForm` and `RuleCard` to the backend API, utilizing optimistic UI updates, and leveraging Framer Motion for high-quality Cyberpunk-themed micro-animations.

## Current State Analysis
- The backend API endpoints for adding (`POST /api/Rules`) and deleting (`DELETE /api/Rules/{id}`) rules are already implemented in `RulesController.cs`.
- The `DealHunter.Web` project has the `AddRuleForm.tsx` and `RuleCard.tsx` UI components built, but they are currently stubbed in `Dashboard.tsx` with a `NOT_IMPLEMENTED` alert.
- The `rulesApi.ts` file only has the `getRules` GET method.
- `framer-motion` is not yet installed in `package.json`.

## Desired End State
- Users can add new rules with the `AddRuleForm`. The UI updates optimistically, and on success re-fetches the entire list from the server to guarantee consistency. 
- Validation errors from the backend (like invalid URLs) trigger the global `AlertPanel` banner in the dashboard.
- Users can delete rules using the `RuleCard`'s terminate button. The deletion is optimistically applied, animated via Framer Motion, and followed by a list refresh.
- Adding and deleting rules features smooth enter/exit animations using `<AnimatePresence>` and `<motion.div>`.

### Key Discoveries:
- We're prioritizing optimistic updates with global error banners for failures.
- To ensure no data gets out of sync (e.g. changes made via Telegram bot at the same time), we will re-fetch the entire list silently after a successful action.
- `framer-motion` needs to be added as a project dependency to handle the requested `quality` of micro-animations.

## What We're NOT Doing
- We are not redesigning the API or changing the database schema.
- We are not handling inline form errors; all errors will bubble up to the global `AlertPanel`.
- We are not using pure CSS transitions for list items; we are standardizing on `framer-motion` for layout animations.

## Implementation Approach
We will first install `framer-motion` and add the required mutation functions to `rulesApi.ts`. Then we will update `Dashboard.tsx` to handle the state, manage the global error banner, and perform optimistic updates (adding temporary items or filtering out removed ones). Finally, we will wrap the rendered `RuleCard` items in `<motion.div>` and `<AnimatePresence>` to achieve smooth micro-animations.

## Progress

### Phase 1: Dependencies and API Layer
- [x] 1.1 Add framer-motion dependency to DealHunter.Web — cf1dd3e
- [x] 1.2 Add createRule and deleteRule API methods in rulesApi.ts — cf1dd3e

### Phase 2: Optimistic Rule Management in Dashboard
- [x] 2.1 Update Dashboard.tsx to handle handleAddRule with optimistic update and error rollback — cf1dd3e
- [x] 2.2 Update Dashboard.tsx to handle handleDeleteRule with optimistic update and error rollback — cf1dd3e

### Phase 3: Animations and UI Polish
- [x] 3.1 Refactor list rendering in Dashboard.tsx with AnimatePresence and motion.div — cf1dd3e
