# Implementation Plan

## Milestone 0 — Standalone repo scaffold

- [x] Create Apollo as an extension-only repo.
- [x] Add TypeScript package metadata.
- [x] Add extension, store, event, proposal, distiller, runner directories.
- [x] Add initial docs inspired by `openclaw-hermes-loop`.

## Milestone 1 — Durable store

- [ ] Implement SQLite schema and migrations.
- [ ] Add append-only event writes.
- [ ] Add bounded retrieval and search.
- [ ] Add privacy/redaction tests.

## Milestone 2 — Pi editor integration

- [ ] Validate `PiToolExtension` shape against current Pi editor registry.
- [ ] Add install docs for a host editor.
- [ ] Add a fixture integration test.

## Milestone 3 — Distillation

- [ ] Summarize completed sessions.
- [ ] Extract repeated workflows and corrections.
- [ ] Track repeated failures and missing capabilities.

## Milestone 4 — Proposals

- [ ] Define proposal persistence.
- [ ] Generate proposals from distilled patterns.
- [ ] Add review/apply commands with rollback notes.

## Milestone 5 — Hardening

- [ ] Store backup/import/export.
- [ ] Retention policy.
- [ ] Package release workflow.
