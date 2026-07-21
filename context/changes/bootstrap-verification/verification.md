---
bootstrapped_at: 2026-07-21T20:27:35Z
starter_id: dotnet
starter_name: ".NET (ASP.NET Core webapi)"
project_name: deal-hunter
language_family: dotnet
package_manager: dotnet
cwd_strategy: subdir-then-move
bootstrapper_confidence: verified
phase_3_status: ok
audit_command: "dotnet list package --vulnerable"
---

## Hand-off

```yaml
starter_id: dotnet
package_manager: dotnet
project_name: deal-hunter
hints:
  language_family: dotnet
  team_size: solo
  deployment_target: azure-app-service
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: verified
  path_taken: standard
  quality_override: false
  self_check_answers: null
  has_auth: false
  has_payments: false
  has_realtime: true
  has_ai: false
  has_background_jobs: true
```

Dla jedno-osobowego projektu DealHunter nakierowanego na cykliczny monitoring i błyskawiczne powiadomienia, wybrano standardowy stos `.NET (ASP.NET Core webapi)`. Stos ten zapewnia silne typowanie (C#), dojrzały kontener DI, wbudowaną obsługę zadań w tle (HostedService / Worker Services) oraz łatwą integrację z biblioteką MediatR dla wzorca CQRS. Wybrano wdrożenie w chmurze Azure App Service oraz automatyczne budowanie i wdrożenie po złączeniu (auto-deploy-on-merge) przy użyciu GitHub Actions.

## Pre-scaffold verification

| Signal | Value | Severity | Notes |
| ------ | ----- | -------- | ----- |
| dotnet SDK | 10.0.302 | fresh | verified locally via `dotnet --version` |

## Scaffold log

**Resolved invocation**: `dotnet new webapi -n .bootstrap-scaffold --no-restore`
**Strategy**: subdir-then-move
**Exit code**: 0
**Files moved**: 6
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: append-merged
**.bootstrap-scaffold cleanup**: deleted

## Post-scaffold audit

**Tool**: `dotnet list package --vulnerable`
**Summary**: 0 CRITICAL, 0 HIGH, 0 MODERATE, 0 LOW
**Direct vs transitive**: 0 direct of total 0

`DealHunter.Api` has no vulnerable packages given current sources.

## Hints recorded but not acted on

| Hint | Value |
| ---- | ----- |
| bootstrapper_confidence | verified |
| quality_override | false |
| path_taken | standard |
| self_check_answers | null |
| team_size | solo |
| deployment_target | azure-app-service |
| ci_provider | github-actions |
| ci_default_flow | auto-deploy-on-merge |
| has_auth | false |
| has_payments | false |
| has_realtime | true |
| has_ai | false |
| has_background_jobs | true |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
