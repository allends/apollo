# Architecture

Apollo v1 is a Pi-native extension that observes skill-driven runs.

It does not own persistence, scheduling, or an agent loop. Pi already provides the extension lifecycle, session manager, package loading, commands, and event stream we need.

## V1 data flow

```text
Pi package loads extensions/apollo.ts
  -> Apollo registers pi.on(...) handlers
  -> input sees /skill:name when present
  -> before_agent_start confirms expanded skill invocation
  -> tool_call/tool_result record lightweight signals
  -> Apollo waits for agent_end before analyzing the run
  -> turn_end is recorded as intermediate lifecycle only
  -> agent_end completes the run
  -> async analyzer attaches a session-local finding
```

## Modules

- `extensions/apollo.ts` — Pi package entrypoint.
- `src/observer/` — Pi event handlers and skill detection.
- `src/session/` — tiny in-memory skill-run list for the active extension instance.
- `src/analyzer/` — deterministic async classifier.
- `src/events/` — minimal event shapes.

## Pi-native concepts Apollo uses

- `pi.on("input")` for raw skill command detection.
- `pi.on("before_agent_start")` for expanded skill detection.
- `pi.on("tool_call")` and `pi.on("tool_result")` for tool signals.
- `pi.on("agent_end")` for run completion.
- `pi.registerCommand("apollo")` for simple status inspection.
- Pi package manifest `pi.extensions` for installation.

## Explicitly deferred

- SQLite or any Apollo-owned database.
- Proposal generation/apply workflow.
- Background daemon/runner.
- Custom tool registry abstraction.
- Raw `AgentHarness.subscribe(...)` integration.
- Durable storage. If needed later, prefer `pi.appendEntry(customType, data)` or reconstruct from `ctx.sessionManager.getBranch()`.
