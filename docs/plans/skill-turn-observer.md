# Apollo V1 Pi-Native Plan

> **For Hermes:** Keep this implementation simple. Do not add persistence, databases, proposal engines, or background daemons in v1.

**Goal:** Observe skill-driven Pi runs using only documented Pi extension APIs.

**Architecture:** Apollo is a Pi package with one extension entrypoint. It keeps an in-memory list of skill runs for the active session, finalizes runs on `agent_end`, and attaches a deterministic async analysis.

**Tech Stack:** TypeScript, Pi coding-agent extension API, Node test runner.

---

## Task 1: Package shape

**Objective:** Make Apollo install as a normal Pi package.

**Files:**

- `package.json`
- `extensions/apollo.ts`

**Implementation:**

- Add `pi.extensions: ["./extensions"]`.
- Export default function from `extensions/apollo.ts`.
- Import `createApollo` and `installApolloSkillTurnObserver`.

**Verification:** `npm run typecheck` passes.

## Task 2: Skill detection

**Objective:** Detect skill usage without private Pi APIs.

**Files:**

- `src/observer/skill-detection.ts`

**Implementation:**

- `detectSkillCommand(text)` handles raw `/skill:name` from `input`.
- `detectExpandedSkill(prompt, skills)` handles expanded `<skill name="...">` prompts from `before_agent_start`.

**Verification:** Unit tests cover raw and expanded skill forms.

## Task 3: Session-local state

**Objective:** Track observed skill runs in memory only.

**Files:**

- `src/session/types.ts`
- `src/session/skill-run-state.ts`

**Implementation:**

- Maintain `SkillRun[]`.
- Statuses: `active`, `awaiting_user`, `completed`, `failed`.
- `AskUserQuestion` moves to `awaiting_user` but does not complete.

**Verification:** Unit tests prove `turn_end` and ask-user do not complete the run.

## Task 4: Pi event observer

**Objective:** Wire Apollo to Pi's documented event lifecycle.

**Files:**

- `src/observer/types.ts`
- `src/observer/skill-turn-observer.ts`

**Implementation:**

- Register handlers with `pi.on(...)`.
- Use `input` and `before_agent_start` to start a run.
- Record `tool_call`, `tool_result`, and `turn_end` as lightweight events.
- Complete and analyze on `agent_end`.
- Add `/apollo` command for status.

**Verification:** Unit test with a fake `pi` object emits events and checks final analysis.

## Task 5: Trim deferred pieces

**Objective:** Keep v1 small.

**Remove/defer:**

- SQLite store.
- Generic event store.
- Proposal module.
- Background runner.
- Raw harness adapter.
- Tool-extension registry abstraction.

**Verification:** `git ls-files` contains only v1 modules.
