# Implementation Plan

## Milestone 0 — Reframe around skill-turn observation

- [x] Create Apollo as an extension-only repo.
- [x] Add TypeScript package metadata.
- [x] Replace database-first framing with session-scoped skill-turn observation.
- [x] Document the `AskUserQuestion` / ask-user boundary: ask-user is not terminal.

## Milestone 1 — Skill-turn observer

- [ ] Add `src/session/skill-run-state.ts` with in-memory `SkillRun` tracking.
- [ ] Add `src/observer/skill-turn-observer.ts` that registers documented Pi extension handlers via `pi.on(...)`.
- [ ] Detect explicit skill invocation from `before_agent_start` formatted skill prompts.
- [ ] Capture `tool_call`, `tool_result`, `turn_end`, and `agent_end` events into the active `SkillRun`.
- [ ] Mark `AskUserQuestion` as `awaiting_user`, not `completed`.
- [ ] Finalize a skill run only on documented `agent_end`; never on `turn_end` or ask-user.
- [ ] Dispatch analysis asynchronously after finalization.

## Milestone 2 — Analyzer interface

- [ ] Add `src/analyzer/types.ts` for `SkillRunSnapshot` and `SkillRunAnalysis`.
- [ ] Add deterministic first analyzer that classifies:
  - completed normally
  - asked user for context
  - tool error occurred
  - no meaningful assistant output
- [ ] Attach analyzer output to the session-scoped `SkillRun`.
- [ ] Ensure analyzer errors are captured on the run and never throw into the host harness.

## Milestone 3 — Pi integration adapter

- [ ] Replace generic placeholder extension docs with host adapter docs.
- [ ] Export `installApolloSkillTurnObserver({ pi, apollo })` for Pi coding-agent extensions.
- [ ] Type the adapter against `ExtensionAPI` where practical; keep analyzer/session modules independent from Pi internals.
- [ ] Add example integration using a Pi coding-agent extension entrypoint.

## Milestone 4 — Inspection tools

- [ ] Add optional tools for inspecting current session state:
  - `apollo_list_skill_runs`
  - `apollo_get_skill_run`
  - `apollo_record_skill_outcome`
- [ ] Keep these tools as adapters over session state.
- [ ] Do not add proposal-writing tools yet.

## Milestone 5 — Proposal loop later

- [ ] Use repeated analyzer findings to stage skill/instruction improvement proposals.
- [ ] Include evidence references from session-local skill runs.
- [ ] Add human review/apply flow.
- [ ] Only revisit durable persistence if session state + local Pi sessions are insufficient.

## Verification commands

```bash
npm run typecheck
npm test
```
