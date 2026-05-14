# Architecture

Apollo is a standalone Pi editor extension, not a fork of Pi.

## Layers

1. **Pi extension adapter** — exports `APOLLO_EXTENSION(apollo)` with tools that the host editor can register.
2. **Event capture seam** — `recordSessionEvent(event)` is the only write path for runtime history.
3. **Store** — append-only sanitized events plus derived summaries/proposals. The scaffold ships with an in-memory store and a SQLite interface placeholder.
4. **Distiller** — background jobs that summarize sessions and identify repeated workflows, failures, and corrections.
5. **Proposal layer** — stages instruction/skill changes with rationale, evidence, risk, and diff.
6. **Runner** — idempotent maintenance entrypoint for host schedulers or editor lifecycle hooks.

## Data flow

```text
Pi editor runtime
  -> Apollo extension tools / event capture
  -> local store
  -> background distiller
  -> staged proposals
  -> human review/apply
```

## Integration contract

The host Pi editor owns its extension registry. Apollo only exports plain extension/tool objects so it can be installed into any Pi editor without vendoring the editor itself.
