import assert from "node:assert/strict";
import test from "node:test";
import { createApollo } from "../src/apollo.js";

test("recordSessionEvent redacts secret-like payload fields", async () => {
  const apollo = createApollo();
  await apollo.recordSessionEvent({
    type: "tool.called",
    sessionId: "s1",
    payload: { token: "abc123", nested: { message: "Bearer abcdefghijklmnopqrstuvwxyz123456" } },
  });
  const session = await apollo.store.getSession("s1");
  assert.equal(session?.events[0]?.payload?.token, "[REDACTED]");
  assert.match(String((session?.events[0]?.payload?.nested as { message: string }).message), /\[REDACTED\]/);
});
