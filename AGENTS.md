# Repository Guidelines

## Purpose and Sources

This repository documents a human-directed AI software lifecycle based on evolutionary prototypes. Development activities are prototype building, refactoring, review and polishing, followed by independent acceptance, direct local release and maintenance. Activities can be tailored per feature or iteration.

Before model changes, read `model/overview.md`, `model/conventions.md`, `AI_LIFECYCLE_V03_REFINEMENT_PLAN.md` and `execution/status.md`. Use the active task identified in status as the execution scope. Check actual files and available commands before declaring work ready or complete.

## Organization

- `model/`: artifact specifications, practices and lifecycle guides.
- `templates/`: unfilled artifact templates.
- `examples/focustask/`: teaching context and examples; read its local AGENTS.
- `execution/`: current tasks, coverage and verification results.
- `scripts/`: documentation checks and diagram tooling.

Teaching scenarios describe inputs and expected behavior. Actual product development or empirical work requires its own confirmed scope, implementation and evidence.

## Working Rules

Preserve unrelated edits and complete one verifiable task at a time. Update specifications, examples, indexes and links together. Confirm new business rules with the user; resolve routine choices within scope. Record consequential decisions with their source.

Write standalone instructions that explain the current model, inputs, outputs and checks. Keep repository progress in execution status. Every AI-driven workflow needs actionable prompts. When a problem is found, inspect related patterns across the project, distinguish confirmed instances from suspicions, fix authorized issues and recheck them.

## Verification and Delivery

Run `node scripts/check-docs.mjs` and `node --test scripts/check-docs.test.mjs` for documentation tooling. Inspect semantics as well as links. Diagram generation requires Mermaid sources and a working renderer; a missing-input diagnostic is not a successful export.

Use fictional teaching data. Never record credentials, fabricate approval, tests or deployment results, or treat examples as evidence. Stop only task-owned processes.

After completing changes to code, scripts, configuration or documentation, run the relevant checks, commit the task's changes, and push the current branch to its configured upstream remote. This is the default delivery workflow; proceed without asking again unless the user explicitly instructs otherwise. Exclude unrelated edits, secrets and ignored files. Verify the remote branch matches the local commit before reporting delivery. If committing or pushing fails, preserve the work and report the blocker; do not force push without explicit authorization.

Report changed scope, actual checks, risks and the next task. Use intent-focused commit messages with a scope, such as `docs: clarify artifact handoffs`.
