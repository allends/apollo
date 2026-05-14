# Architecture

Apollo is a standalone Pi editor extension, not a fork of Pi.

The current architecture is intentionally smaller than the original `openclaw-hermes-loop` sketch. Pi already provides useful harness/session primitives, so Apollo should first live at the skill-turn lifecycle seam and keep its state on the active session.

## First vertical slice

The first logical implementation is the **skill-turn observer**.

```text
Pi documented extension event stream
  -> Apollo detects skill invocation
  -> Apollo records a session-scoped SkillRun
  -> Pi agent runs normally
  -> AskUserQuestion may occur, but does not finalize the run
  -> Pi emits `agent_end`
  -> Apollo snapshots the completed turn
  -> async analyzer runs without blocking the UI
  -> analysis result attaches to the session-scoped SkillRun
```

## Layers

### 1. Observer

`src/observer/` owns host integration.

Responsibilities:

- Register Pi extension handlers with `pi.on(...)`.
- Detect explicit skill invocation from the `before_agent_start` prompt and resource snapshot.
- Track tool calls/results during the active skill run.
- Treat `agent_end` / true agent-run completion as the end boundary.
- Avoid ending the run on `AskUserQuestion` when the harness exposes that as a tool call or tool result.

The observer should be a thin lifecycle coordinator. It should not perform analysis or persistence itself.

### 2. Session state

`src/session/` owns ephemeral Apollo state.

Responsibilities:

- Maintain `SkillRun` records for the active Pi session.
- Store normalized event snippets, bounded message summaries, tool call metadata, and analyzer output.
- Expose lookup helpers for current/last skill runs.

This replaces the initial database/store emphasis. Durable persistence can come later by reading Pi local sessions or by adding a storage adapter only after the session-scoped behavior is useful.

### 3. Analyzer

`src/analyzer/` owns asynchronous post-turn processing.

Responsibilities:

- Receive a completed `SkillRunSnapshot`.
- Classify whether the skill helped, failed, asked for context, or exposed missing instructions.
- Generate a short finding on the session object.
- Never block the agent turn or UI.

The first analyzer can be deterministic and cheap. LLM-backed analysis can be a later module.

### 4. Event normalization and redaction

`src/events/` owns normalized Apollo events.

Responsibilities:

- Redact credential-like keys and values.
- Keep host event adapters stable even if Pi changes event names.
- Represent `AskUserQuestion` as an intermediate event, not a completion signal.

### 5. Optional extension tools

`src/extension/` can expose Apollo inspection tools to the Pi editor:

- `apollo_list_skill_runs`
- `apollo_get_skill_run`
- `apollo_record_skill_outcome`

These are secondary to the observer. The observer is the first useful module.

### 6. Proposals

`src/proposals/` remains a later module.

It should consume analyzer findings and stage reviewable skill/instruction updates. It must not auto-apply behavior changes.

## Integration seams from Pi

Current Pi documented extension points:

- Extensions export `default function (pi: ExtensionAPI)`.
- `input` fires before skill/template expansion and can see raw `/skill:name` input.
- `before_agent_start` fires after expansion and exposes the prompt plus `systemPromptOptions.skills`.
- `tool_call` and `tool_result` expose tool lifecycle events, including likely `AskUserQuestion` under Claude Code compatibility.
- `turn_end` fires after one LLM response + tool calls; this is not the final run boundary.
- `agent_end` fires once per user prompt with the messages from that prompt and is the right first boundary for asynchronous post-run analysis.

Apollo should use the documented Pi coding-agent extension API (`export default function (pi: ExtensionAPI)`, `pi.on(...)`, `pi.registerTool(...)`) rather than raw `AgentHarness.subscribe(...)`. The lower-level harness notes are useful for understanding lifecycle semantics, but the installable extension adapter should speak Pi’s public extension API.

## Data model for the first slice

```ts
interface SkillRun {
  id: string;
  sessionId: string;
  skillName: string;
  skillFilePath?: string;
  status: "active" | "awaiting_user" | "completed" | "failed";
  startedAt: string;
  endedAt?: string;
  events: ApolloEvent[];
  analysis?: SkillRunAnalysis;
}
```

`awaiting_user` is explicitly not terminal. It means the skill turn used ask-user and the session is waiting for user input or a queued continuation.

## Later persistence

Apollo should not introduce a database yet. Later options, in order:

1. Read Pi's local session tree when deeper context is needed.
2. Attach Apollo metadata to the host session if Pi exposes a safe extension metadata API.
3. Add a storage adapter only if session-native state is insufficient.
