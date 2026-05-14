import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createApollo, installApolloSkillTurnObserver } from "../src/index.js";
import type { PiContext, PiExtensionAPI } from "../src/observer/types.js";

class FakePi implements PiExtensionAPI {
  handlers = new Map<string, Array<(event: never, ctx: PiContext) => void | Promise<void>>>();
  commandNames: string[] = [];

  on(event: string, handler: (event: never, ctx: PiContext) => void | Promise<void>): void {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
  }

  registerCommand(name: string): void {
    this.commandNames.push(name);
  }

  async emit(event: string, payload: unknown = {}): Promise<void> {
    for (const handler of this.handlers.get(event) ?? []) {
      await handler(payload as never, {});
    }
  }
}

test("observer completes only on agent_end", async () => {
  const pi = new FakePi();
  const apollo = createApollo();
  installApolloSkillTurnObserver({ pi, apollo });

  await pi.emit("input", { text: "/skill:review check this" });
  await pi.emit("before_agent_start", { prompt: "expanded" });
  await pi.emit("tool_call", { toolCallId: "1", toolName: "Read" });
  await pi.emit("turn_end", {});

  assert.equal(apollo.skillRuns.current()?.status, "active");

  await pi.emit("agent_end", {});
  await new Promise((resolve) => setTimeout(resolve, 0));

  const [run] = apollo.skillRuns.all();
  assert.equal(run?.status, "completed");
  assert.equal(run?.analysis?.outcome, "completed");
  assert.deepEqual(pi.commandNames, ["apollo"]);
});
