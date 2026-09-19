# Repository Guidelines

## Repository Purpose

This repository documents a specification-driven workflow for using AI throughout software development. It contains the FocusTask example specification, architecture constraints, roadmap, and coding and acceptance-agent rules. It is documentation-only; no runnable implementation or `package.json` is currently present.

## Structure and Sources of Truth

- `README.md`: repository overview and document precedence.
- `docs/product.md`, `docs/glossary.md`, `docs/domain.md`, `docs/permissions.md`: product and domain rules.
- `docs/features/` and `docs/pages/`: feature and page specifications.
- `docs/repository-initialization.md`: guidance for Agent rules and the minimum engineering baseline.
- `docs/development-workflow.md`: task lifecycle, review, acceptance, and change handling.
- `docs/agent-context-management.md`: session handoff, evidence, and multi-Agent collaboration.
- `docs/architecture.md` and `docs/non-functional.md`: implementation and quality constraints.
- `docs/release-readiness.md`: pre-release checks and go/no-go criteria.
- `docs/roadmap.md`: ordered work items and statuses.
- `docs/decisions/`: durable decisions; add one for consequential or hard-to-reverse changes.
- `docs/definition-of-done.md`: completion checklist and delivery-report template.

When documents conflict, follow the priority defined in `README.md`. Do not invent unresolved business, permission, or billing rules.

## Contribution Workflow

Work on one independently verifiable roadmap item at a time. Read the relevant product, glossary, feature/page, domain, permission, architecture, decision, and completion documents first. Keep changes scoped and reuse established patterns. Update affected specifications and tests together. Do not add secrets, tokens, or real personal data.

Specification changes must update every affected cross-reference, acceptance criterion, dependency, and roadmap status in the same change. New decision records should state the context, decision, alternatives considered, and consequences. Keep examples fictional and prefer stable, explicit terminology from `docs/glossary.md`.

For implementation work, the intended commands are `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`; these are architectural expectations and cannot be run until the application scaffold exists. Report unavailable commands as unable to execute, never as passing. UI work must check `1440x900`, `1024x768`, `768x1024`, and `390x844` plus all specified states.

## Testing and Acceptance

Business rules require automated coverage. The coding agent reports changed files, verification results, evidence, risks, and specification deviations. An independent acceptance agent must not modify product implementation and must classify each criterion as `通过`, `失败`, `无法判定`, or `阻塞`, with reproduction steps and evidence for failures.

For documentation changes, check links, headings, terminology, examples, and consistency with `README.md` and source-of-truth documents. Once implementation exists, apply the full command and UI checks above.

## Commits and Pull Requests

Use concise imperative commit messages with a scope, following the existing pattern, for example `docs: clarify task acceptance flow`. Pull requests should explain the affected specification or roadmap item, list validation results and known risks, and include screenshots or test evidence for UI changes.
