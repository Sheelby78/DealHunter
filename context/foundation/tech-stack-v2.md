---
starter_id: vite-react
package_manager: npm
project_name: DealHunter.Web
hints:
  language_family: js
  team_size: solo
  deployment_target: azure-app-service
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: verified
  path_taken: custom
  quality_override: false
  self_check_answers:
    typed: true
    from_official_starter: true
    conventions: true
    docs_current: true
    can_judge_agent: true
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---

## Why this stack

Decoupled SPA built with Vite + React. This stack provides a fast, minimal React shell perfectly suited for building a dashboard that communicates with an existing .NET 10.0 REST API. By avoiding server-side rendering (SSR), we maintain clear architectural boundaries—the .NET backend handles all business logic, data, and edge cases, while React handles strictly the UI layer. TypeScript is enforced for type safety, and the project will be deployed to Azure using an auto-deploy GitHub Actions pipeline, remaining in the same ecosystem as the backend.
