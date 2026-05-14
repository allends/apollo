# Apollo

Apollo is a portable learning-loop extension for Pi editors.

Apollo is intentionally **not** a fork of the Pi coding agent. It is the small installable layer that any Pi editor/runtime can add to observe skill-driven turns, run asynchronous end-of-turn analysis, and stage reviewable improvements.

## First module: skill-turn observer

The first logical implementation is a **skill-turn observer**:

1. Detect when a Pi skill is invoked.
2. Track the current skill-bound agent turn in session memory.
3. Wait for the real end of the agent run/turn.
4. Run a non-blocking asynchronous analyzer over the completed turn.
5. Store results on the active session for now, not in a database.

Important nuance: `AskUserQuestion` / ask-user should **not** be treated as the end of the agent turn when Pi exposes enough event state to tell the difference. A skill turn is complete when the harness/agent settles, not merely when the assistant asks the user for more information.

## Goals

- Install into any Pi editor/runtime as an extension.
- Use Pi harness/session niceties instead of owning the whole persistence layer.
- Keep the first pass session-scoped and ephemeral.
- Use local session history only when a module needs deeper context.
- Keep extension modules small and replaceable.

## Non-goals

- Do not vendor or fork the whole Pi agent/editor.
- Do not build a database before the session-scoped loop proves useful.
- Do not silently rewrite active instructions.
- Do not broaden tool permissions automatically.
- Do not store secrets, cookies, tokens, or raw credential-like values.

## Package shape

```ts
import { createApollo, installApolloSkillTurnObserver } from "apollo";

const apollo = createApollo();

installApolloSkillTurnObserver({
  pi,
  apollo,
});
```

## Module boundaries

- `src/observer/` — subscribes to Pi harness events and detects skill turns.
- `src/session/` — in-memory session state for observed skill runs and analyzer outputs.
- `src/analyzer/` — async end-of-turn analysis pipeline.
- `src/events/` — normalized Apollo event types and redaction.
- `src/extension/` — optional tool/extension adapter exposed to Pi editors.
- `src/proposals/` — later reviewable improvement proposals.

See `docs/architecture.md`, `docs/implementation-plan.md`, and `docs/plans/skill-turn-observer.md`.
