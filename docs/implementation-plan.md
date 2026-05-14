# Implementation Plan

## Milestone 1 — Pi-native skill observer

- [x] Package Apollo as a Pi package with `pi.extensions`.
- [x] Add `extensions/apollo.ts` as the default extension entrypoint.
- [x] Use `pi.on("input")` to catch raw `/skill:name` usage.
- [x] Use `pi.on("before_agent_start")` to detect expanded skill prompts.
- [x] Use `tool_call` / `tool_result` for lightweight signals.
- [x] Treat `AskUserQuestion` as `awaiting_user`, not completion.
- [x] Complete only on `agent_end`.
- [x] Run deterministic async analysis after completion.
- [x] Add `/apollo` status command.

## Milestone 2 — Verify against Pi

- [ ] Install locally with `pi -e /path/to/apollo` or `pi install /path/to/apollo`.
- [ ] Run a `/skill:name` flow.
- [ ] Confirm `/apollo` reports the observed skill run.
- [ ] Confirm an ask-user flow stays `awaiting_user` until `agent_end`.

## Later only if needed

- Persist summaries with `pi.appendEntry("apollo", data)`.
- Reconstruct state from `ctx.sessionManager.getBranch()` on `session_start` / `session_tree`.
- Add proposal generation from repeated findings.
