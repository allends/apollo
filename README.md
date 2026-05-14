# Apollo

Apollo is a small Pi-native extension for observing skill-driven agent runs.

It is intentionally **not** a fork of Pi and not a separate agent framework. The first version uses Pi's documented extension API and keeps all state in memory for the active session.

## First version

Apollo does one thing:

1. Notices when a `/skill:name` command or expanded skill prompt starts an agent run.
2. Watches Pi lifecycle events for that run.
3. Waits for Pi's documented `agent_end` event.
4. Runs a tiny async analyzer and keeps the finding on the session-local run list.

No database. No proposal engine. No custom storage layer.

## Pi-native pieces used

- `export default function (pi)` package extension entrypoint.
- `pi.on("input")` to catch raw `/skill:name` before expansion.
- `pi.on("before_agent_start")` to catch expanded skill prompts and loaded skill metadata.
- `pi.on("tool_call")` and `pi.on("tool_result")` for observed tool activity.
- `pi.on("turn_end")` as an intermediate event only.
- `pi.on("agent_end")` as the first-version completion boundary.
- `pi.registerCommand("apollo")` for a minimal session-local status command.

## Install shape

Apollo declares a Pi package manifest in `package.json`:

```json
{
  "pi": {
    "extensions": ["./extensions"]
  }
}
```

That lets Pi load `extensions/apollo.ts` when installed from git/local path.
