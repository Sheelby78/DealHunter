---
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
---

## Why this stack

Dla jedno-osobowego projektu DealHunter nakierowanego na cykliczny monitoring i błyskawiczne powiadomienia, wybrano standardowy stos `.NET (ASP.NET Core webapi)`. Stos ten zapewnia silne typowanie (C#), dojrzały kontener DI, wbudowaną obsługę zadań w tle (HostedService / Worker Services) oraz łatwą integrację z biblioteką MediatR dla wzorca CQRS. Wybrano wdrożenie w chmurze Azure App Service oraz automatyczne budowanie i wdrożenie po złączeniu (auto-deploy-on-merge) przy użyciu GitHub Actions.
