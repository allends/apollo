# Pi Native Notes for Apollo

Useful Pi concepts for the first Apollo version:

## Package/extension loading

- Pi packages can declare extension resources in `package.json` under `pi.extensions`.
- Extension modules export `default function (pi: ExtensionAPI)`.
- Pi can install from local paths, git URLs, or npm packages, so Apollo should stay package-shaped instead of asking users to paste files into an editor.

## Lifecycle events

- `input`: fires before skill/template expansion. This is the simplest way to detect raw `/skill:name` usage.
- `before_agent_start`: fires after expansion and includes `systemPromptOptions.skills`. This is the fallback when skill usage is already expanded before Apollo sees input.
- `tool_call`: fires before tool execution and records observed tool activity.
- `tool_result`: captures tool error status and completion.
- `turn_end`: one LLM response + tool cycle. Useful as an observed event, but too early for final analysis.
- `agent_end`: once per user prompt. Best first-version boundary for asynchronous skill-run analysis.
- `session_start` / `session_tree`: useful later if Apollo reconstructs state from session entries.
- `session_shutdown`: useful later for cleanup or final summaries.

## Session/state APIs

- `ctx.sessionManager.getBranch()` reads the current branch without needing our own DB.
- `pi.appendEntry(customType, data)` can persist extension state outside LLM context if we later need it.
- `pi.sendMessage(...)` can inject context into LLM-visible history, but Apollo should avoid this in v1.
- `pi.registerCommand(...)` is enough for lightweight inspection (`/apollo`).

## What this lets us delete for v1

- No SQLite store.
- No separate proposal module.
- No custom ToolExtension registry abstraction.
- No background runner/daemon.
- No generic event database.
- No raw `AgentHarness.subscribe(...)` dependency.

## Simple v1 design

`extensions/apollo.ts` installs the observer. The observer owns only lifecycle wiring. `src/session` owns a tiny in-memory list of observed skill runs. `src/analyzer` is deterministic and async. Later, if Apollo needs durable memory, prefer Pi-native `appendEntry` or reconstructing from `ctx.sessionManager.getBranch()` before adding any new storage.
