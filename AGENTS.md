# Repository Guidelines

## Purpose and Sources

This repository documents a human-directed AI software lifecycle based on evolutionary prototypes. Development activities are prototype building, refactoring, review and polishing, followed by independent acceptance, direct local release and maintenance. Activities can be tailored per feature or iteration.

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

After each authorized change, run the relevant checks, commit the complete task change, and push the current branch to all three configured remotes: `origin`, `github`, and `gitee`. Do not force-push. If a commit or push fails, preserve the work and report the blocker with the remote and command that failed.
