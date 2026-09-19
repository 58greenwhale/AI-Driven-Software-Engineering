# Repository Guidelines

## Purpose and Sources

This repository defines a human-directed AI software lifecycle, from requirements through maintenance. Every stage has artifacts, reusable templates, actionable prompts, and evidence requirements. FocusTask is the local empirical example; its original product vision is broader than the selected experiment.

Read `AI_LIFECYCLE_IMPLEMENTATION_PLAN.md`, `execution/status.md`, `model/overview.md`, and `model/conventions.md` before changing the model. For application work, also read the nearest AGENTS file, empirical scope, relevant domain/permissions, feature/page specifications, architecture, decisions, and quality criteria under `examples/focustask`.

## Organization

- `model/`: stages, artifact specifications, shared practices and tailoring.
- `templates/`: unfilled artifact templates.
- `examples/focustask/`: example specifications, application and real evidence.
- `execution/`: task progress, decisions and blockers; `baseline/` is a frozen historical archive.
- `docs/`: compatibility links to migrated material.

## Working Rules

Preserve existing edits. Advance one independently verifiable task from the execution plan at a time; application tasks use their empirical iteration plan. Reuse existing conventions and update affected specifications, tests, links and traceability together.

Follow recorded user decisions, including direct local deployment without Docker. Resolve routine implementation choices within scope; surface missing rules that change business data, permissions or acceptance. Record consequential technical choices in ADRs. Never invent human approval, external PR/CI status, test results or deployment history.

## Verification and Evidence

Run `node scripts/check-docs.mjs` for documentation; inspect semantics as well as links. Once the application exists, run its real lint, typecheck, unit/integration, E2E and build commands. UI checks cover 1440x900, 1024x768, 768x1024 and 390x844 with specified states. Missing tools or commands are unavailable, not passing.

Independent acceptance reads confirmed specifications and the exact candidate without modifying implementation. Report each criterion as 通过, 失败, 无法判定 or 阻塞, with reproduction and evidence for failures. Template examples are never execution evidence.

## Delivery and Safety

Report scope, changed files, actual checks, evidence, risks and next step. Maintain execution status across sessions. Use fictional data, ignore real credentials and local databases, and stop only task-owned processes. Local review records may substitute for hosted PRs when documented; do not claim remote integration occurred. Commit messages describe intent with a scope, such as `docs: define artifact handoffs`.
