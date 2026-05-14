# Skill-Turn Observer Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build Apollo's first useful vertical slice: detect Pi skill usage, observe the resulting agent turn until true completion, and run asynchronous session-scoped analysis.

**Architecture:** Apollo should be session-first, not database-first. A small observer subscribes to Pi harness events, records a `SkillRun` in ephemeral session state, treats `AskUserQuestion` as a non-terminal awaiting-user state, and schedules a post-run analyzer after the harness settles.

**Tech Stack:** TypeScript, Pi `AgentHarness` event shapes by structural typing, Node test runner, no database.

---

## Current reality

- Apollo repo exists at `allends/apollo`.
- Current scaffold has generic event/store/extension modules and a SQLite placeholder.
- Pi reference repo shows relevant harness seams:
  - `AgentHarness.skill(name, additionalInstructions?)` formats a skill prompt and calls `executeTurn`.
  - `before_agent_start` includes `prompt` and `resources`.
  - `tool_call` / `tool_result` expose tool lifecycle metadata.
  - `turn_end` emits a save point.
  - `agent_end` makes harness idle and emits `settled`.
- `AskUserQuestion` appears as a Claude Code-compatible tool name in Pi provider code. Apollo should treat it as an intermediate awaiting-user signal, not a completed run.

## Task 1: Add skill-run domain types

**Objective:** Define the session-scoped records Apollo will use before any observer logic exists.

**Files:**

- Create: `src/session/types.ts`
- Modify: `src/index.ts`

**Steps:**

1. Create `SkillRunStatus = "active" | "awaiting_user" | "completed" | "failed"`.
2. Create `SkillRun` with `id`, `sessionId`, `skillName`, optional `skillFilePath`, timestamps, `events`, optional `analysis`, optional `error`.
3. Create `SkillRunSnapshot` as an immutable copy passed to analyzers.
4. Export these types from `src/index.ts`.
5. Run `npm run typecheck`.

**Verification:** Typecheck passes and no runtime behavior changes.

## Task 2: Add in-memory skill-run session state

**Objective:** Store active and completed skill runs on the Apollo runtime/session without persistence.

**Files:**

- Create: `src/session/skill-run-state.ts`
- Test: `tests/skill-run-state.test.ts`

**Steps:**

1. Write tests for:
   - starting a skill run
   - appending events
   - marking awaiting-user
   - completing a run
   - returning a defensive snapshot
2. Implement `createSkillRunState()` with methods:
   - `startRun(input)`
   - `appendEvent(runId, event)`
   - `markAwaitingUser(runId)`
   - `completeRun(runId)`
   - `failRun(runId, error)`
   - `listRuns()`
   - `getRun(runId)`
   - `getActiveRun()`
3. Run the specific test, then `npm test`.

**Verification:** Tests prove `awaiting_user` is non-terminal and completion requires `completeRun()`.

## Task 3: Replace Apollo runtime store emphasis with skill-run state

**Objective:** Make `createApollo()` expose session skill-run state as the primary first-slice state.

**Files:**

- Modify: `src/apollo.ts`
- Modify: `src/types.ts`
- Modify: `src/index.ts`

**Steps:**

1. Add `skillRuns` to `ApolloRuntime`.
2. Keep the existing generic store only if needed for current tests, but stop presenting it as the primary architecture.
3. Update `ApolloConfig` to remove database-first comments and add optional analyzer config if needed.
4. Run existing tests.

**Verification:** Existing redaction test still passes, and new skill-run tests pass.

## Task 4: Add analyzer interface and deterministic first analyzer

**Objective:** Provide the asynchronous job that runs after a skill turn completes.

**Files:**

- Create: `src/analyzer/types.ts`
- Create: `src/analyzer/basic-analyzer.ts`
- Test: `tests/basic-analyzer.test.ts`

**Steps:**

1. Define `SkillRunAnalyzer = (snapshot: SkillRunSnapshot) => Promise<SkillRunAnalysis>`.
2. Define `SkillRunAnalysis` with:
   - `summary`
   - `outcome: "completed" | "asked_user" | "tool_error" | "unknown"`
   - `signals: string[]`
3. Implement deterministic classification:
   - if any event has tool name `AskUserQuestion` or case-insensitive `ask-user`, outcome is `asked_user`
   - else if any tool result has `isError`, outcome is `tool_error`
   - else if completed with events, outcome is `completed`
   - otherwise `unknown`
4. Tests should cover all outcomes.

**Verification:** Analyzer does not need an LLM and does not throw on sparse input.

## Task 5: Add skill invocation detection helper

**Objective:** Parse Pi's formatted skill prompt into a skill identity.

**Files:**

- Create: `src/observer/skill-detection.ts`
- Test: `tests/skill-detection.test.ts`

**Steps:**

1. Detect prompts starting with `<skill name="..." location="...">`.
2. Return `{ skillName, skillFilePath }` when matched.
3. Return `null` for normal prompts.
4. Prefer matching against `event.resources.skills` when available so names/paths are not only regex-derived.
5. Test with a prompt copied from Pi's `formatSkillInvocation` format.

**Verification:** Skill prompt detection works without importing Pi internals.

## Task 6: Add structural Pi harness observer

**Objective:** Subscribe to Pi harness events and manage `SkillRun` lifecycle.

**Files:**

- Create: `src/observer/types.ts`
- Create: `src/observer/skill-turn-observer.ts`
- Test: `tests/skill-turn-observer.test.ts`

**Steps:**

1. Define a structural `ObservableHarness` with `subscribe(listener): () => void`.
2. Implement `installApolloSkillTurnObserver({ harness, apollo, analyzer? })`.
3. On `before_agent_start`, detect skill and call `startRun`.
4. On `tool_call` and `tool_result`, append redacted events to the active run.
5. If tool name is `AskUserQuestion` / `ask-user`, mark run `awaiting_user` but keep it active.
6. On `settled`, complete the active run and schedule analyzer via `queueMicrotask` or a Promise chain.
7. Capture analyzer errors on the run instead of throwing through the harness listener.
8. Return unsubscribe/cleanup function.

**Verification:** Test simulates events in order and proves analysis runs only after `settled`, not at ask-user.

## Task 7: Update optional extension tools to inspect skill runs

**Objective:** Make Pi-facing tools reflect the first module instead of generic database/proposal concepts.

**Files:**

- Modify: `src/extension/pi-extension.ts`
- Test: update or add `tests/pi-extension.test.ts`

**Steps:**

1. Replace proposal-heavy initial tools with:
   - `apollo_list_skill_runs`
   - `apollo_get_skill_run`
   - `apollo_record_skill_outcome`
2. Keep proposal tools out until the proposal module exists.
3. Ensure tool outputs are bounded and session-scoped.
4. Run tests.

**Verification:** Tool adapter is thin over `apollo.skillRuns`.

## Task 8: Update examples and docs

**Objective:** Make the repo explain the real first implementation target.

**Files:**

- Modify: `examples/register-extension.ts`
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/implementation-plan.md`

**Steps:**

1. Show `installApolloSkillTurnObserver({ harness, apollo })` in the example.
2. Explain the ask-user/non-terminal behavior.
3. Remove database-first language.
4. Mention later persistence options: Pi local sessions first, storage adapter only if needed.

**Verification:** Docs match the code shape.

## Task 9: Final validation

**Objective:** Verify the first slice is shippable as a scaffolded module.

**Commands:**

```bash
npm run typecheck
npm test
git status --short
```

**Expected:** Typecheck and tests pass. `git status` only shows intended files.
