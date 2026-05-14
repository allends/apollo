# Apollo

Apollo is a portable self-learning loop extension for Pi editors.

It is intentionally **not** a fork of the Pi coding agent. Apollo is the small installable layer that any Pi editor can add to capture local session events, summarize outcomes, detect repeated workflows, and stage reviewable behavior-change proposals.

## Goals

- Install into any Pi editor/runtime as an extension.
- Persist local session history and outcomes through a narrow event API.
- Distill repeated workflows, failures, and user corrections into observations.
- Stage skill/instruction updates as reviewable proposals with evidence.
- Keep raw history local and redact secret-like values before storage.

## Non-goals

- Do not vendor or fork the whole Pi agent/editor.
- Do not silently rewrite active instructions.
- Do not broaden tool permissions automatically.
- Do not store secrets, cookies, tokens, or raw credential-like values.

## Package shape

```ts
import { APOLLO_EXTENSION, createApollo } from "apollo";

const apollo = createApollo({
  storePath: "./apollo.db",
});

// Register with the host Pi editor's extension registry.
registry.register(APOLLO_EXTENSION(apollo));
```

## Initial surface

- `recordSessionEvent(event)` captures sanitized session/message/tool/outcome events.
- `ApolloStore` defines append-only writes and bounded retrieval.
- `APOLLO_EXTENSION()` exposes thin Pi tool adapters:
  - `apollo_search_sessions`
  - `apollo_get_session`
  - `apollo_record_outcome`
  - `apollo_list_proposals`
  - `apollo_propose_instruction_update`
- Background modules distill history and stage proposals; they do not auto-apply high-risk changes.

See `docs/architecture.md`, `docs/safety-model.md`, and `docs/implementation-plan.md`.
