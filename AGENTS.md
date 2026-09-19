# Repository Guidelines

## Purpose and Sources

This repository documents a human-directed AI software lifecycle based on evolutionary prototypes. Development activities are prototype building, refactoring, review and polishing, followed by independent acceptance, direct local release and maintenance. Activities can be tailored per feature or iteration.

Read `execution/status.md`, `AI_LIFECYCLE_V03_REFINEMENT_PLAN.md`, `model/overview.md` and `model/conventions.md` before model changes. For cleanup, also read `AI_LIFECYCLE_V03_CLEANUP_PLAN.md` and its execution record. Do not repeat completed cleanup or assume the full v0.3 model is implemented.

## Organization

- `model/`: artifact specifications, practices and available lifecycle guides.
- `templates/`: unfilled artifact templates.
- `examples/focustask/`: teaching context and examples only; read its local AGENTS.
- `execution/`: current status, cleanup manifest and verification records.
- `scripts/`: documentation checks and diagram tooling.

There is no application, database or empirical evidence directory. A01-A22 exist; the four detailed activity guides, A23-A27 and new diagrams remain planned. Do not generate them during cleanup.

## Working Rules

Preserve unrelated edits and complete one verifiable task at a time. Update specifications, examples, indexes and links together. Confirm new business rules with the user; resolve routine choices within scope. Record consequential decisions without inventing approval.

Every AI-driven workflow needs actionable prompts. When a problem is found, check related patterns across the project, distinguish confirmed instances from suspicions, and recheck fixes. Stable rules belong here; transient progress belongs in execution status.

## Verification and Safety

Run `node scripts/check-docs.mjs` and `node --test scripts/check-docs.test.mjs` for documentation tooling. Inspect semantics too. Missing tools or inputs are unavailable, not passing. Diagram generation requires new source files; its missing-input diagnostic does not prove rendering succeeded.

Use fictional teaching data. Never record credentials, fabricate test or deployment results, or treat examples as empirical evidence. Stop only task-owned processes. Cleanup requires its recorded pre-cleanup commit; do not create another commit, push, or restore deleted history without new authorization.

Report changed scope, actual checks, risks and the next task. Commit messages describe intent and scope, such as `docs: clarify artifact handoffs`.
