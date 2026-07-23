# Implementation Review Follow-ups

- **Change**: s-05
- **Date**: 2026-07-23

## F2 — Plain text PIN in localStorage
- **Type**: Architectural Debt
- **Detail**: PIN is stored in plain text in `localStorage` exposing it to XSS.
- **Action**: Move the PIN to an HTTPOnly cookie or memory-only state in a future architecture update.
